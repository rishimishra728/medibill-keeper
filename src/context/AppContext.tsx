import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine, Bill, BillItem, Customer, AppContextType } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentBill, setCurrentBill] = useState<{
    customerName: string;
    customerId?: string;
    items: BillItem[];
    discountAmount: number;
  }>({
    customerName: '',
    customerId: undefined,
    items: [],
    discountAmount: 0,
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
        
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*');
        
        if (customersError) {
          throw customersError;
        }
        
        const formattedCustomers = customersData.map(customer => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          visitCount: customer.visit_count,
          totalSpent: Number(customer.total_spent),
          lastVisit: customer.last_visit,
          createdAt: customer.created_at,
        }));
        
        setCustomers(formattedCustomers);
        
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
              customerId: bill.customer_id,
              date: bill.date,
              items: formattedItems,
              totalAmount: Number(bill.total_amount),
              discountAmount: Number(bill.discount_amount || 0),
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

  const addCustomer = async (customer: Omit<Customer, 'id' | 'visitCount' | 'totalSpent' | 'lastVisit' | 'createdAt'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newCustomer: Customer = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        visitCount: data.visit_count,
        totalSpent: Number(data.total_spent),
        lastVisit: data.last_visit,
        createdAt: data.created_at,
      };
      
      setCustomers((prev) => [...prev, newCustomer]);
      
      toast({
        title: "Customer Added",
        description: `${customer.name} has been added to the database.`,
      });
      
      return data.id;
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          visit_count: customer.visitCount,
          total_spent: customer.totalSpent,
          last_visit: customer.lastVisit,
        })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      setCustomers((prev) =>
        prev.map((item) => (item.id === customer.id ? customer : item))
      );
      
      toast({
        title: "Customer Updated",
        description: `${customer.name}'s information has been updated.`,
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Error",
        description: "Failed to update customer.",
        variant: "destructive",
      });
    }
  };

  const getCustomerByName = async (name: string): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .ilike('name', `%${name}%`)
        .limit(1);
      
      if (error) throw error;
      
      if (data.length === 0) return null;
      
      return {
        id: data[0].id,
        name: data[0].name,
        phone: data[0].phone,
        email: data[0].email,
        visitCount: data[0].visit_count,
        totalSpent: Number(data[0].total_spent),
        lastVisit: data[0].last_visit,
        createdAt: data[0].created_at,
      };
    } catch (error) {
      console.error('Error finding customer:', error);
      return null;
    }
  };

  const addBill = async (bill: Omit<Bill, 'id'>): Promise<string | undefined> => {
    try {
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          customer_name: bill.customerName,
          customer_id: bill.customerId,
          date: bill.date,
          total_amount: bill.totalAmount,
          discount_amount: bill.discountAmount,
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
      
      if (bill.customerId) {
        const customer = customers.find(c => c.id === bill.customerId);
        if (customer) {
          const updatedCustomer = {
            ...customer,
            visitCount: customer.visitCount + 1,
            totalSpent: customer.totalSpent + bill.totalAmount,
            lastVisit: bill.date,
          };
          
          await updateCustomer(updatedCustomer);
        }
      }
      
      const newBill: Bill = {
        id: billData.id,
        customerName: billData.customer_name,
        customerId: billData.customer_id,
        date: billData.date,
        items: bill.items,
        totalAmount: Number(billData.total_amount),
        discountAmount: Number(billData.discount_amount),
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
          discount_amount: bill.discountAmount,
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

  const setCustomerId = (id: string | undefined) => {
    setCurrentBill((prev) => ({ ...prev, customerId: id }));
  };

  const setDiscountAmount = (amount: number) => {
    setCurrentBill((prev) => ({ ...prev, discountAmount: amount }));
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
      customerId: undefined,
      items: [],
      discountAmount: 0,
    });
  };

  const generateBill = async (isPaid: boolean): Promise<string | undefined> => {
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
    
    let customerId = currentBill.customerId;
    
    if (!customerId && currentBill.customerName) {
      const existingCustomer = await getCustomerByName(currentBill.customerName);
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        try {
          customerId = await addCustomer({ name: currentBill.customerName });
        } catch (error) {
          console.error('Error creating customer:', error);
        }
      }
    }
    
    const totalBeforeDiscount = currentBill.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const totalAmount = Math.max(0, totalBeforeDiscount - currentBill.discountAmount);
    
    const newBill: Omit<Bill, 'id'> = {
      customerName: currentBill.customerName,
      customerId,
      date: new Date().toISOString(),
      items: currentBill.items,
      totalAmount,
      discountAmount: currentBill.discountAmount,
      paid: isPaid,
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

  const getTopCustomers = (limit = 5) => {
    return customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
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
        
        customers,
        addCustomer,
        updateCustomer,
        getCustomerByName,
        
        currentBill,
        setCustomerName,
        setCustomerId,
        setDiscountAmount,
        addItemToBill,
        removeItemFromBill,
        updateBillItemQuantity,
        clearCurrentBill,
        generateBill,
        
        getLowStockMedicines,
        getExpiringMedicines,
        getTopCustomers,
        
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
