
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const AddMedicine = () => {
  const { addMedicine } = useAppContext();
  const [medicine, setMedicine] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    expiryDate: '',
    category: '',
    manufacturer: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedicine({
      ...medicine,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!medicine.name || !medicine.price || !medicine.stock || !medicine.expiryDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the medicine
      await addMedicine({
        name: medicine.name,
        description: medicine.description,
        price: parseFloat(medicine.price),
        stock: parseInt(medicine.stock),
        expiryDate: medicine.expiryDate,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
      });
      
      // Reset the form
      setMedicine({
        name: '',
        description: '',
        price: '',
        stock: '',
        expiryDate: '',
        category: '',
        manufacturer: '',
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add New Medicine</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Medicine Details</CardTitle>
          <CardDescription>
            Enter the details of the new medicine to add to inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={medicine.name}
                  onChange={handleChange}
                  placeholder="e.g., Paracetamol"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={medicine.category}
                  onChange={handleChange}
                  placeholder="e.g., Pain Relief"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)*</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={medicine.price}
                  onChange={handleChange}
                  placeholder="e.g., 5.99"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity*</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={medicine.stock}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date*</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={medicine.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={medicine.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., MedPharm"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={medicine.description}
                  onChange={handleChange}
                  placeholder="Brief description of the medicine"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setMedicine({
                  name: '',
                  description: '',
                  price: '',
                  stock: '',
                  expiryDate: '',
                  category: '',
                  manufacturer: '',
                })}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Medicine'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMedicine;
