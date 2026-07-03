import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Promotions from './pages/Promotions';
import ShoppingLists from './pages/ShoppingLists';
import ShoppingListDetails from './pages/ShoppingListDetails';
import Categories from './pages/Categories';
import Expenses from './pages/Expenses';
import ExpenseDetails from './pages/ExpenseDetails';
import Home from './pages/Home';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/home" replace />
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
        <Route path="/shopping-lists" element={<ProtectedRoute><ShoppingLists /></ProtectedRoute>} />
        <Route path="/shopping-list-details/:id" element={<ProtectedRoute><ShoppingListDetails /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/expense-details/:id" element={<ProtectedRoute><ExpenseDetails /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>

    </BrowserRouter >
  );
}