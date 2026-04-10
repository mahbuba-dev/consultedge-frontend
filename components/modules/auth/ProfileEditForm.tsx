"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMe, updateProfile } from "@/src/services/auth.services";
import { ApiResponse } from "@/src/types/api.types";
import { IUserProfile, IUpdateProfilePayload } from "@/src/types/auth.types";

import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditProfile() {
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
    onSuccess: () => toast.success("Profile updated successfully"),
    onError: () => toast.error("Failed to update profile"),
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
      mutation.mutate(value);
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
          <form.Field
            name="name"
            children={(field) => (
              <Input
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Full Name"
              />
            )}
          />

          {/* Email */}
          <form.Field
            name="email"
            children={(field) => (
              <Input
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Email"
              />
            )}
          />

          {/* Expert Fields */}
          {user.role === "EXPERT" && (
            <>
              <form.Field
                name="title"
                children={(field) => (
                  <Input
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Title"
                  />
                )}
              />

              <form.Field
                name="experience"
                children={(field) => (
                  <Input
                    type="number"
                    value={field.state.value ?? ""}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value))
                    }
                    placeholder="Experience (years)"
                  />
                )}
              />

              <form.Field
                name="industryId"
                children={(field) => (
                  <Input
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Industry ID"
                  />
                )}
              />
            </>
          )}

          {/* Client Fields */}
          {user.role === "CLIENT" && (
            <form.Field
              name="fullName"
              children={(field) => (
                <Input
                  value={field.state.value ?? ""}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Client Full Name"
                />
              )}
            />
          )}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
