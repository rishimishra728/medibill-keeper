import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, Bill, BillItem, PaymentDetails, AppContextType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [currentBill, setCurrentBill] = useState<{
    customerName: string;
    items: BillItem[];
  }>({
    customerName: '',
    items: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: medicinesData, error: medicinesError } = await supabase
          .from('medicines')
          .select('*');
        
        if (medicinesError) {
          throw medicinesError;
        }
        
        const formattedMedicines = medicinesData.map(med => ({
          id: med.id,
          name: med.name,
          description: med.description || '',
          price: Number(med.price),
          stock: med.stock,
          expiryDate: med.expiry_date,
          category: med.category || '',
          manufacturer: med.manufacturer || '',
        }));
        
        setMedicines(formattedMedicines);
        
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*');
        
        if (billsError) {
          throw billsError;
        }
        
        const billsWithItems = await Promise.all(
          billsData.map(async (bill) => {
            const { data: billItemsData, error: billItemsError } = await supabase
              .from('bill_items')
              .select('*, medicines(name)')
              .eq('bill_id', bill.id);
            
            if (billItemsError) {
              throw billItemsError;
            }
            
            const formattedItems = billItemsData.map(item => ({
              medicineId: item.medicine_id,
              quantity: item.quantity,
              price: Number(item.price),
              medicineName: item.medicines.name,
            }));
            
            return {
              id: bill.id,
              customerName: bill.customer_name,
              date: bill.date,
              items: formattedItems,
              totalAmount: Number(bill.total_amount),
              paid: bill.paid,
            };
          })
        );
        
        setBills(billsWithItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Data Loading Error",
          description: "Failed to load data from the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .insert({
          name: medicine.name,
          description: medicine.description,
          price: medicine.price,
          stock: medicine.stock,
          expiry_date: medicine.expiryDate,
          category: medicine.category,
          manufacturer: medicine.manufacturer,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newMedicine: Medicine = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: Number(data.price),
        stock: data.stock,
        expiryDate: data.expiry_date,
        category: data.category || '',
        manufacturer: data.manufacturer || '',
      };
      
      setMedicines((prev) => [...prev, newMedicine]);
      
      toast({
        title: "Medicine Added",
        description: `${medicine.name} has been added to inventory.`,
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast({
        title: "Error",
        description: "Failed to add medicine.",
        variant: "destructive",
      });
    }
  };

  const updateMedicine = async (medicine: Medicine) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          name: medicine.name,
          description: medicine.description,
          price: medicine.price,
          stock: medicine.stock,
          expiry_date: medicine.expiryDate,
          category: medicine.category,
          manufacturer: medicine.manufacturer,
        })
        .eq('id', medicine.id);
      
      if (error) throw error;
      
      setMedicines((prev) =>
        prev.map((item) => (item.id === medicine.id ? medicine : item))
      );
      
      toast({
        title: "Medicine Updated",
        description: `${medicine.name} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast({
        title: "Error",
        description: "Failed to update medicine.",
        variant: "destructive",
      });
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const medicine = medicines.find(m => m.id === id);
      
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMedicines((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: "Medicine Deleted",
        description: medicine ? `${medicine.name} has been removed.` : "Medicine has been removed.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast({
        title: "Error",
        description: "Failed to delete medicine.",
        variant: "destructive",
      });
    }
  };

  const addBill = async (bill: Omit<Bill, 'id'>): Promise<string | undefined> => {
    try {
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          customer_name: bill.customerName,
          date: bill.date,
          total_amount: bill.totalAmount,
          paid: bill.paid,
        })
        .select()
        .single();
      
      if (billError) throw billError;
      
      const billItemsToInsert = bill.items.map(item => ({
        bill_id: billData.id,
        medicine_id: item.medicineId,
        quantity: item.quantity,
        price: item.price,
      }));
      
      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(billItemsToInsert);
      
      if (itemsError) throw itemsError;
      
      const newBill: Bill = {
        id: billData.id,
        customerName: billData.customer_name,
        date: billData.date,
        items: bill.items,
        totalAmount: Number(billData.total_amount),
        paid: billData.paid,
      };
      
      setBills((prev) => [...prev, newBill]);
      
      toast({
        title: "Bill Generated",
        description: `Bill for ${bill.customerName} has been created.`,
      });
      
      return billData.id;
    } catch (error) {
      console.error('Error adding bill:', error);
      toast({
        title: "Error",
        description: "Failed to generate bill.",
        variant: "destructive",
      });
      return undefined;
    }
  };

  const updateBill = async (bill: Bill) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update({
          customer_name: bill.customerName,
          date: bill.date,
          total_amount: bill.totalAmount,
          paid: bill.paid,
        })
        .eq('id', bill.id);
      
      if (error) throw error;
      
      setBills((prev) =>
        prev.map((item) => (item.id === bill.id ? bill : item))
      );
      
      toast({
        title: "Bill Updated",
        description: `Bill for ${bill.customerName} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update bill.",
        variant: "destructive",
      });
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const bill = bills.find(b => b.id === id);
      
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setBills((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: "Bill Deleted",
        description: bill ? `Bill for ${bill.customerName} has been removed.` : "Bill has been removed.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete bill.",
        variant: "destructive",
      });
    }
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
    
    if (medicine.stock < item.quantity) {
      toast({
        title: "Error",
        description: `Not enough stock for ${medicine.name}. Only ${medicine.stock} available.`,
        variant: "destructive",
      });
      return;
    }
    
    const existingItemIndex = currentBill.items.findIndex(
      (i) => i.medicineId === item.medicineId
    );
    
    if (existingItemIndex !== -1) {
      const updatedItems = [...currentBill.items];
      const newQuantity = updatedItems[existingItemIndex].quantity + item.quantity;
      
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

  const processBillPayment = async (paymentDetails: PaymentDetails): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccessful = Math.random() < 0.9;
        
        if (isSuccessful) {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully.",
          });
        } else {
          toast({
            title: "Payment Failed",
            description: "Your payment could not be processed. Please try again.",
            variant: "destructive",
          });
        }
        
        resolve(isSuccessful);
      }, 1500);
    });
  };

  const generateBill = async (): Promise<string | undefined> => {
    if (!currentBill.customerName) {
      toast({
        title: "Error",
        description: "Please enter a customer name.",
        variant: "destructive",
      });
      return undefined;
    }
    
    if (currentBill.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the bill.",
        variant: "destructive",
      });
      return undefined;
    }
    
    const totalAmount = currentBill.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const newBill: Omit<Bill, 'id'> = {
      customerName: currentBill.customerName,
      date: new Date().toISOString(),
      items: currentBill.items,
      totalAmount,
      paid: false,
    };
    
    const billId = await addBill(newBill);
    
    for (const item of currentBill.items) {
      const medicine = medicines.find((m) => m.id === item.medicineId);
      if (medicine) {
        await updateMedicine({
          ...medicine,
          stock: medicine.stock - item.quantity,
        });
      }
    }
    
    clearCurrentBill();
    
    return billId;
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
        processBillPayment,
        
        getLowStockMedicines,
        getExpiringMedicines,
        
        isLoading,
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
