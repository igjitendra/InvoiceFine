export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  stateCode: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  stateName: string | null;
  pincode: string | null;
  notes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = {
  name: string;
  phone: string;
  email: string;
  gstin: string;
  stateCode: string;
  billingAddress: string;
  shippingAddress: string;
  stateName: string;
  pincode: string;
  notes: string;
};
