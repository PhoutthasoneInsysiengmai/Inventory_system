import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import LotPage from "./pages/LotPage";
import CategoryPage from "./pages/CategoryPage";
import OrdersPage from "./pages/OrdersPage";
import BranchesPage from "./pages/BranchesPage";
import UsersPage from "./pages/UsersPage";
import StockPage from "./pages/StockPage";
import ReportPage from "./pages/ReportPage";


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/users" element={
            <PrivateRoute><UsersPage /></PrivateRoute>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute><ProductsPage /></PrivateRoute>
          } />
          <Route path="/categories" element={
            <PrivateRoute><CategoryPage /></PrivateRoute>
          } />
          <Route path="/lots" element={<PrivateRoute><LotPage /></PrivateRoute>} />
          <Route path="/orders" element={
            <PrivateRoute><OrdersPage /></PrivateRoute>
          } />
          {/* เพิ่ม route นี้ครับ */}
          <Route path="/orders/create" element={
            <PrivateRoute><OrdersPage /></PrivateRoute>
          } />
          <Route path="/branches" element={
            <PrivateRoute><BranchesPage /></PrivateRoute>
          } />
          <Route path="/stock" element={
            <PrivateRoute><StockPage /></PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute><ReportPage /></PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}