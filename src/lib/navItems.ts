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
      ],
    },
    {
      title: "Settings",
      items: [
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
        title: "My Clients",
        href: "/expert/dashboard/my-clients",
        icon: "Users",
      },
      {
        title: "My Schedules",
        href: "/expert/dashboard/my-schedules",
        icon: "Clock",
      },
     
      {
        title: "My Reviews",
        href: "/expert/dashboard/my-reviews",
        icon: "Star",
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
        title: "Schedules",
        href: "/admin/dashboard/schedule-management",
        icon: "Clock",
      },
      {
        title: "Industries",
        href: "/admin/dashboard/industries-management",
        icon: "Folder",
      },
      
      
      {
        title: "Reviews",
        href: "/admin/dashboard/reviews-management",
        icon: "Star",
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
        href: "/dashboard/my-bookings",
        icon: "Calendar",
      },
   
      {
        title: "My Profile",
        href: "/dashboard/profile",
        icon: "User",
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