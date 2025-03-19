import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Trash2, Plus, FileText, Search } from 'lucide-react';
import { Bill, Customer } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

const Billing = () => {
  const {
    medicines,
    bills,
    customers,
    currentBill,
    setCustomerName,
    setCustomerId,
    setDiscountAmount,
    addItemToBill,
    removeItemFromBill,
    updateBillItemQuantity,
    clearCurrentBill,
    generateBill,
    updateBill,
    deleteBill,
    getCustomerByName,
    isLoading,
  } = useAppContext();

  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [isPaidBillDialogOpen, setIsPaidBillDialogOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  
  const paidBills = bills.filter(bill => bill.paid);
  const unpaidBills = bills.filter(bill => !bill.paid);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'paid') return matchesSearch && bill.paid;
    if (selectedTab === 'unpaid') return matchesSearch && !bill.paid;
    
    return matchesSearch;
  });

  const handleAddItem = () => {
    if (!selectedMedicineId) return;
    
    const medicine = medicines.find((m) => m.id === selectedMedicineId);
    if (!medicine) return;
    
    addItemToBill({
      medicineId: selectedMedicineId,
      quantity: quantity,
      price: medicine.price,
    });
    
    setSelectedMedicineId('');
    setQuantity(1);
  };

  const handleQuantityChange = (medicineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateBillItemQuantity(medicineId, newQuantity);
  };

  const calculateSubtotal = () => {
    return currentBill.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - currentBill.discountAmount);
  };

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsViewBillOpen(true);
  };

  const handleGenerateBill = async () => {
    setIsPaidBillDialogOpen(true);
  };

  const confirmGenerateBill = async (isPaid: boolean) => {
    setIsPaidBillDialogOpen(false);
    await generateBill(isPaid);
  };

  const handleMarkAsPaid = async (bill: Bill) => {
    await updateBill({
      ...bill,
      paid: true
    });
    
    toast({
      title: "Bill Updated",
      description: "Bill has been marked as paid.",
    });
    
    if (isViewBillOpen) {
      setIsViewBillOpen(false);
    }
  };

  const printBill = (bill: Bill) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .bill-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MediBill Receipt</h1>
        </div>
        
        <div class="bill-info">
          <p><strong>Customer:</strong> ${bill.customerName}</p>
          <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
          <p><strong>Bill #:</strong> ${bill.id}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items
              .map(
                (item) => `
              <tr>
                <td>${item.medicineName}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        
        <div class="total">
          ${bill.discountAmount > 0 ? 
            `<p>Subtotal: ₹${(bill.totalAmount + bill.discountAmount).toFixed(2)}</p>
             <p>Discount: ₹${bill.discountAmount.toFixed(2)}</p>` : ''}
          <p>Total Amount: ₹${bill.totalAmount.toFixed(2)}</p>
          <p>Status: ${bill.paid ? 'Paid' : 'Unpaid'}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCustomerSearch = async (value: string) => {
    setCustomerSearchTerm(value);
    setCustomerName(value);
    
    if (value.length < 2) {
      setCustomerSuggestions([]);
      setCustomerId(undefined);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .ilike('name', `%${value}%`)
        .limit(5);
      
      if (error) throw error;
      
      const formattedCustomers = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        visitCount: customer.visit_count,
        totalSpent: Number(customer.total_spent),
        lastVisit: customer.last_visit,
        createdAt: customer.created_at,
      }));
      
      setCustomerSuggestions(formattedCustomers);
    } catch (error) {
      console.error('Error searching for customers:', error);
      setCustomerSuggestions([]);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerId(customer.id);
    setCustomerSuggestions([]);
    setCustomerSearchTerm('');
    
    // If customer has more than 5 visits, suggest a discount
    if (customer.visitCount > 5) {
      toast({
        title: "Frequent Customer",
        description: `${customer.name} is a frequent customer with ${customer.visitCount} visits. Consider offering a discount.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing System</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={customerSearchTerm || currentBill.customerName}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  placeholder="Enter or search customer name"
                />
                
                {customerSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                    {customerSuggestions.map((customer) => (
                      <div
                        key={customer.id}
                        className="px-4 py-2 hover:bg-muted cursor-pointer flex justify-between"
                        onClick={() => selectCustomer(customer)}
                      >
                        <span>{customer.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Visits: {customer.visitCount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <Label htmlFor="medicine">Medicine</Label>
                  <Select
                    value={selectedMedicineId}
                    onValueChange={setSelectedMedicineId}
                  >
                    <SelectTrigger id="medicine">
                      <SelectValue placeholder="Select Medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id}>
                          {medicine.name} - ₹{medicine.price.toFixed(2)} ({medicine.stock} left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-24">
                  <Label htmlFor="quantity">Qty</Label>
                  <div className="flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-r-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="h-10 rounded-none text-center"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-l-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="self-end">
                  <Button onClick={handleAddItem} disabled={!selectedMedicineId}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md max-h-[300px] overflow-y-auto">
                {currentBill.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentBill.items.map((item) => (
                        <TableRow key={item.medicineId}>
                          <TableCell>{item.medicineName}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleQuantityChange(item.medicineId, item.quantity - 1)
                                }
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  handleQuantityChange(item.medicineId, item.quantity + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItemFromBill(item.medicineId)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No items added to bill yet
                  </div>
                )}
              </div>
              
              {currentBill.items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="discount">Discount Amount</Label>
                    <div className="text-sm text-muted-foreground">
                      Subtotal: ₹{calculateSubtotal().toFixed(2)}
                    </div>
                  </div>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentBill.discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter discount amount"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-lg font-bold">
                  Total: ₹{calculateTotal().toFixed(2)}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={clearCurrentBill}>
                    Clear
                  </Button>
                  <Button
                    onClick={handleGenerateBill}
                    disabled={currentBill.items.length === 0 || !currentBill.customerName}
                  >
                    Generate Bill
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Bill History</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="all">All Bills ({bills.length})</TabsTrigger>
                <TabsTrigger value="paid">Paid ({paidBills.length})</TabsTrigger>
                <TabsTrigger value="unpaid">Unpaid ({unpaidBills.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <BillsList
                  bills={filteredBills}
                  onBillClick={handleBillClick}
                  onPrintBill={printBill}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              </TabsContent>
              
              <TabsContent value="paid" className="mt-0">
                <BillsList
                  bills={filteredBills.filter(bill => bill.paid)}
                  onBillClick={handleBillClick}
                  onPrintBill={printBill}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              </TabsContent>
              
              <TabsContent value="unpaid" className="mt-0">
                <BillsList
                  bills={filteredBills.filter(bill => !bill.paid)}
                  onBillClick={handleBillClick}
                  onPrintBill={printBill}
                  onMarkAsPaid={handleMarkAsPaid}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isViewBillOpen} onOpenChange={setIsViewBillOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>
              {selectedBill && `Bill #${selectedBill.id} for ${selectedBill.customerName}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedBill.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedBill.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p
                    className={`font-medium ${
                      selectedBill.paid ? 'text-green-600' : 'text-amber-600'
                    }`}
                  >
                    {selectedBill.paid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBill.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.medicineName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ₹{item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {selectedBill.discountAmount > 0 && (
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Subtotal: ₹{(selectedBill.totalAmount + selectedBill.discountAmount).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Discount: ₹{selectedBill.discountAmount.toFixed(2)}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <div className="text-lg font-bold">
                  Total: ₹{selectedBill.totalAmount.toFixed(2)}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => printBill(selectedBill)}
                  >
                    <Printer className="h-4 w-4 mr-1" /> Print
                  </Button>
                  {!selectedBill.paid && (
                    <Button onClick={() => handleMarkAsPaid(selectedBill)}>
                      Mark as Paid
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isPaidBillDialogOpen} onOpenChange={setIsPaidBillDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Status</DialogTitle>
            <DialogDescription>
              Is this bill being paid now or will it be paid later?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => confirmGenerateBill(false)}
            >
              Unpaid (Pay Later)
            </Button>
            <Button 
              onClick={() => confirmGenerateBill(true)}
            >
              Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Bills list component
const BillsList = ({ 
  bills, 
  onBillClick, 
  onPrintBill, 
  onMarkAsPaid 
}: { 
  bills: Bill[]; 
  onBillClick: (bill: Bill) => void;
  onPrintBill: (bill: Bill) => void;
  onMarkAsPaid: (bill: Bill) => void;
}) => {
  return (
    <div className="border rounded-md max-h-[450px] overflow-y-auto">
      {bills.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.customerName}</TableCell>
                <TableCell>
                  {new Date(bill.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  ₹{bill.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      bill.paid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {bill.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onBillClick(bill)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPrintBill(bill)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    {!bill.paid && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMarkAsPaid(bill)}
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          No bills found
        </div>
      )}
    </div>
  );
};

export default Billing;
