import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import AuthNavbar from './AuthNavbar';

export default function AuthLayout() {
  return (
    <>
      <AuthNavbar />
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}