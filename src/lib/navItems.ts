import { zhCN } from "date-fns/locale";
import { NavSection } from "../types/dashboard.types";
import { getDefaultDashboardRoute, UserRole } from "./authUtilis";

// COMMON NAV ITEMS
export const getCommonNavItems = (role: UserRole): NavSection[] => {
  const defaultDashboard = getDefaultDashboardRoute(role);

  return [
    {
      items: [
        {
          title: "Home",
          href: "/",
          icon: "Home",
        },
        {
          title: "Dashboard",
          href: defaultDashboard,
          icon: "LayoutDashboard",
        },
        {
          title: "My Profile",
          href: "/my-profile",
          icon: "User",
        },
        {
          title: "Change Password",
          href: "/change-password",
          icon: "Settings",
        },
      ],
    },
  ];
};

// EXPERT NAV ITEMS (→ Expert)
export const expertNavItems: NavSection[] = [
  {
    title: "Expert Management",
    items: [
       {
        title: "Availability",
        icon: "Clock",
        href: "",
        children: [
          {
            title: "Create Slots",
            href: "/expert/dashboard/set-availability",
            icon: "PlusCircle",
          },
          {
            title: "View Published Slots",
            href: "/expert/dashboard/my-schedules",
            icon: "CalendarDays",
          },
        ],
      },
      {
        title: "My Sessions",
        href: "/expert/dashboard/my-sessions",
        icon: "Users",
      },
     
      {
        title: "My Reviews",
        href: "/expert/dashboard/my-reviews",
        icon: "Star",
      },
      {
        title: "Messages",
        href: "/expert/dashboard/messages",
        icon: "MessageCircleMore",
      },
    ],
  },
];

// ADMIN NAV ITEMS (Cleaned for ConsultEdge)
export const adminNavItems: NavSection[] = [
  {
    title: "User Management",
    items: [
     
      {
        title: "Experts",
        href: "/admin/dashboard/expert-management",
        icon: "UserCog",
      },
      {
        title: "Clients",
        href: "/admin/dashboard/client-management",
        icon: "Users",
      },
    
    ],
  },
  {
    title: "Platform Management",
    items: [
      {
        title: "Bookings",
        href: "/admin/dashboard/bookings-management",
        icon: "Calendar",
      },
     
      {
        title: "Industries",
        icon: "Folder",
        children: [
          {
            title: "Create Industry",
            href: "/admin/dashboard/industries-management/create",
            icon: "PlusCircle",
          },
          {
            title: "Manage Industries",
            href: "/admin/dashboard/industries-management",
            icon: "List",
          },
        ],
        href: ""
      },
      
      
      {
        title: "Reviews",
        href: "/admin/dashboard/reviews-management",
        icon: "Star",
      },
      {
       title: "Messages",
       href: "/admin/dashboard/messages",
       icon: "MessageCircleMore",
      },
   
    ],
  },
];

// CLIENT NAV ITEMS (Patient → Client)
export const clientNavItems: NavSection[] = [
  {
    title: "Consultations",
    items: [
      {
        title: "My Consultations",
        href: "/dashboard/consultations",
        icon: "Calendar",
      },
      {
        title: "Payment success",
        href: "/dashboard/payment/consultation-success",
        icon: "CheckCircle2",
      },
      {
        title: "Messages",
        href: "/dashboard/chat",
        icon: "MessageCircleMore",
      },
      
    ],
  },
  {
    title: "AI",
    items: [
      {
        title: "AI Assistant",
        href: "/dashboard/ai-chat",
        icon: "Sparkles",
      },
    ],
  },
 
];

// FINAL ROLE-BASED NAV
export const getNavItemsByRole = (role: UserRole): NavSection[] => {
  const common = getCommonNavItems(role);

  switch (role) {
    case "ADMIN":
      return [...common, ...adminNavItems];

    case "EXPERT":
      return [...common, ...expertNavItems];

    case "CLIENT":
      return [...common, ...clientNavItems];

    default:
      return common;
  }
};