'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Heart,
  LogOut,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { apiFetch, type AuthUser } from '../lib/api';
import { useApiLoading } from '../lib/use-api-loading';
import type { CustomerOrder, PaginatedOrdersResponse } from '../lib/api-types';
import OrderStatusBadge from '../components/storefront/order-status-badge';
import { LoadingState } from '../components/storefront/loading-state';

/** The profile endpoint returns the roles as a list of assignments. */
type ProfileResponse = AuthUser & {
  userRoles?: { role?: { name?: string } | null }[] | null;
};

const money = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

const date = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={16} />
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, logout, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  // The orders were loaded flag.
  const [loaded, setLoaded] = useState<boolean>(false);
  // The full profile carries the fields the login response leaves out.
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  // Edit info form state.
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [editError, setEditError] = useState<string | null>(null);

  // Orders loading state via useApiLoading.
  const {
    data: ordersResponse,
    isLoading: ordersIsLoading,
    error: ordersError,
    errorMessage: ordersErrorMessage,
    load: loadOrders,
    reset: resetOrders,
  } = useApiLoading<PaginatedOrdersResponse>({
    initialData: { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } },
    immediate: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    if (!loaded) {
      void loadOrders('/orders?limit=20').then((response) => {
        if (cancelled) return;
        setOrders(response?.data ?? []);
        setOrderTotal(response?.meta.total ?? 0);
        setLoaded(true);
      });
    }

    apiFetch<ProfileResponse>('/auth/profile')
      .then((response) => {
        if (!cancelled) {
          setProfile(response);
          setEditFirstName(response.firstName ?? '');
          setEditLastName(response.lastName ?? '');
          setEditPhone(response.phone ?? '');
        }
      })
      .catch(() => {
        // The stored session is enough to render the page.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, loaded, loadOrders]);

  const ordersLoading = !loaded;

  const stats = useMemo(() => {
    const paid = orders.filter(
      (order) => order.status?.toUpperCase() !== 'CANCELLED',
    );
    const spent = paid.reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const onTheWay = orders.filter((order) =>
      ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(
        (order.status ?? '').toUpperCase(),
      ),
    ).length;

    return {
      orders: orderTotal,
      spent,
      onTheWay,
      points: Math.floor(spent / 100),
    };
  }, [orders, orderTotal]);

  const details = profile ?? user;
  const roleNames: string[] =
    profile?.userRoles
      ?.map((assignment) => assignment.role?.name)
      .filter((name): name is string => Boolean(name)) ??
    user?.roles ??
    [];
  const firstName = details?.firstName ?? '';
  const lastName = details?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'ShopEase member';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'S';

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditStatus('submitting');
    setEditError(null);
    try {
      await updateProfile({
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
        phone: editPhone.trim() || null,
      });
      setEditStatus('success');
      setIsEditing(false);
      // Refresh the profile to reflect changes.
      apiFetch<ProfileResponse>('/auth/profile').then((response) => {
        setProfile(response);
        setEditFirstName(response.firstName ?? '');
        setEditLastName(response.lastName ?? '');
        setEditPhone(response.phone ?? '');
      });
    } catch (error) {
      setEditStatus('error');
      setEditError(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        isLoading={true}
        error={null}
        data={null}
        loadingMessage="Loading your account..."
        spinnerSize={16}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50/60 px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <UserRound size={30} />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Follow your orders, keep your wishlist and check out faster with
            everything waiting for you.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
            >
              Sign in
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/60 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              My account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {firstName || "shopper"}
            </h1>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Profile card */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative isolate overflow-hidden bg-slate-950 px-6 py-8 text-white">
                <div
                  aria-hidden="true"
                  className="absolute -right-16 -top-16 -z-10 h-48 w-48 rounded-full bg-indigo-600/30 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-20 -left-10 -z-10 h-48 w-48 rounded-full bg-fuchsia-600/20 blur-3xl"
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-xl font-black text-white ring-1 ring-white/15 backdrop-blur">
                  {initials}
                </div>

                <h2 className="mt-5 text-xl font-bold tracking-tight">{fullName}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                  {details?.email}
                  {details?.emailVerified ? (
                    <BadgeCheck size={15} className="text-emerald-400" />
                  ) : null}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {roleNames.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90"
                    >
                      {role}
                    </span>
                  ))}
                  {!roleNames.length && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/90">
                      Customer
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setEditError(null);
                      setEditStatus('idle');
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 transition-colors hover:bg-white/20"
                  >
                    <span className="w-4 h-4">✎</span>
                    Edit info
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 px-6 py-2">
                <DetailRow
                  icon={Mail}
                  label="Email address"
                  value={details?.email ?? "-"}
                />
                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={details?.phone || "Not provided"}
                />
                <DetailRow
                  icon={Package}
                  label="Account status"
                  value={details?.status ?? "Active"}
                />
                <DetailRow
                  icon={CalendarDays}
                  label="Member since"
                  value={details?.createdAt ? date(details.createdAt) : "Today"}
                />
              </div>

              {isEditing && (
                <div className="px-6 py-4">
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        First name
                      </p>
                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Last name
                      </p>
                      <input
                        type="text"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Phone
                      </p>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Phone number"
                      />
                    </div>
                    {editError && (
                      <p className="text-sm text-rose-600">{editError}</p>
                    )}
                    {editStatus === 'success' && (
                      <p className="text-sm text-emerald-600">
                        Profile updated successfully.
                      </p>
                    )}
                    <div className="mt-4 flex gap-3">
                      <button
                        type="submit"
                        disabled={editStatus === 'submitting'}
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        {editStatus === 'submitting' ? 'Saving...' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditError(null);
                          setEditStatus('idle');
                        }}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </aside>

          {/* Dashboard */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <StatCard
                icon={ShoppingBag}
                label="Orders"
                value={ordersLoading ? "..." : String(stats.orders)}
                hint="Placed with your account"
              />
              <StatCard
                icon={Wallet}
                label="Total spent"
                value={ordersLoading ? "..." : money(stats.spent)}
                hint="Across your recent orders"
              />
              <StatCard
                icon={Truck}
                label="On the way"
                value={ordersLoading ? "..." : String(stats.onTheWay)}
                hint="Orders still in progress"
              />
              <StatCard
                icon={Sparkles}
                label="Reward points"
                value={ordersLoading ? "..." : String(stats.points)}
                hint="One point per dollar spent"
              />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold tracking-tight text-slate-950">
                  Recent orders
                </h2>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors hover:text-indigo-600"
                >
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              {ordersLoading ? (
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
                  <ShoppingBag size={32} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    No orders yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Your purchases will show up here.
                  </p>
                  <Link
                    href="/products"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-600"
                  >
                    Start shopping
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          #{order.orderNumber}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {date(order.createdAt)} ·{" "}
                          {order.items?.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          ) ?? 0}{" "}
                          items
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-sm font-bold text-slate-950">
                          {money(order.totalAmount)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-slate-950">
                Quick actions
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    href: "/products",
                    icon: ShoppingBag,
                    title: "Shop all products",
                    description: "Browse the latest collection",
                  },
                  {
                    href: "/wishlist",
                    icon: Heart,
                    title: "My wishlist",
                    description: "See the pieces you saved",
                  },
                  {
                    href: "/cart",
                    icon: ShoppingBag,
                    title: "Shopping cart",
                    description: "Review the items in your cart",
                  },
                  {
                    href: "/checkout",
                    icon: Truck,
                    title: "Checkout",
                    description: "Finish an order in a few steps",
                  },
                ].map((action) => (
                  <Link
                    key={action.href + action.title}
                    href={action.href}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      <action.icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-900">
                        {action.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {action.description}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600"
                    />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
