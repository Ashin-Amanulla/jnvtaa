import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  User,
} from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const article = newsData?.data?.news;
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="card p-10 border-[2px] border-border text-center">
          <h2 className="text-4xl font-display font-medium tracking-tighter mb-6">
            Article not found
          </h2>
          <button onClick={() => navigate("/news")} className="btn btn-primary px-8">
            Back to News
          </button>
        </div>
      </div>
    );
  }

  const isLiked = article.likes?.some((like) => like._id === user?._id);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Back Button */}
      <div className="sticky-below-nav">
        <div className="container-custom py-4">
          <button
            type="button"
            onClick={() => navigate("/news")}
            className="inline-flex items-center gap-2 font-sans text-lg text-pen underline decoration-wavy decoration-2 underline-offset-4 focus-ring rounded-sm"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to News
          </button>
        </div>
      </div>

      {/* Article Header */}
      <section className="pt-24 pb-12 bg-background">
        <div className="container-custom max-w-4xl">
          <div>
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <span className="px-4 py-2 bg-foreground text-background text-xs font-mono tracking-widest uppercase font-bold border-[2px] border-foreground">
                {article.category.replace("_", " ").toUpperCase()}
              </span>
              <div className="flex items-center font-mono text-sm uppercase tracking-widest text-muted-foreground">
                <Clock className="mr-2" size={16} strokeWidth={1.5} />
                <span>{formatDate(article.publishedAt || article.createdAt, "PPP")}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tighter mb-12">
              {article.title}
            </h1>

            {/* Author & Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b-[4px] border-border gap-6">
              <div className="flex items-center gap-4">
                {article.author && (
                  <>
                    <img
                      src={
                        article.author.avatar ||
                        `https://ui-avatars.com/api/?name=${article.author.firstName}&background=000&color=fff`
                      }
                      alt={article.author.firstName}
                      className="w-16 h-16 grayscale border-[2px] border-foreground"
                    />
                    <div>
                      <p className="font-display text-2xl tracking-tighter">
                        {article.author.firstName} {article.author.lastName}
                      </p>
                      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        {article.author.batch && `Batch of ${article.author.batch.year}`}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center">
                  <Eye className="mr-2" size={16} strokeWidth={1.5} />
                  <span>{article.views || 0}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="mr-2" size={16} strokeWidth={1.5} />
                  <span>{article.likes?.length || 0}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="mr-2" size={16} strokeWidth={1.5} />
                  <span>{article.comments?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {article.coverImage && (
        <section className="py-12 bg-background">
          <div className="container-custom max-w-5xl">
            <img
              src={article.coverImage}
              alt=""
              className="w-full border-[3px] border-border object-cover shadow-sketchLg"
              style={{
                borderRadius: "20px 240px 20px 200px / 200px 20px 240px 20px",
              }}
            />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-16 bg-background">
        <div className="container-custom max-w-4xl">
          <div className="font-sans text-xl leading-relaxed text-foreground whitespace-pre-line">
            {article.content}
          </div>

          {/* Like Button */}
          {isAuthenticated && (
            <div className="mt-16 flex justify-center pt-16 border-t-[2px] border-border">
              <button
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isLoading}
                className={`btn flex items-center gap-3 px-8 py-4 border-[2px] ${
                  isLiked
                    ? "bg-foreground text-background border-foreground hover:bg-background hover:text-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground"
                }`}
              >
                <Heart className={isLiked ? "fill-current" : ""} size={20} strokeWidth={1.5} />
                <span className="font-mono uppercase tracking-widest font-bold">
                  {isLiked ? "Liked" : "Like Article"}
                </span>
                <span className="bg-muted text-foreground px-3 py-1 font-mono">{article.likes?.length || 0}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-24 bg-muted border-t-[4px] border-border mt-12">
        <div className="container-custom max-w-4xl">
          <h2 className="text-4xl font-display tracking-tighter font-medium mb-12">
            Comments ({article.comments?.length || 0})
          </h2>

          {/* Add Comment */}
          {isAuthenticated && (
            <div className="card p-8 border-[2px] border-border bg-background mb-12">
              <h3 className="font-mono text-sm tracking-widest uppercase font-bold mb-4">Leave a Comment</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="input border-[2px] resize-none mb-6"
              ></textarea>
              <div className="flex justify-end">
                <button
                  onClick={() => commentMutation.mutate(comment)}
                  disabled={!comment.trim() || commentMutation.isLoading}
                  className="btn btn-primary px-8"
                >
                  {commentMutation.isLoading ? "Posting..." : "Post Comment →"}
                </button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {article.comments && article.comments.length > 0 ? (
              article.comments.map((comment, index) => (
                <div
                  key={comment._id || index}
                  className="p-8 border-b-[2px] border-border bg-background flex flex-col md:flex-row gap-6"
                >
                  <img
                    src={
                      comment.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${comment.user?.firstName}&background=000&color=fff`
                    }
                    alt={comment.user?.firstName}
                    className="w-16 h-16 grayscale border-[2px] border-foreground shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <p className="font-display text-2xl tracking-tighter font-medium">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </p>
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground border-[1px] border-border px-3 py-1">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="font-sans text-lg leading-relaxed text-foreground">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border-[2px] border-border border-dashed">
                <MessageCircle className="mx-auto mb-4 text-border" size={48} strokeWidth={1} />
                <p className="font-mono uppercase tracking-widest text-muted-foreground">No comments yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
