import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  const canAccess = useMemo(() => {
    if (!user) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!canAccess) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
