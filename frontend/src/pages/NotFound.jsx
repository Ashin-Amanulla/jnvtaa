import { Link } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="relative inline-block mb-8">
          <div className="text-9xl font-bold text-primary-600 opacity-20 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaSearch className="text-6xl text-primary-600 animate-bounce" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
            <FaHome />
            Go Home
          </Link>
          <Link to="/directory" className="btn-outline flex items-center gap-2 justify-center">
            <FaSearch />
            Browse Directory
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Need help? <Link to="/contact" className="text-primary-600 hover:text-primary-700 underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}

