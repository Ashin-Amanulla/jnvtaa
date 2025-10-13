import { format, formatDistance, formatRelative } from "date-fns";

export const formatDate = (date, formatStr = "PPP") => {
  return format(new Date(date), formatStr);
};

export const formatRelativeDate = (date) => {
  return formatRelative(new Date(date), new Date());
};

export const formatTimeAgo = (date) => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
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
