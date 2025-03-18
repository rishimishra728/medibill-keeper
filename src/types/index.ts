
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

// Update the AppContext types
export interface AppContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => Promise<string | undefined>; // Changed to return string | undefined
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  
  currentBill: {
    customerName: string;
    items: BillItem[];
  };
  setCustomerName: (name: string) => void;
  addItemToBill: (item: Omit<BillItem, 'medicineName'>) => void;
  removeItemFromBill: (medicineId: string) => void;
  updateBillItemQuantity: (medicineId: string, quantity: number) => void;
  clearCurrentBill: () => void;
  generateBill: () => Promise<string | undefined>; // Changed to return string | undefined
  processBillPayment: (paymentDetails: PaymentDetails) => Promise<boolean>;
  
  getLowStockMedicines: () => Medicine[];
  getExpiringMedicines: () => Medicine[];
  
  isLoading: boolean;
}
