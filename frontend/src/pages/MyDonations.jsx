import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Download, Loader2 } from "lucide-react";
import { donationsAPI, downloadDonationReceipt } from "@/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatCurrency, formatDate } from "@/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyDonations() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["donations", "mine"],
    queryFn: () => donationsAPI.getMyDonations(),
  });

  const donations = data?.data?.donations || [];

  const handleDownload = async (donationId) => {
    setDownloadingId(donationId);
    setDownloadError("");
    try {
      await downloadDonationReceipt(donationId);
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My donations</h1>
        <p className="text-sm text-muted-foreground">
          Receipts for completed donations to JNVTAA campaigns.
        </p>
      </div>

      {downloadError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          {downloadError}
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {!isLoading && donations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle className="text-lg">No donations yet</CardTitle>
            <CardDescription className="mt-2">
              Support a campaign and your receipts will show up here.
            </CardDescription>
            <Button asChild className="mt-6">
              <Link to="/donate">Donate</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {donations.map((donation) => (
          <Card key={donation._id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">
                  {donation.campaign?.title || "Campaign"}
                </CardTitle>
                <CardDescription className="text-base font-medium text-primary">
                  {formatCurrency(donation.amount, donation.currency || "INR")}
                </CardDescription>
              </div>
              {donation.paymentStatus === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(donation._id)}
                  disabled={downloadingId === donation._id}
                >
                  {downloadingId === donation._id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Receipt
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {formatDate(donation.createdAt)} · {donation.paymentStatus}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
