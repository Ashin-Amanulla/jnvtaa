import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { Toaster } from "@/components/ui/sonner";
import { isSuperAdmin } from "@/utils/roles";

import Layout from "@/layout/Layout";
import DashboardLayout from "@/layout/DashboardLayout";
import AdminLayout from "@/admin/AdminLayout";
import AdminRoute from "@/admin/AdminRoute";
import RequirePermission from "@/admin/RequirePermission";
import RequireSuperAdmin from "@/admin/RequireSuperAdmin";
import { PERMISSIONS } from "@/utils/roles";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import DirectoryRoute from "@/components/DirectoryRoute";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import Gallery from "@/pages/Gallery";
import Donate from "@/pages/Donate";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import BatchDetail from "@/pages/BatchDetail";
import Batches from "@/pages/Batches";
import PublicProfile from "@/pages/PublicProfile";
import MyApplications from "@/pages/MyApplications";
import MyDonations from "@/pages/MyDonations";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import Mentorship from "@/pages/Mentorship";
import BecomeMentor from "@/pages/BecomeMentor";
import MyMentorship from "@/pages/MyMentorship";
import Messages from "@/pages/Messages";
import MessageThread from "@/pages/MessageThread";
import AlumniMap from "@/pages/AlumniMap";
import Notifications from "@/pages/Notifications";
import Achievements from "@/pages/Achievements";
import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/admin/pages/Dashboard";
import UsersAdmin from "@/admin/pages/UsersAdmin";
import BatchesAdmin from "@/admin/pages/BatchesAdmin";
import EventsAdmin from "@/admin/pages/EventsAdmin";
import NewsAdmin from "@/admin/pages/NewsAdmin";
import GalleryAdmin from "@/admin/pages/GalleryAdmin";
import DonationsAdmin from "@/admin/pages/DonationsAdmin";
import JobsAdmin from "@/admin/pages/JobsAdmin";
import MentorshipAdmin from "@/admin/pages/MentorshipAdmin";
import NewsletterAdmin from "@/admin/pages/NewsletterAdmin";
import ContactAdmin from "@/admin/pages/ContactAdmin";
import SiteContentAdmin from "@/admin/pages/SiteContentAdmin";
import PopupAdmin from "@/admin/pages/PopupAdmin";
import DirectoryAdmin from "@/admin/pages/DirectoryAdmin";
import StaffAccessAdmin from "@/admin/pages/StaffAccessAdmin";
import AuditLogAdmin from "@/admin/pages/AuditLogAdmin";
import SettingsAdmin from "@/admin/pages/SettingsAdmin";
import { shouldRetryQuery } from "@/utils/queryRetry";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function MemberRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isSuperAdmin(user)) return <Navigate to="/admin" replace />;
  return children;
}

function LegacyBatchRedirect() {
  const { id } = useParams();
  return <Navigate to={`/batches/${id}`} replace />;
}

function LegacyAlumniRedirect() {
  const { userId } = useParams();
  return <Navigate to={`/dashboard/alumni/${userId}`} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Admin panel — separate layout */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route
              path="users"
              element={
                <RequirePermission permission={PERMISSIONS.USERS_READ}>
                  <UsersAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="directory"
              element={
                <RequirePermission permission={PERMISSIONS.USERS_READ}>
                  <DirectoryAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="staff-access"
              element={
                <RequireSuperAdmin>
                  <StaffAccessAdmin />
                </RequireSuperAdmin>
              }
            />
            <Route
              path="batches"
              element={
                <RequirePermission permission={PERMISSIONS.BATCHES_MANAGE}>
                  <BatchesAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="events"
              element={
                <RequirePermission permission={PERMISSIONS.EVENTS_MANAGE}>
                  <EventsAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="news"
              element={
                <RequirePermission permission={PERMISSIONS.NEWS_MANAGE}>
                  <NewsAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="gallery/:slug"
              element={
                <RequirePermission permission={PERMISSIONS.GALLERY_MANAGE}>
                  <GalleryAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="gallery"
              element={
                <RequirePermission permission={PERMISSIONS.GALLERY_MANAGE}>
                  <GalleryAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="donations"
              element={
                <RequirePermission permission={PERMISSIONS.DONATIONS_MANAGE}>
                  <DonationsAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="jobs"
              element={
                <RequirePermission permission={PERMISSIONS.JOBS_MANAGE}>
                  <JobsAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="mentorship"
              element={
                <RequirePermission permission={PERMISSIONS.MENTORSHIP_MANAGE}>
                  <MentorshipAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="newsletter"
              element={
                <RequirePermission permission={PERMISSIONS.NEWSLETTER_MANAGE}>
                  <NewsletterAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="contact"
              element={
                <RequirePermission permission={PERMISSIONS.CONTACT_MANAGE}>
                  <ContactAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="site-content"
              element={
                <RequirePermission permission={PERMISSIONS.SITE_CONTENT_MANAGE}>
                  <SiteContentAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="popup"
              element={
                <RequirePermission permission={PERMISSIONS.SITE_CONTENT_MANAGE}>
                  <PopupAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="audit-log"
              element={
                <RequirePermission permission={PERMISSIONS.AUDIT_LOG_READ}>
                  <AuditLogAdmin />
                </RequirePermission>
              }
            />
            <Route
              path="settings"
              element={
                <RequirePermission permission={PERMISSIONS.SETTINGS_MANAGE}>
                  <SettingsAdmin />
                </RequirePermission>
              }
            />
          </Route>

          {/* Member dashboard — separate layout */}
          <Route
            element={
              <MemberRoute>
                <DashboardLayout />
              </MemberRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/profile" element={<Profile />} />
            <Route path="dashboard/applications" element={<MyApplications />} />
            <Route path="dashboard/donations" element={<MyDonations />} />
            <Route path="dashboard/mentorship" element={<MyMentorship />} />
            <Route path="dashboard/directory" element={<DirectoryRoute />} />
            <Route path="dashboard/alumni/:userId" element={<PublicProfile />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:conversationId" element={<MessageThread />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Public site */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route
              path="alumni/:userId"
              element={
                <MemberRoute>
                  <LegacyAlumniRedirect />
                </MemberRoute>
              }
            />
            <Route path="batches" element={<Batches />} />
            <Route
              path="batches/:id"
              element={
                <MemberRoute>
                  <BatchDetail />
                </MemberRoute>
              }
            />
            <Route path="directory/:id" element={<LegacyBatchRedirect />} />
            <Route
              path="directory"
              element={
                <MemberRoute>
                  <Navigate to="/dashboard/directory" replace />
                </MemberRoute>
              }
            />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="donate" element={<Donate />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="mentorship" element={<Mentorship />} />
            <Route
              path="mentorship/become"
              element={
                <ProtectedRoute>
                  <BecomeMentor />
                </ProtectedRoute>
              }
            />
            <Route path="map" element={<AlumniMap />} />
            <Route path="achievements" element={<Achievements />} />

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="auth/callback" element={<AuthCallback />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
