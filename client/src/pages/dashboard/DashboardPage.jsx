import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import TesterDashboard from './TesterDashboard';
import DeveloperDashboard from './DeveloperDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage = () => {
  const { user } = useAuth();
  const role = (user?.role || 'customer').toUpperCase();

  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DEVELOPER':
      return <DeveloperDashboard />;
    case 'TESTER':
      return <TesterDashboard />;
    case 'CUSTOMER':
    default:
      return <CustomerDashboard />;
  }
};

export default DashboardPage;
