import { getDefaultDashboardRoute, UserRole } from "@/src/lib/authUtilis";
import { getUserInfo } from "@/src/services/auth.services";

import NavbarClient from "./NavbarClient";

const baseNavItems = [
  { label: "Home", href: "/" },
  { label: "Industries", href: "/industries" },
 { label: "Experts", href: "/experts" },
  { label: "Process", href: "/process" },
  { label: "Contact", href: "/contact" },
];

const Navbar = async () => {
  const user = await getUserInfo();
  const isLoggedIn = Boolean(user);
  const dashboardHref = user?.role
    ? getDefaultDashboardRoute(user.role as UserRole)
    : "/dashboard";

  const navItems = isLoggedIn
    ? [...baseNavItems, { label: "Dashboard", href: dashboardHref }]
    : baseNavItems;

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
