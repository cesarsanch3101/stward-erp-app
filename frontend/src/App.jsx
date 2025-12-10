import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// 1. Páginas Generales
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

// 2. Páginas de Listados
import EmployeeListPage from './pages/EmployeeListPage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import CustomerListPage from './pages/CustomerListPage.jsx';
import SupplierListPage from './pages/SupplierListPage.jsx';
import SalesOrderListPage from './pages/SalesOrderListPage.jsx';
import BankAccountListPage from './pages/BankAccountListPage.jsx';
import AccountListPage from './pages/AccountListPage.jsx';
import JournalEntryListPage from './pages/JournalEntryListPage.jsx';
// ¡NUEVO! Importamos la lista de compras
import PurchaseOrderListPage from './pages/PurchaseOrderListPage.jsx';

// 3. Páginas de Formularios
import EmployeeFormPage from './pages/EmployeeFormPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import CustomerFormPage from './pages/CustomerFormPage.jsx';
import SupplierFormPage from './pages/SupplierFormPage.jsx';
import SalesOrderFormPage from './pages/SalesOrderFormPage.jsx';
import BankAccountFormPage from './pages/BankAccountFormPage.jsx';
import AccountFormPage from './pages/AccountFormPage.jsx';
import JournalEntryFormPage from './pages/JournalEntryFormPage.jsx';
// ¡NUEVO! Importamos el formulario de compras
import PurchaseOrderFormPage from './pages/PurchaseOrderFormPage.jsx';

// 4. Páginas de Edición y Detalle
import EmployeeEditPage from './pages/EmployeeEditPage.jsx';
import CustomerEditPage from './pages/CustomerEditPage.jsx';
import SalesOrderDetailPage from './pages/SalesOrderDetailPage.jsx';

// Componentes de Estructura
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import KardexPage from './pages/KardexPage.jsx';

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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
          <Route path="products/:id/kardex" element={<KardexPage />} />

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
          {/* ¡AQUÍ ESTÁN LAS RUTAS NUEVAS! */}
          <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
          <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />

          {/* Tesorería */}
          <Route path="bank-accounts" element={<BankAccountListPage />} />
          <Route path="bank-accounts/new" element={<BankAccountFormPage />} />

          {/* Contabilidad */}
          <Route path="accounts" element={<AccountListPage />} />
          <Route path="accounts/new" element={<AccountFormPage />} />
          <Route path="journal-entries" element={<JournalEntryListPage />} />
          <Route path="journal-entries/new" element={<JournalEntryFormPage />} />

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;