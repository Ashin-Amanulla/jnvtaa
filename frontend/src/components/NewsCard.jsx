import { Link } from "react-router-dom";
import { Calendar, Heart, MessageCircle } from "lucide-react";
import { SketchCard } from "@/components/SketchCard";

export default function NewsCard({ article }) {
  return (
    <Link to={`/news/${article._id}`} className="block focus-ring rounded-2xl">
      <SketchCard tilt className="h-full p-0" contentClassName="flex h-full flex-col">
        <div className="relative h-48 overflow-hidden border-b border-border bg-muted">
          <img
            src={article.coverImage || "https://via.placeholder.com/800x400?text=NEWS"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <span className="pill absolute left-3 top-3 bg-house-red text-white shadow-card">
            {article.category}
          </span>
        </div>
        <div className="flex flex-grow flex-col p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 font-sans text-sm text-muted-foreground">
            <Calendar size={15} aria-hidden />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>
          <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 font-sans text-base text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-auto flex items-center gap-4 border-t border-border pt-4 font-sans text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Heart size={15} aria-hidden />
              {article.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle size={15} aria-hidden />
              {article.comments?.length || 0}
            </span>
          </div>
        </div>
      </SketchCard>
    </Link>
  );
}
