export interface ITestimonial {
  id: string;
  rating: number;
  comment?: string | null;
  clientId: string;
  expertId: string;
  reviewerName?: string | null;
  reviewerImage?: string | null;
  consultationId: string;
  createdAt: string;
  updatedAt?: string;
  isHidden?: boolean;
  status?: "APPROVED" | "HIDDEN" | "PENDING";
  expertReply?: string | null;
  repliedAt?: string;
  moderationStatus?: string;
  client?: {
    id?: string;
    fullName?: string;
    email?: string;
    user?: {
      name?: string;
      email?: string;
    } | null;
  } | null;
  expert?: {
    id?: string;
    fullName?: string;
    title?: string;
  } | null;
  consultation?: {
    id?: string;
    date?: string;
    status?: string;
  } | null;
}
