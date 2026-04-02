import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { donationsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { SketchCard } from "@/components/SketchCard";

export default function Donate() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { isAuthenticated } = useAuthStore();

  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ["donation-campaigns"],
    queryFn: () => donationsAPI.getAllCampaigns({ status: "active" }),
  });

  const { data: stats } = useQuery({
    queryKey: ["donation-stats"],
    queryFn: () => donationsAPI.getStats(),
  });

  const CampaignCard = ({ campaign }) => {
    const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);

    return (
      <SketchCard tilt className="p-0" decoration="tack" contentClassName="flex h-full flex-col">
        <div className="relative h-48 overflow-hidden border-b-[3px] border-border bg-muted">
          <img
            src={campaign.coverImage || "https://via.placeholder.com/400x200"}
            alt=""
            className="h-full w-full object-cover transition-transform duration-100 hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-grow flex-col p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-wobblySm border-2 border-border bg-foreground px-2 py-0.5 font-sans text-sm text-background shadow-sketchSm">
              {campaign.category}
            </span>
            {campaign.status === "completed" && (
              <span className="flex items-center gap-1 rounded-wobblySm border-2 border-border bg-postit px-2 py-0.5 font-sans text-sm font-bold">
                <CheckCircle2 size={14} strokeWidth={2.5} />
                Done
              </span>
            )}
          </div>

          <h3 className="mb-3 font-display text-2xl font-bold">{campaign.title}</h3>
          <p className="mb-8 line-clamp-3 flex-grow font-sans text-lg text-muted-foreground">
            {campaign.description}
          </p>

          <div className="mt-auto mb-8">
            <div className="mb-3 flex justify-between font-sans text-lg">
              <span className="font-bold">{formatCurrency(campaign.raised)}</span>
              <span className="text-muted-foreground">
                of {formatCurrency(campaign.goal)}
              </span>
            </div>
            <div className="h-4 w-full border-[3px] border-border bg-muted">
              <div
                className="h-full bg-accent transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              {progress.toFixed(1)}% funded
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCampaign(campaign)}
            className="btn-primary w-full justify-center"
          >
            Donate now
          </button>
        </div>
      </SketchCard>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b-[3px] border-dashed border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rotate-[-1deg] rounded-wobblySm border-2 border-border bg-postit px-3 py-1 font-sans text-lg shadow-sketch">
            Open heart, red pen
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Support JNV
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Fund scholarships, labs, and little joys for students walking our
            old corridors.
          </p>

          {stats && (
            <div className="mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-wobblyMd border-[3px] border-border bg-foreground p-6 text-background shadow-sketch md:rotate-[-1deg]">
                <div className="font-display text-4xl font-bold md:text-5xl">
                  {formatCurrency(stats.data.stats.totalRaised)}
                </div>
                <div className="mt-2 font-sans text-lg text-background/80">
                  Total raised
                </div>
              </div>
              <div className="rounded-wobblyMd border-[3px] border-border bg-white p-6 shadow-sketch md:translate-y-2">
                <div className="font-display text-4xl font-bold md:text-5xl">
                  {stats.data.stats.activeCampaigns}
                </div>
                <div className="mt-2 font-sans text-lg text-muted-foreground">
                  Active drives
                </div>
              </div>
              <div className="rounded-wobblyMd border-[3px] border-border bg-white p-6 shadow-sketch md:rotate-1">
                <div className="font-display text-4xl font-bold md:text-5xl">
                  {stats.data.stats.totalDonors}
                </div>
                <div className="mt-2 font-sans text-lg text-muted-foreground">
                  Donors
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Impact Section */}
      <section className="border-t-[3px] border-dashed border-border py-20">
        <div className="container-custom">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Where your ink lands
          </h2>
          <div className="mt-4 h-1 max-w-md border-b-4 border-dashed border-foreground" />
          <p className="mt-6 max-w-2xl font-sans text-lg text-muted-foreground md:text-xl">
            Pick a lane; we track every rupee like a neat margin note.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                t: "Scholarships",
                d: "Keep bright kids learning without worrying about fees.",
              },
              {
                t: "Infrastructure",
                d: "Labs, roofs, desks—the unglamorous stuff that changes days.",
              },
              {
                t: "Resources",
                d: "Books, kits, and tools for classrooms that stay curious.",
              },
            ].map((x) => (
              <SketchCard key={x.t} tilt className="p-8" postit={x.t === "Infrastructure"}>
                <h3 className="font-display text-2xl font-bold">{x.t}</h3>
                <p className="mt-3 font-sans text-lg text-muted-foreground">
                  {x.d}
                </p>
              </SketchCard>
            ))}
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Active campaigns
          </h2>
          <div className="mt-4 h-1 max-w-sm border-b-4 border-dashed border-foreground" />
          <p className="mt-6 font-sans text-xl text-muted-foreground">
            Choose the story you want to underline.
          </p>

          {isLoading && <LoadingSpinner />}

          {!isLoading && campaignsData?.data?.campaigns?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaignsData.data.campaigns.map((campaign) => (
                <CampaignCard key={campaign._id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donation Modal */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
          onClick={() => setSelectedCampaign(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-wobblyMd border-[3px] border-border bg-background p-8 shadow-sketchLg md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-display tracking-tighter font-medium mb-6">
              Donate to {selectedCampaign.title}
            </h3>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <p className="font-sans text-muted-foreground mb-8 border-b-2 border-border pb-8">
                  Please login to make a donation
                </p>
                <a href="/login" className="btn btn-primary w-full text-center">
                  Login to Continue →
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm font-sans text-muted-foreground mb-8 p-4 border-[2px] border-border">
                  In a production environment, this would integrate with a payment gateway like Razorpay or Stripe.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="label">Donation Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="input font-mono text-xl"
                      min="1"
                    />
                  </div>
                  <button className="w-full btn btn-primary">
                    Proceed to Payment →
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedCampaign(null)}
              className="mt-8 w-full btn btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
