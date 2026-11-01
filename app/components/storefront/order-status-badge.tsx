const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-700 ring-sky-200',
  PROCESSING: 'bg-sky-50 text-sky-700 ring-sky-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
  REFUNDED: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

/** Small pill that shows the state of an order in a readable way. */
export default function OrderStatusBadge({ status }: { status: string }) {
  const key = (status ?? '').toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        statusStyles[key] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      {statusLabels[key] ?? status}
    </span>
  );
}
