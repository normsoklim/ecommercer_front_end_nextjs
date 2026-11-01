'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Save } from 'lucide-react';
import {
  fetchDiscountByCode,
  fetchDiscounts,
  type Discount,
  type ShippingAddressInput,
} from '@/app/lib/checkout';
import {
  ADDRESS_LABELS,
  type AddressLabel,
  type CustomerAddress,
  type CreateAddressInput,
} from '@/app/lib/addresses';
import { SelectedAddress } from '@/app/components/address/GoogleAddressPicker';
import GoogleAddressPicker from '@/app/components/address/GoogleAddressPicker';

type AddressFormProps = {
  initialValues: ShippingAddressInput;
  couponCode: string;
  onCouponCodeChange: (value: string) => void;
  onSubmit: (address: ShippingAddressInput) => void;
  isSubmitting: boolean;
  savedAddresses?: CustomerAddress[];
  isLoadingSavedAddresses?: boolean;
  onSaveAddress?: (input: CreateAddressInput) => Promise<CustomerAddress | null>;
};

type FieldName = keyof ShippingAddressInput;
type AddressSource = 'saved' | 'manual';

const REQUIRED_FIELDS: FieldName[] = [
  'firstName',
  'lastName',
  'addressLine1',
  'phone',
];

const LABELS: Record<FieldName, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  addressLine1: 'Address',
  phone: 'Phone number',
  company: 'Company (optional)',
};

const PLACEHOLDERS: Record<FieldName, string> = {
  firstName: 'Jane',
  lastName: 'Doe',
  addressLine1: 'Street 253',
  phone: '+85512345678',
  company: 'ABC Company',
};

function Field({
  name,
  value,
  onChange,
  error,
}: {
  name: FieldName;
  value: string;
  onChange: (name: FieldName, value: string) => void;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">
        {LABELS[name]}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={PLACEHOLDERS[name]}
        className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
          error ? 'border-rose-300' : 'border-slate-200'
        }`}
      />
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

function formatDiscountValue(discount: Discount): string {
  if (discount.type === 'PERCENTAGE') {
    return `${discount.value}% off`;
  }

  return `$${(discount.value / 100).toFixed(2)} off`;
}

function getDiscountStatus(discount: Discount): string {
  const now = Date.now();
  const startsAt = new Date(discount.startsAt).getTime();

  if (!discount.isActive) {
    return 'Inactive';
  }

  if (!Number.isNaN(startsAt) && startsAt > now) {
    return 'Scheduled';
  }

  if (!Number.isNaN(startsAt) && startsAt < now) {
    return 'Expired';
  }

  return 'Active';
}

/** Builds a ShippingAddressInput from a saved customer address. */
function buildAddressFromSaved(
  address: CustomerAddress,
  initialValues: ShippingAddressInput,
): ShippingAddressInput {
  return {
    firstName: initialValues.firstName,
    lastName: initialValues.lastName,
    company: initialValues.company,
    addressLine1: address.addressLine ?? address.formattedAddress,
    phone: address.recipientPhone,
  };
}

export default function AddressForm({
  initialValues,
  couponCode,
  onCouponCodeChange,
  onSubmit,
  isSubmitting,
  savedAddresses,
  isLoadingSavedAddresses = false,
  onSaveAddress,
}: AddressFormProps) {
  const [values, setValues] = useState<ShippingAddressInput>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isDiscountLoading, setIsDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [availableDiscounts, setAvailableDiscounts] = useState<Discount[]>([]);
  const [isDiscountsLoading, setIsDiscountsLoading] = useState(false);

  const [pickedAddress, setPickedAddress] = useState<SelectedAddress | null>(
    null,
  );
  const [addressLabel, setAddressLabel] = useState<AddressLabel>('Home');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedCustomerAddressId, setSelectedCustomerAddressId] =
    useState<string | null>(null);
  const [addressSource, setAddressSource] = useState<AddressSource>(
    savedAddresses && savedAddresses.length > 0 ? 'saved' : 'manual',
  );

  useEffect(() => {
    let cancelled = false;

    setIsDiscountsLoading(true);

    fetchDiscounts()
      .then((discounts) => {
        if (!cancelled) {
          setAvailableDiscounts(discounts);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailableDiscounts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsDiscountsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleCouponChange = (value: string) => {
    onCouponCodeChange(value);

    if (!value.trim()) {
      setDiscount(null);
      setDiscountError(null);
    }
  };

  const handleCouponSelect = (value: string) => {
    onCouponCodeChange(value);

    if (!value.trim()) {
      setDiscount(null);
      setDiscountError(null);
      return;
    }

    const selected = availableDiscounts.find((d) => d.code === value);

    if (selected) {
      setDiscount(selected);
      setDiscountError(null);
    } else {
      setDiscount(null);
      setDiscountError('The selected coupon is not valid.');
    }
  };

  /** Stores a freshly picked map location as a saved delivery address. */
  const handleSaveAddress = async () => {
    if (!pickedAddress) {
      setAddressError('Select an address on the map first.');
      return;
    }

    if (!onSaveAddress) {
      setAddressError('Saving addresses is not available right now.');
      return;
    }

    setIsSavingAddress(true);
    setAddressError(null);

    try {
      const saved = await onSaveAddress({
        label: addressLabel,
        recipientPhone: values.phone.trim(),
        addressLine: pickedAddress.addressLine,
        formattedAddress: pickedAddress.formattedAddress,
        latitude: pickedAddress.latitude,
        longitude: pickedAddress.longitude,
        placeId: pickedAddress.placeId,
        isDefault:
          savedAddresses?.find((address) => address.label === addressLabel)
            ?.isDefault ?? false,
      });

      if (!saved) {
        setAddressError('The address could not be saved.');
        return;
      }

      setPickedAddress(null);
      setSelectedCustomerAddressId(saved.id);
      setValues((current) => ({
        ...current,
        addressLine1: saved.addressLine ?? saved.formattedAddress,
        phone: saved.recipientPhone,
      }));
    } catch (err) {
      setAddressError(
        err instanceof Error && err.message
          ? err.message
          : 'The address could not be saved.',
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  /** Copies a saved delivery address into the checkout form. */
  const handleUseSavedAddress = (address: CustomerAddress) => {
    setSelectedCustomerAddressId(address.id);
    setValues(buildAddressFromSaved(address, initialValues));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<FieldName, string>> = {};

    for (const field of REQUIRED_FIELDS) {
      if (!values[field]?.trim()) {
        nextErrors[field] = `${LABELS[field].replace(' (optional)', '')} is required`;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const cleaned: ShippingAddressInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      addressLine1: values.addressLine1.trim(),
      phone: values.phone.trim(),
    };

    onSubmit(cleaned);
  };

  const hasSavedAddresses = Boolean(savedAddresses && savedAddresses.length > 0);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-950">Shipping address</h2>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-600">
          Choose delivery address
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="addressSource"
              value="saved"
              checked={addressSource === 'saved'}
              onChange={() => {
                if (hasSavedAddresses) {
                  setAddressSource('saved');
                }
              }}
              disabled={!hasSavedAddresses}
              className="h-4 w-4 rounded-full border-slate-200 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Select a saved address
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="addressSource"
              value="manual"
              checked={addressSource === 'manual'}
              onChange={() => setAddressSource('manual')}
              className="h-4 w-4 rounded-full border-slate-200 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Enter address manually
            </span>
          </label>
        </div>
        {!hasSavedAddresses && (
          <p className="mt-2 text-xs text-slate-500">
            No saved addresses yet. Enter your delivery address below.
          </p>
        )}
      </div>

      {addressSource === 'saved' && hasSavedAddresses && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-600">
            Saved delivery addresses
          </h3>
          <ul className="mt-3 space-y-2">
            {savedAddresses!.map((address) => (
              <li key={address.id}>
                <label
                  className="block cursor-pointer"
                  onClick={() => handleUseSavedAddress(address)}
                >
                  <div
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      selectedCustomerAddressId === address.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{address.label}</span>
                      {selectedCustomerAddressId === address.id && (
                        <span className="text-xs text-indigo-600">Selected</span>
                      )}
                    </div>
                    <span className="mt-1 block text-xs text-slate-500">
                      {address.formattedAddress}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {address.recipientPhone}
                    </span>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {addressSource === 'manual' && (
        <>
          <div className="mt-6">
            <GoogleAddressPicker onSelect={setPickedAddress} />
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block sm:w-56">
              <span className="text-xs font-semibold text-slate-600">
                Address label
              </span>
              <select
                value={addressLabel}
                onChange={(event) =>
                  setAddressLabel(event.target.value as AddressLabel)
                }
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {ADDRESS_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => void handleSaveAddress()}
              disabled={isSavingAddress || !pickedAddress}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingAddress && <Loader2 size={16} className="animate-spin" />}
              <Save size={16} />
              {isSavingAddress ? 'Saving...' : 'Save this delivery address'}
            </button>
          </div>

          {addressError && <p className="mt-3 text-sm text-rose-600">{addressError}</p>}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              name="firstName"
              value={values.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <Field
              name="lastName"
              value={values.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
            <div className="sm:col-span-2">
              <Field
                name="addressLine1"
                value={values.addressLine1}
                onChange={handleChange}
                error={errors.addressLine1}
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                name="phone"
                value={values.phone}
                onChange={handleChange}
                error={errors.phone}
              />
            </div>
          </div>
        </>
      )}

      <div className="mt-6 border-t border-slate-100 pt-6">
        <label className="block">
          <span className="text-xs font-semibold text-slate-600">
            Discount code (optional)
          </span>
          <select
            value={couponCode}
            onChange={(event) => handleCouponSelect(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">No coupon</option>
            {availableDiscounts.map((discount) => (
              <option key={discount.id} value={discount.code}>
                {discount.code} ({formatDiscountValue(discount)} off)
              </option>
            ))}
          </select>
        </label>

        {isDiscountsLoading && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Loader2 size={14} className="animate-spin" />
            Loading available coupons...
          </div>
        )}

        {!isDiscountLoading && discountError && (
          <span className="mt-2 block text-xs text-rose-600">{discountError}</span>
        )}

        {!isDiscountLoading && discount && !discountError && (
          <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-emerald-700">
                {discount.code}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                {getDiscountStatus(discount)}
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              {formatDiscountValue(discount)} off your order
            </p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Placing your order...' : 'Continue to payment'}
      </button>
    </form>
  );
}
