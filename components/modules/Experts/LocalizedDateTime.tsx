"use client";

import React from "react";
import { format, parseISO } from "date-fns";

interface LocalizedDateTimeProps {
  start?: string | null;
  end?: string | null;
}

// Parse an ISO string from the API and return a Date in the user's local timezone.
// If the string includes a TZ (`Z` or `+hh:mm`), Date will convert to local automatically.
// If the string has no TZ, we assume it is already in the user's local wall-clock time.
const parseToLocal = (iso?: string | null) => {
  if (!iso) return null;

  let parsed: Date;
  try {
    parsed = parseISO(iso);
  } catch {
    parsed = new Date(iso);
  }

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const LocalizedDateTime: React.FC<LocalizedDateTimeProps> = ({ start, end }) => {
  const startDate = parseToLocal(start);
  const endDate = parseToLocal(end);

  if (!startDate) return <span>Date unavailable</span>;

  const dateStr = format(startDate, "EEEE, MMMM d, yyyy");
  const startTimeStr = format(startDate, "h:mm a");
  const endTimeStr = endDate ? format(endDate, "h:mm a") : null;

  return (
    <>
      <p className="text-base font-semibold text-foreground">{dateStr}</p>

      <p className="text-sm text-muted-foreground">
        {endTimeStr ? `${startTimeStr} - ${endTimeStr}` : startTimeStr}
      </p>
    </>
  );
};

export default LocalizedDateTime;
