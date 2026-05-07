import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';

const HomePage            = lazy(() => import('./pages/HomePage'));
const LoginPage           = lazy(() => import('./pages/LoginPage'));
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
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
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
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
