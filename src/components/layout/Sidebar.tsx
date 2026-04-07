"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

import companyLogo from "@/assets/logos/kpiLogo.png";

interface NavItem {
  label: string;
  href: string;
}

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const roleBase = `/dashboard/${user?.role}`;

  const isSettingsRoute = pathname.startsWith(`${roleBase}/settings`);
  const [openSettings, setOpenSettings] = useState(isSettingsRoute);

  if (!user) return null;

  const isExactActive = (href: string) => pathname === href;
  const isSectionActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // const operationsNav: NavItem[] = [
  //   { label: "Sales Quotations", href: `${roleBase}/sales` },
  //   { label: "Sales Orders", href: `${roleBase}/sales-orders` },
  //   { label: "Purchase Enquiry", href: `${roleBase}/purchase` },
  //   { label: "Purchase Order", href: `${roleBase}/purchase-orders` },
  // ];

  const managementNav: NavItem[] = [
    { label: "Products", href: `${roleBase}/products` },
    { label: "Base Rates", href: `${roleBase}/base-rate` },
  ];

  const utilitiesNav: NavItem[] = [
    { label: "Attendance", href: `${roleBase}/attendance` },
    { label: "Reminders", href: `${roleBase}/reminders` },
  ];

  const entityNav: NavItem[] = [
    { label: "Companies", href: `${roleBase}/companies` },
    { label: "Suppliers", href: `${roleBase}/suppliers` },
    { label: "Customers", href: `${roleBase}/customers` },
    { label: "Users", href: `${roleBase}/users` },
  ];

  const systemNav: NavItem[] = [
    // { label: "Audit Logs", href: `${roleBase}/audit` },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface">
      {/* Fixed top */}
      <div className="shrink-0 border-b border-border px-3 py-4">
        <div className="flex items-center gap-3">
          <Image
            src={companyLogo}
            alt="The Karan Pole Industries"
            className="w-12"
          />

          <div className="min-w-0">
            <h2 className="truncate font-serif text-lg text-text-primary">
              TKPI Management
            </h2>
            <p className="text-xs capitalize text-text-muted">
              {user.role} panel
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable nav */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-6 pr-1">
          <NavLink
            item={{ label: "Dashboard", href: roleBase }}
            active={isExactActive(roleBase)}
          />

          {/* <SidebarSection title="Operations">
            {operationsNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isSectionActive(item.href)}
              />
            ))}
          </SidebarSection> */}

          <SidebarSection title="Management">
            {managementNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isSectionActive(item.href)}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Utilities">
            {utilitiesNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isSectionActive(item.href)}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Entities">
            {entityNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isSectionActive(item.href)}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="System">
            {systemNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isSectionActive(item.href)}
              />
            ))}

            <button
              onClick={() => setOpenSettings((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-muted"
            >
              Website Settings

              <ChevronRight
                size={16}
                className={`transition ${openSettings ? "rotate-90" : ""}`}
              />
            </button>

            {openSettings && (
              <div className="ml-3 mt-1">
                <NavLink
                  item={{
                    label: "Hero Media",
                    href: `${roleBase}/settings/hero-media`,
                  }}
                  active={isSectionActive(`${roleBase}/settings/hero-media`)}
                  small
                />
              </div>
            )}
          </SidebarSection>
        </nav>
      </div>
    </aside>
  );
}

/* SIDEBAR SECTION */
function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-background px-2 py-2">
      <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

/* NAV LINK */
function NavLink({
  item,
  active,
  small,
}: {
  item: NavItem;
  active: boolean;
  small?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`block rounded-lg px-3 py-2 transition-all duration-200 ${small ? "text-xs" : "text-sm"
        } ${active
          ? "border-l-4 border-brand-primary bg-brand-primary/10 text-brand-primary shadow-sm"
          : "text-text-secondary hover:translate-x-0.5 hover:bg-muted"
        }`}
    >
      {item.label}
    </Link>
  );
}