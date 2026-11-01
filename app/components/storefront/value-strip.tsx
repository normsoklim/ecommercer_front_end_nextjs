import {
  CreditCard,
  Headphones,
  RotateCcw,
  Truck,
} from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Free shipping',
    description: 'On every order over $100',
  },
  {
    icon: RotateCcw,
    title: 'Easy returns',
    description: '30 days, no questions asked',
  },
  {
    icon: CreditCard,
    title: 'Secure checkout',
    description: 'Encrypted payments every time',
  },
  {
    icon: Headphones,
    title: 'Always here',
    description: 'Support seven days a week',
  },
];

export default function ValueStrip() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex items-center gap-4 bg-white px-5 py-6 transition-colors hover:bg-slate-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <benefit.icon size={20} />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                {benefit.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
