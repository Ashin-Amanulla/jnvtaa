import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", path: "/about" },
    { name: "Directory", path: "/directory" },
    { name: "Events", path: "/events" },
    { name: "News", path: "/news" },
  ];

  const resources = [
    { name: "Gallery", path: "/gallery" },
    { name: "Jobs", path: "/jobs" },
    { name: "Donate", path: "/donate" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">JNV</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">JNVTAA</div>
                <div className="text-xs text-gray-400">Alumni Association</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Connecting JNV Trivandrum alumni worldwide. Building a strong
              network, giving back to our alma mater.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="mt-1 text-primary-400" />
                <span className="text-sm">
                  JNV Trivandrum
                  <br />
                  Thiruvananthapuram, Kerala
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-primary-400" />
                <a
                  href="mailto:contact@jnvtaa.org"
                  className="text-sm hover:text-primary-400"
                >
                  contact@jnvtaa.org
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-primary-400" />
                <a
                  href="tel:+919876543210"
                  className="text-sm hover:text-primary-400"
                >
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {currentYear} JNVTAA. All rights reserved. Built with ❤️ for JNV
            Trivandrum Alumni.
          </p>
        </div>
      </div>
    </footer>
  );
}
