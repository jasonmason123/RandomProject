import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@app/context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  return isAuthenticated && !loading ? <Outlet /> : <Navigate to={`/login`} />;
};

export default PrivateRoute;
