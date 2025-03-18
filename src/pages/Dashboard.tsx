import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package2, AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { 
    medicines, 
    bills, 
    getLowStockMedicines, 
    getExpiringMedicines 
  } = useAppContext();

  const lowStockMedicines = getLowStockMedicines();
  const expiringMedicines = getExpiringMedicines();
  const totalMedicines = medicines.length;
  const pendingBills = bills.filter(bill => !bill.paid).length;
  const totalInventoryValue = medicines.reduce((total, medicine) => {
    return total + (medicine.price * medicine.stock);
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedicines}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockMedicines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Medicines need restocking
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBills}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unpaid bills
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total stock value
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockMedicines.length > 0 ? (
              <div className="space-y-2">
                {lowStockMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">{medicine.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${medicine.stock <= 5 ? 'text-red-500' : 'text-amber-500'}`}>
                        {medicine.stock} left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No low stock medicines</p>
            )}
            <div className="mt-4">
              <Link to="/inventory" className="text-sm text-medical-600 hover:underline">
                View all inventory →
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringMedicines.length > 0 ? (
              <div className="space-y-2">
                {expiringMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500">
                        Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No medicines expiring soon</p>
            )}
            <div className="mt-4">
              <Link to="/inventory" className="text-sm text-medical-600 hover:underline">
                View all inventory →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
