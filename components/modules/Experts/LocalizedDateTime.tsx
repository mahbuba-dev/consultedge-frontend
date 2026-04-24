"use client";

import React from "react";
import { format, parseISO } from "date-fns";

interface LocalizedDateTimeProps {
  start?: string | null;
  end?: string | null;
}

// Schedule slots are wall-clock values: the expert typed "8:00 PM" and we want
// every viewer to see "8:00 PM" regardless of timezone. Some backends echo the
// stored value with a trailing "Z" or "+00:00" which JS would then convert into
// the viewer's local timezone, producing visible shifts (e.g. 8 PM → 4 PM).
// Strip any timezone designator before parsing so the numbers stay literal.
const parseWallClock = (iso?: string | null) => {
  if (!iso) return null;

  const stripped = iso
    .trim()
    // remove trailing Z
    .replace(/Z$/i, "")
    // remove trailing +HH:MM / -HH:MM offset
    .replace(/[+-]\d{2}:?\d{2}$/, "");

  let parsed: Date;
  try {
    parsed = parseISO(stripped);
  } catch {
    parsed = new Date(stripped);
  }

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const LocalizedDateTime: React.FC<LocalizedDateTimeProps> = ({ start, end }) => {
  const startDate = parseWallClock(start);
  const endDate = parseWallClock(end);

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
