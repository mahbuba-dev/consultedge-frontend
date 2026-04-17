"use client";

import React from "react";
import { parseISO } from "date-fns";
import { format } from "date-fns-tz";
import { utcToZonedTime } from "./date-tz-util";

interface LocalizedDateTimeProps {
  start?: string | null;
  end?: string | null;
}

const getLocalDate = (iso?: string | null) => {
  if (!iso) return null;

  let parsed: Date;

  try {
    parsed = parseISO(iso);
  } catch {
    parsed = new Date(iso);
  }

  if (Number.isNaN(parsed.getTime())) return null;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return utcToZonedTime(parsed, tz);
};

const LocalizedDateTime: React.FC<LocalizedDateTimeProps> = ({ start, end }) => {
  const startDate = getLocalDate(start);
  const endDate = getLocalDate(end);

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
