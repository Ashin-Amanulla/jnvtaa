import { format, formatDistance, formatRelative, isValid } from "date-fns";

export const formatDate = (date, formatStr = "PPP", fallback = "—") => {
  if (date == null || date === "") return fallback;
  const parsed = new Date(date);
  if (!isValid(parsed)) return fallback;
  return format(parsed, formatStr);
};

export const formatRelativeDate = (date, fallback = "—") => {
  if (date == null || date === "") return fallback;
  const parsed = new Date(date);
  if (!isValid(parsed)) return fallback;
  return formatRelative(parsed, new Date());
};

export const formatTimeAgo = (date, fallback = "—") => {
  if (date == null || date === "") return fallback;
  const parsed = new Date(date);
  if (!isValid(parsed)) return fallback;
  return formatDistance(parsed, new Date(), { addSuffix: true });
};

export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat("en-IN").format(number);
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const getBatchId = (batch) => {
  if (!batch) return "";
  if (typeof batch === "string") return batch;
  return batch._id?.toString?.() ?? "";
};

export const getBatchDisplayYear = (batch) =>
  batch?.passoutYear ?? batch?.year ?? null;

export const formatBatchOf = (batch) => {
  const year = getBatchDisplayYear(batch);
  return year ? `Batch of ${year}` : null;
};
