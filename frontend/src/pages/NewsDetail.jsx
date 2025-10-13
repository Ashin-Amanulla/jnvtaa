import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  FaArrowLeft,
  FaHeart,
  FaComment,
  FaEye,
  FaClock,
  FaUser,
} from "react-icons/fa";
import { formatDate, formatTimeAgo } from "@/utils/format";
import { useState } from "react";

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [comment, setComment] = useState("");

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: () => newsAPI.getById(id),
  });

  const likeMutation = useMutation({
    mutationFn: () => newsAPI.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["news", id]);
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content) => newsAPI.addComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(["news", id]);
      setComment("");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const article = newsData?.data?.news;
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Article not found
          </h2>
          <button onClick={() => navigate("/news")} className="btn-primary mt-4">
            Back to News
          </button>
        </div>
      </div>
    );
  }

  const isLiked = article.likes?.some((like) => like._id === user?._id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to News</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="animate-fade-in">
            {/* Category & Date */}
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
                {article.category.replace("_", " ").toUpperCase()}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <FaClock className="mr-2" />
                <span>{formatDate(article.publishedAt || article.createdAt, "PPP")}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* Author & Stats */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {article.author && (
                  <>
                    <img
                      src={
                        article.author.avatar ||
                        `https://ui-avatars.com/api/?name=${article.author.firstName}`
                      }
                      alt={article.author.firstName}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {article.author.firstName} {article.author.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {article.author.batch && `Batch of ${article.author.batch.year}`}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
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
        </div>
      </section>

      {/* Cover Image */}
      {article.coverImage && (
        <section className="py-8 bg-gray-100">
          <div className="container-custom max-w-4xl">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full rounded-2xl shadow-lg animate-slide-up"
            />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-12 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="prose prose-lg max-w-none animate-fade-in">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
              {article.content}
            </p>
          </div>

          {/* Like Button */}
          {isAuthenticated && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isLoading}
                className={`btn flex items-center gap-2 px-8 py-3 ${
                  isLiked
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "btn-outline"
                }`}
              >
                <FaHeart className={isLiked ? "text-white" : ""} />
                <span>{isLiked ? "Liked" : "Like"}</span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  {article.likes?.length || 0}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Comments ({article.comments?.length || 0})
          </h2>

          {/* Add Comment */}
          {isAuthenticated && (
            <div className="card p-6 mb-8 animate-slide-up">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="input mb-4"
              ></textarea>
              <button
                onClick={() => commentMutation.mutate(comment)}
                disabled={!comment.trim() || commentMutation.isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentMutation.isLoading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {article.comments && article.comments.length > 0 ? (
              article.comments.map((comment, index) => (
                <div
                  key={comment._id || index}
                  className="card p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        comment.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${comment.user?.firstName}`
                      }
                      alt={comment.user?.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </p>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FaComment className="text-4xl mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

