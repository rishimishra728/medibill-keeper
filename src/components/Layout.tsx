
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, FileText, ShoppingCart, BarChart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2',
          isActive ? 'bg-medical-100 text-medical-700' : 'hover:bg-medical-100 hover:text-medical-700'
        )}
      >
        {icon}
        {label}
      </Button>
    </Link>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { to: '/', icon: <Home size={18} />, label: 'Dashboard' },
    { to: '/inventory', icon: <ShoppingCart size={18} />, label: 'Inventory' },
    { to: '/add-medicine', icon: <PlusCircle size={18} />, label: 'Add Medicine' },
    { to: '/billing', icon: <FileText size={18} />, label: 'Billing' },
    { to: '/reports', icon: <BarChart size={18} />, label: 'Reports' },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl text-medical-600">MediBill</h1>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r p-4 space-y-2">
        <div className="mb-6">
          <h1 className="font-bold text-xl text-medical-600">MediBill</h1>
          <p className="text-sm text-muted-foreground">Inventory Management</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.to}
            />
          ))}
        </nav>
      </aside>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 pt-20">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-gray-50">
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
