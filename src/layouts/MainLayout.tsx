import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { usePageTracking } from '../hooks/usePageTracking';

const MainLayout = () => {
  usePageTracking();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;
