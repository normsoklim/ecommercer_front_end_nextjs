'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoginDialog } from '@/app/components/storefront/login-dialog';


function LoginDialogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const wasVerified = searchParams.get('verified') === '1';
  const email = searchParams.get('email') ?? '';

  const handleClose = () => {
    setOpen(false);
    // Return to the page the customer came from (e.g. the product detail
    // page) when they dismiss the sign-in dialog.
    router.back();
  };

  return (
    <LoginDialog
      open={open}
      onOpenChange={handleClose}
      showVerifiedAlert={wasVerified}
      defaultEmail={email}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50/60 px-4 py-16 text-center text-sm text-slate-500 sm:px-6 lg:px-10">
          Loading...
        </div>
      }
    >
      <LoginDialogContent />
    </Suspense>
  );
}
