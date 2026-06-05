import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  legend?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  skeleton?: React.ReactNode;
}

export const ChartWrapper = ({
  title,
  description,
  children,
  className,
  legend,
  actions,
  loading,
  empty,
  error,
  skeleton,
}: ChartWrapperProps) => (
  <Card className={cn("w-full h-full flex flex-col", className)}>
    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
      <div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
      {actions && <div>{actions}</div>}
    </CardHeader>
    {legend && <div className="px-6 pb-2">{legend}</div>}
    <CardContent className="flex-1 flex flex-col justify-center">
      {loading ? (
        skeleton || <div className="h-40 animate-pulse bg-muted/60 rounded-xl" />
      ) : error ? (
        <div className="text-center text-destructive">Error loading chart.</div>
      ) : empty ? (
        <div className="text-center text-muted-foreground">No data available.</div>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);
export default ChartWrapper;
