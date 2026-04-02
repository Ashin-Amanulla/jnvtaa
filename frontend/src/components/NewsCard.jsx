import { Link } from "react-router-dom";
import { Eye, Heart, MessageCircle, Clock } from "lucide-react";
import { formatTimeAgo } from "@/utils/format";
import { SketchCard } from "@/components/SketchCard";

export default function NewsCard({ article }) {
  return (
    <Link
      to={`/news/${article._id}`}
      className="block h-full focus-ring rounded-wobblyMd"
    >
      <SketchCard
        tilt
        className="h-full p-0"
        contentClassName="flex h-full flex-col"
      >
        <div className="relative h-48 overflow-hidden border-b-[3px] border-border bg-muted">
          <img
            src={article.coverImage || "https://via.placeholder.com/400x200"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-100 hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-grow flex-col p-6 md:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-wobblySm border-2 border-border bg-foreground px-2 py-0.5 font-sans text-sm text-background shadow-sketchSm">
              {article.category.replace("_", " ").toUpperCase()}
            </span>
            <div className="flex items-center gap-1 font-sans text-sm text-muted-foreground">
              <Clock size={16} strokeWidth={2.5} aria-hidden />
              <span>
                {formatTimeAgo(article.publishedAt || article.createdAt)}
              </span>
            </div>
          </div>
          <h3 className="font-display text-2xl font-bold leading-tight text-foreground line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-3 line-clamp-3 flex-grow font-sans text-lg text-muted-foreground">
              {article.excerpt}
            </p>
          )}
          <div className="mt-6 flex items-center justify-between border-t-2 border-dashed border-border pt-4">
            <div className="flex items-center gap-2">
              {article.author && (
                <>
                  <img
                    src={
                      article.author.avatar ||
                      `https://ui-avatars.com/api/?name=${article.author.firstName}&background=e5e0d8&color=2d2d2d`
                    }
                    alt=""
                    className="h-9 w-9 border-2 border-border object-cover shadow-sketchSm"
                    style={{ borderRadius: "50% 45% 52% 48% / 48% 52% 45% 50%" }}
                  />
                  <span className="font-sans text-sm">
                    {article.author.firstName} {article.author.lastName}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 font-sans text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Eye size={16} strokeWidth={2.5} aria-hidden />
                {article.views || 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart size={16} strokeWidth={2.5} aria-hidden />
                {article.likes?.length || 0}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={16} strokeWidth={2.5} aria-hidden />
                {article.comments?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </SketchCard>
    </Link>
  );
}
