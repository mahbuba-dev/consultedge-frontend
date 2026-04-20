"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { applyExpertAction } from "@/src/services/expert.services";
import { getAllIndustries } from "@/src/services/industry.services";
import type { IIndustry, IIndustryListResponse } from "@/src/types/industry.types";
import { useState } from "react";

export default function ApplyExpertForm() {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

const mutation = useMutation({
    mutationFn: applyExpertAction,
    onSuccess: () => {
      toast.success("Application submitted successfully");
      // redirect to expert dashboard
      window.location.href = "/expert/dashboard";
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to apply"
      ),
  });

  const {
    data: industriesResponse,
    isLoading: isIndustriesLoading,
    isError: isIndustriesError,
  } = useQuery<IIndustryListResponse>({
    queryKey: ["industries", "options"],
    queryFn: getAllIndustries,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnMount: true,
  });

  const industries: IIndustry[] = Array.isArray(industriesResponse?.data)
    ? industriesResponse.data
    : [];


  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bio: "",
      title: "",
      experience: 0,
      consultationFee: 0,
      industryId: "",
    },
    onSubmit: ({ value }) => {
      if (!profilePhoto) {
        mutation.mutate({
          ...value,
          experience: Number(value.experience ?? 0),
          consultationFee: Number(value.consultationFee ?? 0),
          profilePhoto: null,
        });
        return;
      }

      const formData = new FormData();
      formData.append("fullName", value.fullName);
      formData.append("email", value.email);
      formData.append("phone", value.phone || "");
      formData.append("bio", value.bio || "");
      formData.append("title", value.title || "");
      formData.append("experience", String(Number(value.experience ?? 0)));
      formData.append(
        "consultationFee",
        String(Number(value.consultationFee ?? 0))
      );
      formData.append("industryId", value.industryId);
      formData.append("profilePhoto", profilePhoto);

      mutation.mutate(formData);
    },
  });

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border">
      <CardHeader>
        <CardTitle>Apply as an Expert</CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="fullName">
            {(field) => (
              <Input
                placeholder="Full Name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <Input
                placeholder="Email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => (
              <Input
                placeholder="Phone"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="bio">
            {(field) => (
              <Textarea
                placeholder="Short bio"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="title">
            {(field) => (
              <Input
                placeholder="Expert Title"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="experience">
            {(field) => (
              <Input
                type="number"
                placeholder="Experience"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            )}
          </form.Field>

          <form.Field name="consultationFee">
            {(field) => (
              <Input
                type="number"
                placeholder="Consultation Fee"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            )}
          </form.Field>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Profile Picture</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
              className="h-auto py-2"
            />
            {profilePhoto && (
              <p className="text-xs text-muted-foreground">
                Selected: {profilePhoto.name}
              </p>
            )}
          </div>

           {/* ⭐ Industry Dropdown */}
          <form.Field
            name="industryId"
            children={(field) => (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Industry</label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border p-2"
                  disabled={isIndustriesLoading || isIndustriesError || industries.length === 0}
                >
                  <option value="">
                    {isIndustriesLoading
                      ? "Loading industries..."
                      : isIndustriesError
                        ? "Failed to load industries"
                        : industries.length === 0
                          ? "No industries available"
                          : "Select Industry"}
                  </option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
                {isIndustriesError && (
                  <p className="text-sm text-red-500">
                    Could not load industries right now. Please refresh and try again.
                  </p>
                )}
              </div>
            )}
          />
          <Button
            type="submit"
            disabled={mutation.isPending || isIndustriesLoading}
            className="w-full"
          >
            {mutation.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
