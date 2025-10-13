import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBriefcase,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

export default function AlumniCard({ user }) {
  return (
    <Link
      to={`/directory/${user._id}`}
      className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-primary-200 transition-colors"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              {user.firstName} {user.lastName}
            </h3>
            
            {user.batch && (
              <p className="text-sm text-primary-600 font-semibold mb-2">
                Batch of {user.batch.year}
              </p>
            )}

            {user.profession && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaBriefcase className="mr-2 text-gray-400" />
                <span className="truncate">{user.profession}</span>
              </div>
            )}

            {user.currentCity && (
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FaMapMarkerAlt className="mr-2 text-gray-400" />
                <span className="truncate">{user.currentCity}</span>
              </div>
            )}

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {user.socialLinks?.linkedin && (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaLinkedin size={18} />
                </a>
              )}
              {user.privacySettings?.showEmail && user.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEnvelope size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        {user.bio && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}

