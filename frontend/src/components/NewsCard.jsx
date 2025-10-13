import { Link } from "react-router-dom";
import { FaEye, FaHeart, FaComment, FaClock } from "react-icons/fa";
import { formatTimeAgo } from "@/utils/format";

export default function NewsCard({ article }) {
  const getCategoryColor = (category) => {
    const colors = {
      achievement: "bg-yellow-100 text-yellow-700",
      event: "bg-blue-100 text-blue-700",
      announcement: "bg-red-100 text-red-700",
      alumni_story: "bg-purple-100 text-purple-700",
      school_update: "bg-green-100 text-green-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.other;
  };

  return (
    <Link
      to={`/news/${article._id}`}
      className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden"
    >
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={article.coverImage || "https://via.placeholder.com/400x200"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
              article.category
            )}`}
          >
            {article.category.replace("_", " ").toUpperCase()}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <FaClock className="mr-1" />
            <span>{formatTimeAgo(article.publishedAt || article.createdAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Author & Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            {article.author && (
              <>
                <img
                  src={
                    article.author.avatar ||
                    `https://ui-avatars.com/api/?name=${article.author.firstName}`
                  }
                  alt={article.author.firstName}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span className="text-sm text-gray-700">
                  {article.author.firstName} {article.author.lastName}
                </span>
              </>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <FaEye className="mr-1" />
              <span>{article.views || 0}</span>
            </div>
            <div className="flex items-center">
              <FaHeart className="mr-1" />
              <span>{article.likes?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <FaComment className="mr-1" />
              <span>{article.comments?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

