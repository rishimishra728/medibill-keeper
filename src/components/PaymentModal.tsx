
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentDetails } from '@/types';
import { toast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  onPaymentComplete: (success: boolean) => void;
  onProcessPayment: (paymentDetails: PaymentDetails) => Promise<boolean>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onOpenChange,
  totalAmount,
  onPaymentComplete,
  onProcessPayment,
}) => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .substring(0, 19);
      setPaymentDetails((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      const cleanValue = value.replace(/[^\d]/g, '');
      let formattedValue = cleanValue;
      if (cleanValue.length > 2) {
        formattedValue = `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
      }
      setPaymentDetails((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Limit CVV to 3 or 4 digits
    if (name === 'cvv') {
      const cleanValue = value.replace(/[^\d]/g, '');
      setPaymentDetails((prev) => ({ ...prev, [name]: cleanValue.substring(0, 4) }));
      return;
    }
    
    setPaymentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const success = await onProcessPayment(paymentDetails);
      if (success) {
        // Reset form
        setPaymentDetails({
          cardNumber: '',
          cardholderName: '',
          expiryDate: '',
          cvv: '',
        });
        onPaymentComplete(true);
      } else {
        onPaymentComplete(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      onPaymentComplete(false);
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  const validateForm = () => {
    // Check card number (simplified validation)
    if (paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number.",
        variant: "destructive",
      });
      return false;
    }
    
    // Check cardholder name
    if (!paymentDetails.cardholderName.trim()) {
      toast({
        title: "Missing Cardholder Name",
        description: "Please enter the cardholder name.",
        variant: "destructive",
      });
      return false;
    }
    
    // Check expiry date
    if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter a valid expiry date (MM/YY).",
        variant: "destructive",
      });
      return false;
    }
    
    // Check CVV
    if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV code.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Payment
          </DialogTitle>
          <DialogDescription>
            Enter your card details to process payment of ₹{totalAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              disabled={isProcessing}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              placeholder="John Doe"
              value={paymentDetails.cardholderName}
              onChange={handleChange}
              disabled={isProcessing}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentDetails.expiryDate}
                onChange={handleChange}
                disabled={isProcessing}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={paymentDetails.cvv}
                onChange={handleChange}
                disabled={isProcessing}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay ₹{totalAmount.toFixed(2)}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
