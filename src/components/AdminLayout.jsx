import React from "react";
import { NavLink, Link, Outlet } from "react-router-dom";
import { LayoutDashboard, MapPin, Building2, BedDouble, Sparkles, Images, Inbox, Settings, ExternalLink, ShieldAlert, MessageSquareQuote } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { to: "/admin/experiences", label: "Experiences", icon: Sparkles },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminLayout() {
  const { user } = useAuth();

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist/30 p-8">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-10 h-10 text-ochre mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-juniper mb-2">Admin access only</h1>
          <p className="text-muted-foreground mb-6">You are signed in, but this area is restricted to administrators.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-ochre text-ivory rounded-none text-sm">
            <ExternalLink className="w-4 h-4" /> Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mist/30 flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-juniper text-sand flex-shrink-0 lg:min-h-screen">
        <div className="p-5 border-b border-sand/10">
          <div className="font-heading text-xl text-sand">Amyanta</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-ochre">Admin CMS</div>
        </div>
        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {NAV.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "bg-ochre text-white" : "text-sand/70 hover:bg-sand/10"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:block p-3 mt-auto">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-sand/60 hover:text-sand">
            <ExternalLink className="w-4 h-4" /> View live site
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-5 sm:p-8 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}