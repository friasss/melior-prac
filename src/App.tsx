import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BuyingGuidePage from './pages/BuyingGuidePage';
import FavoritesPage from './pages/FavoritesPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Routes>
      {/* Auth routes — sin layout principal */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas con layout principal (navbar + footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/propiedades" element={<PropertiesPage />} />
        <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
        <Route path="/guia-de-compra" element={<BuyingGuidePage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/contacto" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default App;
