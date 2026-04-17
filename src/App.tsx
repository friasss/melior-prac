import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BuyingGuidePage from './pages/BuyingGuidePage';
import FavoritesPage from './pages/FavoritesPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import PublishPropertyPage from './pages/PublishPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import AdminPage from './pages/AdminPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Routes>
        {/* Auth routes — sin layout principal */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Rutas con layout principal (navbar + footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/propiedades" element={<PropertiesPage />} />
          <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
          <Route path="/guia-de-compra" element={<BuyingGuidePage />} />
          <Route path="/favoritos" element={<FavoritesPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/publicar" element={<PublishPropertyPage />} />
          <Route path="/editar/:id" element={<EditPropertyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
