
export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  expiryDate: string;
  category: string;
  manufacturer: string;
}

export interface BillItem {
  medicineId: string;
  quantity: number;
  price: number;
  medicineName: string;
}

export interface Bill {
  id: string;
  customerName: string;
  date: string;
  items: BillItem[];
  totalAmount: number;
  paid: boolean;
}

// Payment types
export interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}
