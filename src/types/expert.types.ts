export interface IExpert {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  experience: number;
  consultationFee: number;
  profilePhoto: string | null;
  industryId: string;
  industry: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}