'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterDialog } from '@/app/components/storefront/register-dialog';


export default function RegisterPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    // Return to the page the customer came from when they dismiss the
    // registration dialog.
    router.back();
  };

  return (
    <RegisterDialog open={open} onOpenChange={handleClose} />
  );
}
