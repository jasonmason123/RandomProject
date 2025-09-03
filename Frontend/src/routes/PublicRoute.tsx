import { useAuth } from '@app/context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  return isAuthenticated && !loading ? <Navigate to={`/`} /> : <Outlet />;
};

export default PublicRoute;
