import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IExpert } from "@/src/types/expert.types";
import { BadgeCheck, BriefcaseBusiness, Wallet } from "lucide-react";
import Link from "next/link";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function ExpertCard({ expert }: { expert: IExpert }) {
  const expertPrice = expert.price ?? expert.consultationFee;
  const shortBio =
    expert.bio.length > 140 ? `${expert.bio.slice(0, 140)}...` : expert.bio;

  return (
    <Card className="group overflow-hidden border-violet-200/70 bg-card shadow-sm shadow-violet-500/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-violet-500/15">
      <div className="h-1 w-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-violet-600" />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar size="lg" className="size-14">
            {expert.profilePhoto ? (
              <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
            ) : null}
            <AvatarFallback>{getInitials(expert.fullName)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                </span>
                Active now
              </span>

              {expert.isVerified ? (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-violet-100 text-violet-700"
                >
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </Badge>
              ) : null}

              {expert.industry?.name ? (
                <Badge
                  variant="outline"
                  className="border-violet-200 bg-violet-50 text-violet-700"
                >
                  {expert.industry.name}
                </Badge>
              ) : null}
            </div>

            <h2 className="text-lg font-semibold text-foreground">
              {expert.fullName}
            </h2>
            <p className="text-sm text-muted-foreground">{expert.title}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-violet-50/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-violet-700">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Experience
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {expert.experience} years
            </p>
          </div>

          <div className="rounded-2xl bg-fuchsia-50/80 p-3">
            <div className="mb-1 flex items-center gap-2 text-fuchsia-700">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Consultation fee
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {typeof expertPrice === "number"
                ? `$${expertPrice}`
                : "Contact for pricing"}
            </p>
          </div>
        </div>

        {expert.bio ? (
          <p className="text-sm leading-6 text-muted-foreground">{shortBio}</p>
        ) : null}

        <Link href={`/experts/${expert.id}`} className="block">
          <Button className="mt-1 w-full bg-violet-600 text-white shadow-md shadow-violet-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-700">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
