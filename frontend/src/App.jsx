import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";

// Layout
import Layout from "@/layout/Layout";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Temporary placeholder components for routes not yet created
function Directory() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">Alumni Directory</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

function Events() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">Events</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

function News() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">News & Updates</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

function Gallery() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">Gallery</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

function Donate() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">Donate</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

function Jobs() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">Job Board</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

function Contact() {
  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="directory" element={<Directory />} />
            <Route path="events" element={<Events />} />
            <Route path="news" element={<News />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="donate" element={<Donate />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
