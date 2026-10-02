import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PenghuniDashboard from './pages/PenghuniDashboard';
import CalonPenghuniDashboard from './pages/CalonPenghuniDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/penghuni/*"
        element={
          <ProtectedRoute allowedRoles={['penghuni']}>
            <PenghuniDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/calon-penghuni/*"
        element={
          <ProtectedRoute allowedRoles={['calon_penghuni']}>
            <CalonPenghuniDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
