import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import MainLayout from './layouts/MainLayout';
// Critical-path pages — loaded eagerly so the hero renders without an extra round-trip
import HomePage  from './pages/HomePage';
import LoginPage from './pages/LoginPage';
const PropertiesPage      = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage  = lazy(() => import('./pages/PropertyDetailPage'));
const BuyingGuidePage     = lazy(() => import('./pages/BuyingGuidePage'));
const FavoritesPage       = lazy(() => import('./pages/FavoritesPage'));
const ContactPage         = lazy(() => import('./pages/ContactPage'));
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const PublishPropertyPage = lazy(() => import('./pages/PublishPropertyPage'));
const EditPropertyPage    = lazy(() => import('./pages/EditPropertyPage'));
const AdminPage           = lazy(() => import('./pages/AdminPage'));
const AgentDashboardPage  = lazy(() => import('./pages/AgentDashboardPage'));
const MessagesPage        = lazy(() => import('./pages/MessagesPage'));
const OAuthCallbackPage   = lazy(() => import('./pages/OAuthCallbackPage'));
const VerifyEmailPage     = lazy(() => import('./pages/VerifyEmailPage'));
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 overflow-hidden bg-brand-100 dark:bg-brand-950">
      <div className="h-full animate-[loading-bar_1.5s_ease-in-out_infinite] bg-brand-600" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <FavoritesProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth routes — sin layout principal */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/verificar-email" element={<VerifyEmailPage />} />

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
            <Route path="/mi-panel" element={<AgentDashboardPage />} />
            <Route path="/mensajes" element={<MessagesPage />} />
            <Route path="/mensajes/:conversationId" element={<MessagesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </FavoritesProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
