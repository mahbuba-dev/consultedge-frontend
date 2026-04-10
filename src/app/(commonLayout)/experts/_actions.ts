"use server";

import { getExperts as getExpertsFromService } from "@/src/services/expert.services";

export const getExperts = async (queryString?: string) => {
  return getExpertsFromService(queryString);
};