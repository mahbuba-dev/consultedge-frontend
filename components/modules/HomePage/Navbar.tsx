import { getDefaultDashboardRoute, UserRole } from "@/src/lib/authUtilis";
import { getUserInfo } from "@/src/services/auth.services";

import NavbarClient from "./NavbarClient";

const baseNavItems = [
  { label: "Home", href: "/" },
  { label: "Experts", href: "/experts" },
  { label: "Industries", href: "/industries" },
  { label: "Insights", href: "/insights" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Help", href: "/help" },
  { label: "Legal", href: "/terms" },
  { label: "Apply Expert", href: "/apply-expert" },
];

const Navbar = async () => {
  const user = await getUserInfo();
  const isLoggedIn = Boolean(user);
  const dashboardHref = user?.role
    ? getDefaultDashboardRoute(user.role as UserRole)
    : "/dashboard";

  const navItems = baseNavItems;

  const userLabel = user?.name || user?.client?.fullName || user?.expert?.fullName;

  return (
    <NavbarClient
      navItems={navItems}
      isLoggedIn={isLoggedIn}
      dashboardHref={dashboardHref}
      role={user?.role ?? null}
      userLabel={userLabel ?? null}
    />
  );
};

export default Navbar;
