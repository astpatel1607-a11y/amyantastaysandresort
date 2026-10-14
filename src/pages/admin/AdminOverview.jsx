import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Building2, BedDouble, Sparkles, Images, Inbox, Settings } from "lucide-react";

const MODULES = [
  { to: "/admin/destinations", label: "Destinations", icon: MapPin },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { to: "/admin/experiences", label: "Experiences", icon: Sparkles },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/settings", label: "Settings", icon: Settings }
];

export default function AdminOverview() {
  return (
    <div>
      <h1 className="font-heading text-3xl text-juniper mb-2">Welcome, Amyanta</h1>
      <p className="text-muted-foreground mb-8">Manage your destinations, properties, experiences, gallery and enquiries — all from one place.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="text-left p-5 rounded-2xl bg-card border border-juniper/5 hover:border-ochre/30 transition-colors">
            <m.icon className="w-6 h-6 text-ochre mb-3" />
            <div className="font-heading text-lg text-juniper">{m.label}</div>
            <div className="text-sm text-muted-foreground">Manage {m.label.toLowerCase()}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}