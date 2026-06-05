import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { SketchCard } from "@/components/SketchCard";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="pointer-events-none relative mb-10 select-none">
          <span className="font-display text-[8rem] font-bold leading-none text-foreground/15 md:text-[10rem]">
            404
          </span>
        </div>

        <SketchCard decoration="tack" tilt className="p-10 md:p-12">
          <h1 className="font-display text-4xl font-bold md:text-5xl">
            Page not found
          </h1>
          <div className="mx-auto mt-4 h-1 max-w-xs border-b-2 border-brand" />
          <p className="mt-6 font-sans text-xl text-muted-foreground">
            The page you are looking for does not exist. Try returning home or
            your member dashboard.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/"
              className="btn-primary inline-flex flex-1 items-center justify-center gap-2 focus-ring"
            >
              <Home size={22} strokeWidth={2} />
              Home
            </Link>
            <Link
              to="/dashboard"
              className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 focus-ring"
            >
              <Search size={22} strokeWidth={2} />
              Dashboard
            </Link>
          </div>

          <p className="mt-10 font-sans text-lg text-muted-foreground">
            Need a human?{""}
            <Link
              to="/contact"
              className="text-brand font-medium hover:text-accent"
            >
              Contact
            </Link>
          </p>
        </SketchCard>
      </div>
    </div>
  );
}
