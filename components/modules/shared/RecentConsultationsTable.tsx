import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PieChartData } from "@/src/types/dashboard.types";

interface RecentConsultationsTableProps {
  data: PieChartData[];
  title?: string;
  description?: string;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  ONGOING: "bg-sky-100 text-sky-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const STATUS_INSIGHTS: Record<string, string> = {
  COMPLETED: "Closed successfully",
  PENDING: "Needs follow-up soon",
  ONGOING: "In progress now",
  CANCELLED: "Check rebooking opportunities",
};

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const RecentConsultationsTable = ({
  data,
  title = "Recent Consultation Snapshot",
  description = "Live consultation overview generated from the latest dashboard status data.",
}: RecentConsultationsTableProps) => {
  const rows = [...(data || [])]
    .sort((left, right) => Number(right.count || 0) - Number(left.count || 0))
    .slice(0, 5);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Insight</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={STATUS_BADGE_CLASS[item.status] || "bg-slate-100 text-slate-700"}
                    >
                      {formatStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{item.count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {STATUS_INSIGHTS[item.status] || "Part of the consultation workflow"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      Live
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No consultation activity is available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableCaption>
            This table reflects the latest consultation summary available to your dashboard.
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentConsultationsTable;
