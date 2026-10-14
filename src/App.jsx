import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from "@/components/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import ManageDestinations from "@/pages/admin/ManageDestinations";
import ManageProperties from "@/pages/admin/ManageProperties";
import ManageRooms from "@/pages/admin/ManageRooms";
import ManageExperiences from "@/pages/admin/ManageExperiences";
import ManageGallery from "@/pages/admin/ManageGallery";
import ManageEnquiries from "@/pages/admin/ManageEnquiries";
import ManageSettings from "@/pages/admin/ManageSettings";
import ManageReviews from "@/pages/admin/ManageReviews";
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import SiteLayout from "@/components/SiteLayout";
import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import DestinationDetail from "@/pages/DestinationDetail";
import PropertyDetail from "@/pages/PropertyDetail";
import Experiences from "@/pages/Experiences";
import About from "@/pages/About";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import Reviews from "@/pages/Reviews";
import BookingConcierge from "@/pages/BookingConcierge";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?returnTo=%2Fadmin" replace />} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="destinations" element={<ManageDestinations />} />
          <Route path="properties" element={<ManageProperties />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="experiences" element={<ManageExperiences />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="enquiries" element={<ManageEnquiries />} />
          <Route path="settings" element={<ManageSettings />} />
        </Route>
      </Route>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:slug" element={<DestinationDetail />} />
        <Route path="/properties/:slug" element={<PropertyDetail />} />
        <Route path="/experiences" element={<Experiences />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/concierge" element={<BookingConcierge />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App