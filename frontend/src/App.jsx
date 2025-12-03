import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// 1. Páginas Generales
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

// 2. Páginas de Listados (Ya las tenías)
import EmployeeListPage from './pages/EmployeeListPage.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import CustomerListPage from './pages/CustomerListPage.jsx';
import SupplierListPage from './pages/SupplierListPage.jsx';
import SalesOrderListPage from './pages/SalesOrderListPage.jsx';

// 3. Páginas de Formularios (¡LAS QUE FALTABAN EN TU ARCHIVO!)
// Ya creamos estos archivos en las fases anteriores, así que podemos usarlos.
import EmployeeFormPage from './pages/EmployeeFormPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import CustomerFormPage from './pages/CustomerFormPage.jsx';
import SupplierFormPage from './pages/SupplierFormPage.jsx';
import SalesOrderFormPage from './pages/SalesOrderFormPage.jsx';

// 4. Página de Edición (Pendiente para la Fase 17)
// import EmployeeEditPage from './pages/EmployeeEditPage.jsx';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

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
          
          {/* --- MÓDULO RRHH --- */}
          <Route path="employees" element={<EmployeeListPage />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          {/* <Route path="employees/edit/:id" element={<EmployeeEditPage />} /> */}

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

        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;