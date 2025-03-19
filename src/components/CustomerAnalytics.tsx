
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
import { UserIcon } from 'lucide-react';

const CustomerAnalytics = () => {
  const { getTopCustomers } = useAppContext();
  
  const topCustomers = getTopCustomers(5);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <span>Top Customers</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topCustomers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-right">{customer.visitCount}</TableCell>
                  <TableCell className="text-right">₹{customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(customer.lastVisit).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No customer data available yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerAnalytics;
