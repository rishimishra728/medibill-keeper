
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
  customerId?: string;
  date: string;
  items: BillItem[];
  totalAmount: number;
  discountAmount: number;
  paid: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  visitCount: number;
  totalSpent: number;
  lastVisit: string;
  createdAt: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

// AppContext types
export interface AppContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => Promise<string | undefined>;
  updateBill: (bill: Bill) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'visitCount' | 'totalSpent' | 'lastVisit' | 'createdAt'>) => Promise<string>;
  updateCustomer: (customer: Customer) => Promise<void>;
  getCustomerByName: (name: string) => Promise<Customer | null>;
  
  currentBill: {
    customerName: string;
    customerId?: string;
    items: BillItem[];
    discountAmount: number;
  };
  setCustomerName: (name: string) => void;
  setCustomerId: (id: string | undefined) => void;
  setDiscountAmount: (amount: number) => void;
  addItemToBill: (item: Omit<BillItem, 'medicineName'>) => void;
  removeItemFromBill: (medicineId: string) => void;
  updateBillItemQuantity: (medicineId: string, quantity: number) => void;
  clearCurrentBill: () => void;
  generateBill: (isPaid: boolean) => Promise<string | undefined>;
  
  getLowStockMedicines: () => Medicine[];
  getExpiringMedicines: () => Medicine[];
  getTopCustomers: (limit?: number) => Customer[];
  
  isLoading: boolean;
}
