import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { newsletterAPI } from "@/api";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");

  const subscribeMutation = useMutation({
    mutationFn: (data) => newsletterAPI.subscribe(data),
    onSuccess: () => {
      toast.success("Subscribed! Check your inbox to confirm.");
      setEmail("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Subscription failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) subscribeMutation.mutate({ email });
  };

  return (
    <div className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
            <Mail size={22} aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-xl font-semibold text-white">
              Stay in the loop
            </h3>
            <p className="mt-1 font-sans text-base text-white/70">
              Get association updates, event invites, and alumni stories.
            </p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-sans text-base text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={subscribeMutation.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 py-2.5 font-sans text-base font-semibold text-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send size={18} aria-hidden />
            {subscribeMutation.isPending ? "..." : "Subscribe"}
          </button>
        </form>
      </div>
    </div>
  );
}
