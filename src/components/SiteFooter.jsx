import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, Instagram, Facebook, Youtube, MapPin, ArrowUpRight } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import SocialIconButton from "@/components/SocialIconButton";
import { Image } from "@/components/ui/image";
import { getSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/lib/site";

const BRAND_LOGO_URL = "https://media.base44.com/images/public/6abba3f42abc1bb41e5d26d7/95e7810b9_logoamyanta.jpeg";

export default function SiteFooter() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);

  const wa = buildWhatsAppUrl(settings?.whatsappNumber, `Hello ${settings?.brandName || "Amyanta"}, I would like to enquire.`);
  const phone = settings?.phoneNumbers?.[0] ? buildTelUrl(settings.phoneNumbers[0]) : null;

  return (
    <footer className="bg-juniper text-ivory/75">
      <div className="max-w-content mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="shrink-0 h-12 w-12 rounded-full overflow-hidden ring-1 ring-ivory/20 bg-ivory/10 flex items-center justify-center">
                <Image src={BRAND_LOGO_URL} alt="Amyanta Stays & Resorts" fittingType="fill" className="h-full w-full object-cover" />
              </span>
              <div>
                <div className="font-display text-2xl text-ivory leading-none uppercase tracking-[0.06em]">Amyanta</div>
                <div className="eyebrow text-ochre mt-1.5">Stays & Resorts</div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/60 font-light">
              {settings?.tagline || "Stay. Explore. Experience."} — curated stays and extraordinary experiences across the wild landscapes and timeless beauty of Gujarat and Rajasthan.
            </p>
            <div className="flex gap-3 mt-7">
              {phone && (
                <SocialIconButton href={phone} label="Call" icon={Phone} variant="onDark" />
              )}
              <SocialIconButton href={wa} label="WhatsApp" icon={WhatsAppIcon} variant="onDark" />
              {settings?.email && (
                <SocialIconButton href={`mailto:${settings.email}`} label="Email" icon={Mail} variant="onDark" />
              )}
              {settings?.instagram && (
                <SocialIconButton href={settings.instagram} label="Instagram" icon={Instagram} variant="onDark" />
              )}
              {settings?.facebook && (
                <SocialIconButton href={settings.facebook} label="Facebook" icon={Facebook} variant="onDark" />
              )}
              {settings?.youtube && (
                <SocialIconButton href={settings.youtube} label="YouTube" icon={Youtube} variant="onDark" />
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="eyebrow text-ivory/50 mb-5">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/destinations" className="hover:text-ochre transition-colors">Destinations</Link></li>
              <li><Link to="/experiences" className="hover:text-ochre transition-colors">Experiences</Link></li>
              <li><Link to="/gallery" className="hover:text-ochre transition-colors">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-ochre transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-ochre transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="eyebrow text-ivory/50 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-ivory/60 font-light">
              {phone && <li><a href={phone} className="hover:text-ochre transition-colors flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-ochre" strokeWidth={1.5} /> {settings.phoneNumbers.join(" · ")}</a></li>}
              {settings?.email && <li><a href={`mailto:${settings.email}`} className="hover:text-ochre transition-colors flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-ochre" strokeWidth={1.5} /> {settings.email}</a></li>}
              {settings?.address && <li className="flex gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-ochre" strokeWidth={1.5} /><span>{settings.address}</span></li>}
            </ul>
            <Link to="/contact" className="inline-flex items-center gap-1.5 mt-6 eyebrow text-ivory hover:text-ochre transition-colors group">
              Plan Your Stay <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-ivory/10 mt-14 pt-7 flex flex-col sm:flex-row justify-between gap-3 text-xs text-ivory/40 font-light">
          <p>© {new Date().getFullYear()} Amyanta Stays & Resorts. All rights reserved.</p>
          <p className="eyebrow text-ivory/35 normal-case">Wild · Luxury · Rajasthan · Nature</p>
        </div>
      </div>
    </footer>
  );
}