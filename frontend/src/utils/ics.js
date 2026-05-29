function formatIcsDate(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function downloadEventIcs(event) {
  const start = formatIcsDate(event.date);
  const end = event.endDate
    ? formatIcsDate(event.endDate)
    : formatIcsDate(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000));

  const location = event.location?.isVirtual
    ? event.location.virtualLink || "Online"
    : [event.location?.venue, event.location?.city, event.location?.country]
        .filter(Boolean)
        .join(", ");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JNVTAA//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event._id}@jnvtaa.in`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title.replace(/[,;\\]/g, "")}`,
    event.description
      ? `DESCRIPTION:${event.description.slice(0, 500).replace(/\n/g, "\\n")}`
      : "",
    location ? `LOCATION:${location.replace(/[,;\\]/g, "")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
