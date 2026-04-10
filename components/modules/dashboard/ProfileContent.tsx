"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/src/services/auth.services";
import { IUserProfile } from "@/src/types/auth.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function ProfileContent() {
  const { data, isLoading, isError } = useQuery<IUserProfile>({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const user = data;

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  if (isError || !user) {
    return (
      <p className="text-center text-destructive">
        Failed to load profile information.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold">
              My Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your personal information
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/my-profile/update-profile">
              <Button variant="outline">Edit Profile</Button>
            </Link>
            <Button variant="default">Change Password</Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Profile Info */}
      <Card className="shadow-sm border">
        <CardContent className="space-y-6 py-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <ProfileField label="Full Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField
                label="Role"
                value={user.role.toLowerCase().replace("_", " ")}
              />
              <ProfileField label="Account Status" value={user.status ?? "Active"} />
            </div>
          </div>

          {/* Expert Section */}
          {user.role === "EXPERT" && user.expert && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Expert Details</h3>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <ProfileField
                  label="Industry"
                  value={user.expert?.industry?.name}
                />
                <ProfileField label="Title" value={user.expert?.title} />
                <ProfileField
                  label="Experience"
                  value={
                    typeof user.expert?.experience === "number"
                      ? `${user.expert.experience} years`
                      : undefined
                  }
                />
              </div>
              
              <Link href="/expert/dashboard">
              <Button className="mt-3" variant="secondary">
                View Expert Dashboard
              </Button>
            </Link>
            </div>
          )}

          {/* Client Section */}
          {user.role === "CLIENT" && user.client && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Client Details</h3>
              <Separator />

              <ProfileField label="Client Name" value={user.client?.fullName} />

              <Link href="/client/bookings">
                <Button className="mt-3" variant="secondary">
                  View Bookings
                </Button>
              </Link>
            </div>
          )}

          {user.role === "ADMIN" && (
            <Link href="/admin/dashboard">
              <Button className="mt-3" variant="secondary">
                Go to Admin Panel
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* Reusable Field Component */
function ProfileField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-medium">{value || "—"}</p>
    </div>
  );
}
