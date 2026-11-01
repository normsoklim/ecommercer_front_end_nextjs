import { apiFetch } from './api';

export const ADDRESS_LABELS = ['Home', 'Office', 'Other'] as const;
export type AddressLabel = (typeof ADDRESS_LABELS)[number];

/** A delivery address the customer saved from the Google Maps picker. */
export type CustomerAddress = {
  id: string;
  userId: string;
  label: string;
  recipientPhone: string;
  addressLine?: string | null;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressInput = {
  label: AddressLabel;
  recipientPhone: string;
  addressLine?: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;

/** Reads all delivery addresses that belong to the signed in customer.
 * The session cookie is sent automatically by the browser. */
export async function fetchCustomerAddresses(): Promise<CustomerAddress[]> {
  return apiFetch<CustomerAddress[]>('/addresses');
}

/** Stores a delivery address that was picked on the Google map. */
export async function createCustomerAddress(
  input: CreateAddressInput,
): Promise<CustomerAddress> {
  return apiFetch<CustomerAddress>('/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Removes a delivery address of the signed in customer. */
export async function deleteCustomerAddress(
  id: string,
): Promise<void> {
  await apiFetch<void>(`/addresses/${id}`, {
    method: 'DELETE',
  });
}
