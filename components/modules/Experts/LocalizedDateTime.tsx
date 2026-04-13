"use client";
import { format, parseISO } from "date-fns";

import React from "react";
import { utcToZonedTime } from "./date-tz-util";

interface LocalizedDateTimeProps {
  start?: string | null;
  end?: string | null;
}

const getLocalDate = (iso?: string | null) => {
  if (!iso) return null;
  let parsed = parseISO(iso);
  if (Number.isNaN(parsed.getTime())) {
    parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return null;
  }
  return utcToZonedTime(parsed, Intl.DateTimeFormat().resolvedOptions().timeZone);
};

const LocalizedDateTime: React.FC<LocalizedDateTimeProps> = ({ start, end }) => {
  const startDate = getLocalDate(start);
  const endDate = getLocalDate(end);
  if (!startDate) return <span>Date unavailable</span>;
  return (
    <>
      <p className="text-base font-semibold text-foreground">
        {format(startDate, "EEEE, MMMM d, yyyy")}
      </p>
      <p className="text-sm text-muted-foreground">
        {endDate
          ? `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
          : format(startDate, "h:mm a")}
      </p>
    </>
  );
};

export default LocalizedDateTime;