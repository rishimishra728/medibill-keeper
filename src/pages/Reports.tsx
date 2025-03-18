
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Inbox,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Reports = () => {
  const { medicines, bills } = useAppContext();

  // Calculate total sales
  const totalSales = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  
  // Calculate paid vs unpaid bills
  const paidBills = bills.filter(bill => bill.paid);
  const unpaidBills = bills.filter(bill => !bill.paid);
  const paidAmount = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const unpaidAmount = unpaidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  
  // Calculate top selling medicines
  const medicinesSold: Record<string, { count: number; revenue: number }> = {};
  
  bills.forEach(bill => {
    bill.items.forEach(item => {
      if (!medicinesSold[item.medicineId]) {
        medicinesSold[item.medicineId] = { count: 0, revenue: 0 };
      }
      
      medicinesSold[item.medicineId].count += item.quantity;
      medicinesSold[item.medicineId].revenue += item.price * item.quantity;
    });
  });
  
  const topSellingMedicines = Object.entries(medicinesSold)
    .map(([medicineId, data]) => {
      const medicine = medicines.find(m => m.id === medicineId);
      return {
        id: medicineId,
        name: medicine ? medicine.name : 'Unknown',
        count: data.count,
        revenue: data.revenue,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Category distribution data
  const categoryData: Record<string, number> = {};
  
  medicines.forEach(medicine => {
    if (!categoryData[medicine.category]) {
      categoryData[medicine.category] = 0;
    }
    
    categoryData[medicine.category]++;
  });
  
  const pieChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count,
  }));
  
  // Stock value by category
  const stockValueByCategory: Record<string, number> = {};
  
  medicines.forEach(medicine => {
    if (!stockValueByCategory[medicine.category]) {
      stockValueByCategory[medicine.category] = 0;
    }
    
    stockValueByCategory[medicine.category] += medicine.price * medicine.stock;
  });
  
  const barChartData = Object.entries(stockValueByCategory)
    .map(([category, value]) => ({
      name: category,
      value: parseFloat(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);
  
  // PIE CHART COLORS
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime sales revenue
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${unpaidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {unpaidBills.length} bills
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicines.filter(m => m.stock <= 10).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need to be restocked
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              <span>Inventory Value by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Value']}
                  />
                  <Bar dataKey="value" fill="#1976b2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              <span>Medicine Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine Name</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellingMedicines.length > 0 ? (
                topSellingMedicines.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell className="text-right">{medicine.count}</TableCell>
                    <TableCell className="text-right">${medicine.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No sales data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
