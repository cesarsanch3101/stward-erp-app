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
// Listados de Tesorería (Fase 18)
import BankAccountListPage from './pages/BankAccountListPage.jsx';
// Listados de Contabilidad (Fase 19) - ¡Próximo paso a crear!
import AccountListPage from './pages/AccountListPage.jsx';
import JournalEntryListPage from './pages/JournalEntryListPage.jsx';

// 3. Páginas de Formularios
import EmployeeFormPage from './pages/EmployeeFormPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import CustomerFormPage from './pages/CustomerFormPage.jsx';
import SupplierFormPage from './pages/SupplierFormPage.jsx';
import SalesOrderFormPage from './pages/SalesOrderFormPage.jsx';
// Formularios de Tesorería (Fase 18)
import BankAccountFormPage from './pages/BankAccountFormPage.jsx';
// Formularios de Contabilidad (Fase 19)
import AccountFormPage from './pages/AccountFormPage.jsx';
import JournalEntryFormPage from './pages/JournalEntryFormPage.jsx';

// 4. Páginas de Edición
import EmployeeEditPage from './pages/EmployeeEditPage.jsx';

// Componentes de Estructura
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Layout principal de la aplicación (Menú lateral + Contenido)
const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas (Requieren autenticación) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          {/* Dashboard Principal */}
          <Route index element={<DashboardPage />} />
          
          {/* --- MÓDULO RRHH --- */}
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/edit/:id" element={<EmployeeEditPage />} />

          {/* --- MÓDULO INVENTARIO --- */}
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />

          {/* --- MÓDULO VENTAS --- */}
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/new" element={<CustomerFormPage />} />
          
          <Route path="sales-orders" element={<SalesOrderListPage />} />
          <Route path="sales-orders/new" element={<SalesOrderFormPage />} />

          {/* --- MÓDULO COMPRAS --- */}
          <Route path="suppliers" element={<SupplierListPage />} />
          <Route path="suppliers/new" element={<SupplierFormPage />} />

          {/* --- MÓDULO TESORERÍA (Fase 18) --- */}
          <Route path="bank-accounts" element={<BankAccountListPage />} />
          <Route path="bank-accounts/new" element={<BankAccountFormPage />} />

          {/* --- MÓDULO CONTABILIDAD (Fase 19) --- */}
          {/* Plan de Cuentas */}
          <Route path="accounts" element={<AccountListPage />} />
          <Route path="accounts/new" element={<AccountFormPage />} />
          {/* Asientos de Diario */}
          <Route path="journal-entries" element={<JournalEntryListPage />} />
          <Route path="journal-entries/new" element={<JournalEntryFormPage />} />

        </Route>
      </Route>

      {/* Cualquier ruta no encontrada redirige al inicio */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;