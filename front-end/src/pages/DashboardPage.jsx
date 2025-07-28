import React from 'react';
import Dashboard from '../components/layout/Dashboard';

function DashboardPage() {
  // The user is guaranteed to be logged in here,
  // so we can just render the dashboard.
  return <Dashboard />;
}

export default DashboardPage;