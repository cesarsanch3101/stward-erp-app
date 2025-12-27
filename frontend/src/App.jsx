import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// 1. Páginas Generales
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

// 2. Componentes de Estructura
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// 3. Importación de Módulos de Negocio
// RRHH
import EmployeeListPage from './pages/EmployeeListPage.jsx';
import EmployeeFormPage from './pages/EmployeeFormPage.jsx';
import EmployeeEditPage from './pages/EmployeeEditPage.jsx';

// Inventario
import ProductListPage from './pages/ProductListPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import KardexPage from './pages/KardexPage.jsx';

// Ventas (Sales)
import CustomerListPage from './pages/CustomerListPage.jsx';
import CustomerFormPage from './pages/CustomerFormPage.jsx';
import CustomerEditPage from './pages/CustomerEditPage.jsx';
import SalesOrderListPage from './pages/SalesOrderListPage.jsx';
import SalesOrderFormPage from './pages/SalesOrderFormPage.jsx';
import SalesOrderDetailPage from './pages/SalesOrderDetailPage.jsx';

// Compras (Purchasing)
import SupplierListPage from './pages/SupplierListPage.jsx';
import SupplierFormPage from './pages/SupplierFormPage.jsx';
import SupplierEditPage from './pages/SupplierEditPage.jsx';
import PurchaseOrderListPage from './pages/PurchaseOrderListPage.jsx';
import PurchaseOrderFormPage from './pages/PurchaseOrderFormPage.jsx';

// Tesorería y Contabilidad
import BankAccountListPage from './pages/BankAccountListPage.jsx';
import BankAccountFormPage from './pages/BankAccountFormPage.jsx';
import AccountListPage from './pages/AccountListPage.jsx';
import AccountFormPage from './pages/AccountFormPage.jsx';
import AccountEditPage from './pages/AccountEditPage.jsx';
import JournalEntryListPage from './pages/JournalEntryListPage.jsx';
import JournalEntryFormPage from './pages/JournalEntryFormPage.jsx';


// Layout para rutas internas
const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas (Requieren Auth) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          
          {/* RRHH */}
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/edit/:id" element={<EmployeeEditPage />} />

          {/* Inventario */}
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="kardex" element={<KardexPage />} />

          {/* Ventas */}
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          <Route path="customers/edit/:id" element={<CustomerEditPage />} />
          
          <Route path="sales-orders" element={<SalesOrderListPage />} />
          <Route path="sales-orders/new" element={<SalesOrderFormPage />} />
          <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />

          {/* Compras */}
          <Route path="suppliers" element={<SupplierListPage />} />
          <Route path="suppliers/new" element={<SupplierFormPage />} />
          <Route path="suppliers/edit/:id" element={<SupplierEditPage />} />

          <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
          <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />

          {/* Contabilidad & Bancos */}
          <Route path="accounts" element={<AccountListPage />} />
          <Route path="accounts/new" element={<AccountFormPage />} />
          <Route path="accounts/edit/:id" element={<AccountEditPage />} />
          
          <Route path="journal-entries" element={<JournalEntryListPage />} />
          <Route path="journal-entries/new" element={<JournalEntryFormPage />} />

          <Route path="bank-accounts" element={<BankAccountListPage />} />
          <Route path="bank-accounts/new" element={<BankAccountFormPage />} />

        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;