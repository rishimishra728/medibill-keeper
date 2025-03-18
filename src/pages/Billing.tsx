
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Trash2, Plus, FileText, Search, CreditCard } from 'lucide-react';
import { Bill, PaymentDetails } from '@/types';
import PaymentModal from '@/components/PaymentModal';
import { toast } from '@/hooks/use-toast';

const Billing = () => {
  const {
    medicines,
    bills,
    currentBill,
    setCustomerName,
    addItemToBill,
    removeItemFromBill,
    updateBillItemQuantity,
    clearCurrentBill,
    generateBill,
    updateBill,
    deleteBill,
    processBillPayment,
    isLoading,
  } = useAppContext();

  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isViewBillOpen, setIsViewBillOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<Bill | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredBills = bills.filter((bill) => {
    return bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
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
    
    // Reset the form
    setSelectedMedicineId('');
    setQuantity(1);
  };

  const handleQuantityChange = (medicineId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateBillItemQuantity(medicineId, newQuantity);
  };

  const calculateTotal = () => {
    return currentBill.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleBillClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsViewBillOpen(true);
  };

  const handleGenerateBill = async () => {
    const billId = await generateBill();
    if (billId) {
      // Find the newly created bill and open payment modal
      const newBill = bills.find(b => b.id === billId);
      if (newBill) {
        setBillToPay(newBill);
        setIsPaymentModalOpen(true);
      }
    }
  };

  const handlePaymentComplete = async (success: boolean) => {
    if (success && billToPay) {
      // Update bill as paid in database
      await updateBill({
        ...billToPay,
        paid: true
      });
    }
    
    // Reset the bill to pay
    setBillToPay(null);
  };

  const handlePayBill = (bill: Bill) => {
    setBillToPay(bill);
    setIsPaymentModalOpen(true);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Bill Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={currentBill.customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
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
        
        {/* Bill History Section */}
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
            <div className="border rounded-md max-h-[450px] overflow-y-auto">
              {filteredBills.length > 0 ? (
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
                    {filteredBills.map((bill) => (
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
                              onClick={() => handleBillClick(bill)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => printBill(bill)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            {!bill.paid && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePayBill(bill)}
                              >
                                <CreditCard className="h-4 w-4" />
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
          </CardContent>
        </Card>
      </div>
      
      {/* View Bill Dialog */}
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
                    <Button onClick={() => {
                      setIsViewBillOpen(false);
                      setBillToPay(selectedBill);
                      setIsPaymentModalOpen(true);
                    }}>
                      <CreditCard className="h-4 w-4 mr-1" /> Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Payment Modal */}
      {billToPay && (
        <PaymentModal
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          totalAmount={billToPay.totalAmount}
          onPaymentComplete={handlePaymentComplete}
          onProcessPayment={processBillPayment}
        />
      )}
    </div>
  );
};

export default Billing;
