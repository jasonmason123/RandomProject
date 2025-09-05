import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { useWindowSize } from '@app/hooks/useWindowSize';
import { calculateWindowSize } from '@app/utils/helpers';
import { setWindowSize } from '@app/store/reducers/ui';
import ReactGA from 'react-ga4';

import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';

import { useAppDispatch, useAppSelector } from './store/store';
import { AuthProvider } from './context/AuthContext';
import ProductList from './pages/products/ProductList';
import ProductAddEdit from './pages/products/ProductAddEdit';
import ProductDetails from './pages/products/ProductDetails';

// Lazy imports for @pages and @modules
const Main = lazy(() => import('@modules/main/Main'));
const Login = lazy(() => import('@modules/login/Login'));
const Register = lazy(() => import('@modules/register/Register'));
const ForgetPassword = lazy(() => import('@modules/forgot-password/ForgotPassword'));
const RecoverPassword = lazy(() => import('@modules/recover-password/RecoverPassword'));
const VerifyAccount = lazy(() => import('@modules/verify-account/VerifyAccount'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const Blank = lazy(() => import('@pages/Blank'));
const SubMenu = lazy(() => import('@pages/SubMenu'));
const Profile = lazy(() => import('@pages/profile/Profile'));

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

  // Google Analytics
  useEffect(() => {
    if (location && location.pathname && VITE_NODE_ENV === 'production') {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname,
      });
    }
  }, [location]);

  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/register" element={<PublicRoute />}>
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/verify-account/:c" element={<PublicRoute />}>
            <Route path="/verify-account/:c" element={<VerifyAccount />} />
          </Route>
          <Route path="/forgot-password" element={<PublicRoute />}>
            <Route path="/forgot-password" element={<ForgetPassword />} />
          </Route>
          <Route path="/recover-password/:c" element={<PublicRoute />}>
            <Route path="/recover-password/:c" element={<RecoverPassword />} />
          </Route>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<Main />}>
              <Route path="sub-menu-2" element={<Blank />} />
              <Route path="sub-menu-1" element={<SubMenu />} />
              <Route path="blank" element={<Blank />} />
              <Route path="profile" element={<Profile />} />
              <Route path="products">
                <Route index element={<ProductList />} />
                <Route path="new" element={<ProductAddEdit />} />
                <Route path=":id">
                  <Route index element={<ProductDetails />} />
                  <Route path="edit" element={<ProductAddEdit />} />
                </Route>
              </Route>
              <Route path="/" element={<Dashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </AuthProvider>
  );
};

export default App;
