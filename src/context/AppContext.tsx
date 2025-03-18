
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, Bill, BillItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// Mock data
const initialMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    description: 'Pain reliever and fever reducer',
    price: 5.99,
    stock: 100,
    expiryDate: '2025-12-31',
    category: 'Pain Relief',
    manufacturer: 'MedPharm',
  },
  {
    id: '2',
    name: 'Amoxicillin',
    description: 'Antibiotic for bacterial infections',
    price: 12.50,
    stock: 50,
    expiryDate: '2024-10-15',
    category: 'Antibiotics',
    manufacturer: 'HealthCare',
  },
  {
    id: '3',
    name: 'Loratadine',
    description: 'Antihistamine for allergy relief',
    price: 8.75,
    stock: 75,
    expiryDate: '2025-06-30',
    category: 'Allergy',
    manufacturer: 'AllergyCare',
  },
  {
    id: '4',
    name: 'Metformin',
    description: 'Oral diabetes medicine',
    price: 15.25,
    stock: 40,
    expiryDate: '2024-08-20',
    category: 'Diabetes',
    manufacturer: 'DiabetesCare',
  },
  {
    id: '5',
    name: 'Lisinopril',
    description: 'ACE inhibitor for high blood pressure',
    price: 18.99,
    stock: 30,
    expiryDate: '2024-12-15',
    category: 'Blood Pressure',
    manufacturer: 'CardioHealth',
  },
  {
    id: '6',
    name: 'Ibuprofen',
    description: 'NSAID for pain and inflammation',
    price: 6.50,
    stock: 85,
    expiryDate: '2025-04-10',
    category: 'Pain Relief',
    manufacturer: 'PainFree',
  },
  {
    id: '7',
    name: 'Cetirizine',
    description: 'Antihistamine for allergies',
    price: 9.25,
    stock: 5,
    expiryDate: '2024-11-22',
    category: 'Allergy',
    manufacturer: 'AllergyCare',
  },
];

const initialBills: Bill[] = [
  {
    id: '1',
    customerName: 'John Doe',
    date: '2023-11-05',
    items: [
      {
        medicineId: '1',
        quantity: 2,
        price: 5.99,
        medicineName: 'Paracetamol',
      },
      {
        medicineId: '3',
        quantity: 1,
        price: 8.75,
        medicineName: 'Loratadine',
      },
    ],
    totalAmount: 20.73,
    paid: true,
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    date: '2023-11-10',
    items: [
      {
        medicineId: '2',
        quantity: 1,
        price: 12.50,
        medicineName: 'Amoxicillin',
      },
    ],
    totalAmount: 12.50,
    paid: false,
  },
];

interface AppContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (id: string) => void;
  
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (bill: Bill) => void;
  deleteBill: (id: string) => void;
  
  currentBill: {
    customerName: string;
    items: BillItem[];
  };
  setCustomerName: (name: string) => void;
  addItemToBill: (item: Omit<BillItem, 'medicineName'>) => void;
  removeItemFromBill: (medicineId: string) => void;
  updateBillItemQuantity: (medicineId: string, quantity: number) => void;
  clearCurrentBill: () => void;
  generateBill: () => void;
  
  getLowStockMedicines: () => Medicine[];
  getExpiringMedicines: () => Medicine[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [currentBill, setCurrentBill] = useState<{
    customerName: string;
    items: BillItem[];
  }>({
    customerName: '',
    items: [],
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedMedicines = localStorage.getItem('medicines');
    const storedBills = localStorage.getItem('bills');
    
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    }
    
    if (storedBills) {
      setBills(JSON.parse(storedBills));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('bills', JSON.stringify(bills));
  }, [bills]);

  const addMedicine = (medicine: Omit<Medicine, 'id'>) => {
    const newMedicine = { ...medicine, id: uuidv4() };
    setMedicines((prev) => [...prev, newMedicine]);
    toast({
      title: "Medicine Added",
      description: `${medicine.name} has been added to inventory.`,
    });
  };

  const updateMedicine = (medicine: Medicine) => {
    setMedicines((prev) =>
      prev.map((item) => (item.id === medicine.id ? medicine : item))
    );
    toast({
      title: "Medicine Updated",
      description: `${medicine.name} has been updated.`,
    });
  };

  const deleteMedicine = (id: string) => {
    const medicine = medicines.find(m => m.id === id);
    setMedicines((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Medicine Deleted",
      description: medicine ? `${medicine.name} has been removed.` : "Medicine has been removed.",
      variant: "destructive",
    });
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill = { ...bill, id: uuidv4() };
    setBills((prev) => [...prev, newBill]);
    toast({
      title: "Bill Generated",
      description: `Bill for ${bill.customerName} has been created.`,
    });
  };

  const updateBill = (bill: Bill) => {
    setBills((prev) =>
      prev.map((item) => (item.id === bill.id ? bill : item))
    );
    toast({
      title: "Bill Updated",
      description: `Bill for ${bill.customerName} has been updated.`,
    });
  };

  const deleteBill = (id: string) => {
    const bill = bills.find(b => b.id === id);
    setBills((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Bill Deleted",
      description: bill ? `Bill for ${bill.customerName} has been removed.` : "Bill has been removed.",
      variant: "destructive",
    });
  };

  const setCustomerName = (name: string) => {
    setCurrentBill((prev) => ({ ...prev, customerName: name }));
  };

  const addItemToBill = (item: Omit<BillItem, 'medicineName'>) => {
    const medicine = medicines.find((m) => m.id === item.medicineId);
    
    if (!medicine) {
      toast({
        title: "Error",
        description: "Medicine not found.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we have enough stock
    if (medicine.stock < item.quantity) {
      toast({
        title: "Error",
        description: `Not enough stock for ${medicine.name}. Only ${medicine.stock} available.`,
        variant: "destructive",
      });
      return;
    }
    
    // Check if the item already exists in the bill
    const existingItemIndex = currentBill.items.findIndex(
      (i) => i.medicineId === item.medicineId
    );
    
    if (existingItemIndex !== -1) {
      // Update the quantity of the existing item
      const updatedItems = [...currentBill.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + item.quantity;
      
      // Check if the new quantity exceeds the stock
      if (newQuantity > medicine.stock) {
        toast({
          title: "Error",
          description: `Not enough stock for ${medicine.name}. Only ${medicine.stock} available.`,
          variant: "destructive",
        });
        return;
      }
      
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
      };
      
      setCurrentBill((prev) => ({ ...prev, items: updatedItems }));
    } else {
      // Add a new item to the bill
      setCurrentBill((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            ...item,
            medicineName: medicine.name,
          },
        ],
      }));
    }
  };

  const removeItemFromBill = (medicineId: string) => {
    setCurrentBill((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.medicineId !== medicineId),
    }));
  };

  const updateBillItemQuantity = (medicineId: string, quantity: number) => {
    const medicine = medicines.find((m) => m.id === medicineId);
    
    if (!medicine) {
      toast({
        title: "Error",
        description: "Medicine not found.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we have enough stock
    if (medicine.stock < quantity) {
      toast({
        title: "Error",
        description: `Not enough stock for ${medicine.name}. Only ${medicine.stock} available.`,
        variant: "destructive",
      });
      return;
    }
    
    setCurrentBill((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity } : item
      ),
    }));
  };

  const clearCurrentBill = () => {
    setCurrentBill({
      customerName: '',
      items: [],
    });
  };

  const generateBill = () => {
    if (!currentBill.customerName) {
      toast({
        title: "Error",
        description: "Please enter a customer name.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentBill.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the bill.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate the total amount
    const totalAmount = currentBill.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    // Create a new bill
    const newBill: Omit<Bill, 'id'> = {
      customerName: currentBill.customerName,
      date: new Date().toISOString().split('T')[0],
      items: currentBill.items,
      totalAmount,
      paid: false,
    };
    
    // Add the bill
    addBill(newBill);
    
    // Update the stock levels
    currentBill.items.forEach((item) => {
      const medicine = medicines.find((m) => m.id === item.medicineId);
      if (medicine) {
        updateMedicine({
          ...medicine,
          stock: medicine.stock - item.quantity,
        });
      }
    });
    
    // Clear the current bill
    clearCurrentBill();
  };

  const getLowStockMedicines = () => {
    return medicines.filter((medicine) => medicine.stock <= 10);
  };

  const getExpiringMedicines = () => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    return medicines.filter((medicine) => {
      const expiryDate = new Date(medicine.expiryDate);
      return expiryDate <= threeMonthsFromNow;
    });
  };

  return (
    <AppContext.Provider
      value={{
        medicines,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        
        bills,
        addBill,
        updateBill,
        deleteBill,
        
        currentBill,
        setCustomerName,
        addItemToBill,
        removeItemFromBill,
        updateBillItemQuantity,
        clearCurrentBill,
        generateBill,
        
        getLowStockMedicines,
        getExpiringMedicines,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
