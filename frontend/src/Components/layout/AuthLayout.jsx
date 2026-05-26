import { Outlet } from 'react-router-dom';
import Footer from './Footer';

export default function AuthLayout() {
  return (
    <>
      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}