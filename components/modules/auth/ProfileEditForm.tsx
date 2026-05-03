"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMe, updateProfile } from "@/src/services/auth.services";
import { IUserProfile, IUpdateProfilePayload } from "@/src/types/auth.types";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch user
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  // getMe returns IUserProfile directly (from response.data)
  const user = data as IUserProfile | undefined;

  // Mutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/my-profile");
      router.refresh();
    },
    onError: (error: unknown) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message ===
          "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Failed to update profile";

      toast.error(message);
    },
  });

  // TanStack Form
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      title: "",
      experience: 0,
      industryId: "",
      fullName: "",
    } satisfies IUpdateProfilePayload,
    onSubmit: async ({ value }) => {
      const normalizedPayload: IUpdateProfilePayload = {
        name: value.name?.trim() || undefined,
        email: value.email?.trim() || undefined,
      };

      if (user?.role === "EXPERT") {
        normalizedPayload.title = value.title?.trim() || undefined;
        normalizedPayload.industryId = value.industryId?.trim() || undefined;
        normalizedPayload.experience =
          typeof value.experience === "number" && Number.isFinite(value.experience)
            ? value.experience
            : undefined;
      }

      if (user?.role === "CLIENT") {
        normalizedPayload.fullName = value.fullName?.trim() || undefined;
      }

      mutation.mutate(normalizedPayload);
    },
  });

  useEffect(() => {
    if (!user) return;

    form.reset({
      name: user.name ?? "",
      email: user.email ?? "",
      title: user.expert?.title ?? "",
      experience: user.expert?.experience ?? 0,
      industryId: user.expert?.industry?.id ?? "",
      fullName: user.client?.fullName ?? "",
    });
  }, [user, form]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p className="text-red-500">Failed to load profile. Please refresh.</p>;
  if (!user) return <p className="text-muted-foreground">No profile data available.</p>;

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Name */}
          <form.Field name="name">
            {(field) => (
              <Input
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Full Name"
              />
            )}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => (
              <Input
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Email"
              />
            )}
          </form.Field>

          {/* Expert Fields */}
          {user.role === "EXPERT" && (
            <>
              <form.Field name="title">
                {(field) => (
                  <Input
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Title"
                  />
                )}
              </form.Field>

              <form.Field name="experience">
                {(field) => (
                  <Input
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value))
                    }
                    placeholder="Experience (years)"
                  />
                )}
              </form.Field>

              <form.Field name="industryId">
                {(field) => (
                  <Input
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Industry ID"
                  />
                )}
              </form.Field>
            </>
          )}

          {/* Client Fields */}
          {user.role === "CLIENT" && (
            <form.Field name="fullName">
              {(field) => (
                <Input
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Client Full Name"
                />
              )}
            </form.Field>
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
