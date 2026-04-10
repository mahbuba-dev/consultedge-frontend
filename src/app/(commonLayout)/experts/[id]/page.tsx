import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  DollarSign,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";

import BookSessionPanel from "@/components/modules/Bokings/BookSessionPanel";
import TestimonialCard from "@/components/modules/shared/TestimonialCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserInfo } from "@/src/services/auth.services";
import { getExpertById } from "@/src/services/expert.services";
import { getAllExpertSchedules } from "@/src/services/expertSchdule";
import { getTestimonialsByExpert } from "@/src/services/testimonial.services";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatCurrency = (value?: number) =>
  typeof value === "number" ? `$${value}` : "Contact for pricing";

const ExpertDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  try {
    const [expert, currentUser, testimonials, availabilityResponse] = await Promise.all([
      getExpertById(id),
      getUserInfo(),
      getTestimonialsByExpert(id).catch(() => []),
      getAllExpertSchedules({
        expertId: id,
        isBooked: false,
        isDeleted: false,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      }).catch(() => ({ data: [] })),
    ]);

    const availability = Array.isArray(availabilityResponse?.data)
      ? availabilityResponse.data
      : [];

    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
        <Link
          href="/experts"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 transition hover:text-violet-900"
        >
          <ArrowLeft className="size-4" />
          Back to experts
        </Link>

        <Card className="overflow-hidden border-0 bg-linear-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-xl">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
            <Avatar size="lg" className="size-24 border-4 border-white/30 shadow-lg">
              {expert.profilePhoto ? (
                <AvatarImage src={expert.profilePhoto} alt={expert.fullName} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold text-slate-900">
                {getInitials(expert.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-white/10 text-white hover:bg-white/10">
                  <Sparkles className="mr-1 size-3.5" />
                  Expert Profile
                </Badge>

                {expert.isVerified ? (
                  <Badge className="bg-emerald-500/20 text-white hover:bg-emerald-500/20">
                    <BadgeCheck className="mr-1 size-3.5" />
                    Verified Expert
                  </Badge>
                ) : null}
              </div>

              <div>
                <h1 className="text-3xl font-bold md:text-4xl">{expert.fullName}</h1>
                <p className="mt-1 text-base text-white/85 md:text-lg">{expert.title}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="#book-session">
                  <Button className="bg-white text-slate-900 hover:bg-white/90">
                    <Sparkles className="mr-2 size-4" />
                    Book Now
                  </Button>
                </Link>

                <Link href={`mailto:${expert.email}`}>
                  <Button
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  >
                    <Mail className="mr-2 size-4" />
                    Email Expert
                  </Button>
                </Link>

                {expert.phone ? (
                  <Link href={`tel:${expert.phone}`}>
                    <Button
                      variant="outline"
                      className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      <Phone className="mr-2 size-4" />
                      Call Now
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-linear-to-br from-violet-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <BriefcaseBusiness className="size-5 text-violet-700" />
              <p className="text-lg font-semibold text-foreground">
                {expert.experience} years in consulting
              </p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-sky-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle>Industry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-foreground">
                {expert.industry?.name || "General consulting"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-emerald-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle>Consultation Fee</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <DollarSign className="size-5 text-emerald-700" />
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(expert.consultationFee ?? expert.price)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>About this expert</CardTitle>
              <CardDescription>
                Learn more about the expert’s focus, background, and consulting style.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-muted-foreground">
                {expert.bio || "This expert has not added a bio yet."}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick summary</CardTitle>
              <CardDescription>
                A snapshot to help clients decide faster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Best fit for
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {expert.industry?.name || "Business and strategy"} consultations
                </p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Contact
                </p>
                <p className="mt-1 font-medium text-foreground">{expert.email}</p>
                <p className="text-sm text-muted-foreground">{expert.phone || "Phone not provided"}</p>
              </div>

              <Link href="/experts" className="inline-flex w-full">
                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  Explore more experts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2 bg-fuchsia-100 text-fuchsia-700">
              Book a session
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">Live availability & checkout</h2>
            <p className="text-muted-foreground">
              Choose an open slot, review the session summary, and continue with a secure booking flow.
            </p>
          </div>

          <BookSessionPanel
            expertId={expert.id}
            expertName={expert.fullName}
            expertTitle={expert.title}
            consultationFee={expert.consultationFee ?? expert.price}
            availability={availability}
            isLoggedIn={Boolean(currentUser)}
            userRole={currentUser?.role ?? null}
          />
        </section>

        <section className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2 bg-violet-100 text-violet-700">
              Reviews
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">Client feedback</h2>
            <p className="text-muted-foreground">
              Reviews shared by clients who have consulted with this expert.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.length > 0 ? (
              testimonials.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))
            ) : (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardContent className="py-8 text-center text-muted-foreground">
                  This expert has not received testimonials yet.
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
};

export default ExpertDetailsPage;