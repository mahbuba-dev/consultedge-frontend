import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIconComponent } from "@/src/lib/iconMapper";
import { cn } from "@/src/lib/utils";
import { createElement } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  iconName,
  description,
  className,
}: StatsCardProps) => {
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/80",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-foreground/85">
          {title}
        </CardTitle>

        {/* Icon Container */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
          {createElement(getIconComponent(iconName), {
            className: "w-5 h-5",
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>

        {description && (
          <p className="text-xs font-medium text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;