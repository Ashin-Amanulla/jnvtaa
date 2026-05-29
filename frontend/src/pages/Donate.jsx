import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { donationsAPI } from "@/api";
import { useAuthStore } from "@/store/auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { SketchCard } from "@/components/SketchCard";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src ="https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donate() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

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
            <span className="rounded-xl border-2 border-border bg-brand px-2 py-0.5 font-sans text-sm text-background shadow-card">
              {campaign.category}
            </span>
            {campaign.status === "completed" && (
              <span className="flex items-center gap-1 rounded-xl border-2 border-border bg-house-yellow-soft px-2 py-0.5 font-sans text-sm font-bold">
                <CheckCircle2 size={14} strokeWidth={2} />
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
            <div className="h-4 w-full border border-border bg-muted">
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

  const handlePayment = async () => {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1) {
      setPaymentError("Please enter a valid donation amount.");
      return;
    }

    setIsPaying(true);
    setPaymentError("");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Payment gateway failed to load.");
      }

      const orderRes = await donationsAPI.createOrder({
        campaign: selectedCampaign._id,
        amount: parsedAmount,
        paymentMethod: "razorpay",
        isAnonymous: false,
      });

      const { order, keyId } = orderRes.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "JNVTAA",
        description: selectedCampaign.title,
        order_id: order.id,
        prefill: {
          name: user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
          email: user?.email,
        },
        handler: async (response) => {
          try {
            await donationsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaymentSuccess(true);
            queryClient.invalidateQueries({ queryKey: ["donation-campaigns"] });
            queryClient.invalidateQueries({ queryKey: ["donation-stats"] });
          } catch (err) {
            setPaymentError(err.message || "Payment verification failed.");
          } finally {
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setPaymentError("Payment failed. Please try again.");
        setIsPaying(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || "Unable to initiate payment.");
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border py-16 md:py-24">
        <div className="container-custom">
          <p className="mb-3 inline-block rounded-xl border-2 border-border bg-house-yellow-soft px-3 py-1 font-sans text-lg shadow-card">
            Give back to Navodaya
          </p>
          <h1 className="font-display text-5xl font-bold uppercase md:text-6xl lg:text-7xl">
            Support JNV
          </h1>
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-xl text-muted-foreground md:text-2xl">
            Fund scholarships, laboratories, and student welfare at JNV
            Thiruvananthapuram — honoring the NVS mandate through alumni giving.
          </p>

          {stats && (
            <div className="mt-14 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-foreground p-6 text-background shadow-card">
                <div className="font-display text-4xl font-bold md:text-5xl">
                  {formatCurrency(stats.data.stats.totalRaised)}
                </div>
                <div className="mt-2 font-sans text-lg text-background/80">
                  Total raised
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-card md:translate-y-2">
                <div className="font-display text-4xl font-bold md:text-5xl">
                  {stats.data.stats.activeCampaigns}
                </div>
                <div className="mt-2 font-sans text-lg text-muted-foreground">
                  Active drives
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
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
      <section className="border-t border-border py-20">
        <div className="container-custom">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            Where your contribution goes
          </h2>
          <div className="mt-4 h-1 max-w-md border-b-2 border-brand" />
          <p className="mt-6 max-w-2xl font-sans text-lg text-muted-foreground md:text-xl">
            Every rupee is tracked transparently and directed toward programs
            that benefit current Navodayans at JNV Thiruvananthapuram.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                t: "Scholarships",
                d: "Help talented students continue their education without financial barriers.",
              },
              {
                t: "Infrastructure",
                d: "Improve laboratories, classrooms, and campus facilities for every batch.",
              },
              {
                t: "Resources",
                d: "Provide books, equipment, and learning materials for curious Navodayan minds.",
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
          <div className="mt-4 h-1 max-w-sm border-b-2 border-brand" />
          <p className="mt-6 font-sans text-xl text-muted-foreground">
            Choose a campaign that aligns with how you wish to give back.
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
            className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-cardHover md:p-10"
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
            ) : paymentSuccess ? (
              <div className="space-y-6 text-center">
                <CheckCircle2 className="mx-auto text-house-green" size={48} />
                <p className="font-sans text-lg">
                  Thank you for your generous contribution to {selectedCampaign.title}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaign(null);
                    setPaymentSuccess(false);
                    setAmount("");
                  }}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-6 font-sans text-sm text-muted-foreground">
                  Secure payment via Razorpay. You will receive a receipt after successful payment.
                </p>
                {paymentError && (
                  <p className="mb-4 rounded-xl border-2 border-house-red bg-white p-3 font-sans text-sm text-house-red">
                    {paymentError}
                  </p>
                )}
                <div className="space-y-6">
                  <div>
                    <label className="label">Donation Amount (INR)</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="input font-mono text-xl"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    onClick={handlePayment}
                    disabled={isPaying}
                  >
                    {isPaying ? "Processing…" : "Proceed to Payment →"}
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
