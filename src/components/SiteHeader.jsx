import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Facebook, Youtube, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import SocialIconButton from "@/components/SocialIconButton";
import { useEnquiry } from "@/lib/enquiryContext";
import { getSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/lib/site";

const BRAND_LOGO_URL = "https://media.base44.com/images/public/6abba3f42abc1bb41e5d26d7/95e7810b9_logoamyanta.jpeg";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Destinations", to: "/destinations" },
  { label: "Experiences", to: "/experiences" },
  { label: "About", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" }
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const { openEnquiry } = useEnquiry();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { getSiteSettings().then(setSettings); }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isHome = location.pathname === "/";
  const transparent = isHome && !scrolled && !menuOpen;

  const wa = buildWhatsAppUrl(settings?.whatsappNumber, `Hello ${settings?.brandName || "Amyanta"}, I'd like to enquire about a stay.`);
  const phone = settings?.phoneNumbers?.[0] ? buildTelUrl(settings.phoneNumbers[0]) : null;

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${transparent ? "bg-transparent" : "bg-ivory/95 backdrop-blur-md border-b hairline"}`}>
        <div className="max-w-content mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="shrink-0 h-9 w-9 sm:h-11 sm:w-11 rounded-full overflow-hidden ring-1 ring-juniper/10 bg-ivory/80 flex items-center justify-center">
                <Image src={BRAND_LOGO_URL} alt="Amyanta Stays & Resorts" fittingType="fill" className="h-full w-full object-cover" />
              </span>
              <span className="flex flex-col leading-none">
                <span className={`font-heading text-lg sm:text-xl tracking-[0.08em] uppercase transition-colors ${transparent ? "text-ivory" : "text-juniper"}`}>
                  Amyanta
                </span>
                <span className={`hidden sm:block text-[9px] uppercase tracking-[0.25em] leading-tight transition-colors ${transparent ? "text-ivory/80" : "text-ochre"}`}>
                  Stays & Resorts
                </span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to}
                  className={`eyebrow text-[0.7rem] transition-colors hover:text-ochre ${transparent ? "text-ivory/90" : "text-juniper/80"}`}>
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {settings?.facebook && (
                <SocialIconButton href={settings.facebook} label="Facebook" icon={Facebook} variant={transparent ? "onDark" : "onLight"} />
              )}
              {settings?.instagram && (
                <SocialIconButton href={settings.instagram} label="Instagram" icon={Instagram} variant={transparent ? "onDark" : "onLight"} />
              )}
              {settings?.youtube && (
                <SocialIconButton href={settings.youtube} label="YouTube" icon={Youtube} variant={transparent ? "onDark" : "onLight"} />
              )}
              {phone && (
                <SocialIconButton href={phone} label="Call" icon={Phone} variant={transparent ? "onDark" : "onLight"} />
              )}
              <SocialIconButton href={wa} label="WhatsApp" icon={WhatsAppIcon} variant={transparent ? "onDark" : "onLight"} />
              <Button onClick={() => openEnquiry()} size="sm" className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none">Enquire Now</Button>
            </div>

            <button className={`lg:hidden p-2 ${transparent ? "text-ivory" : "text-juniper"}`} onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div className="absolute inset-0 bg-juniper/30 backdrop-blur-[30px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} />
            <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-juniper"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button className="absolute top-5 right-5 text-ivory p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="w-7 h-7" /></button>
              <div className="flex flex-col items-center gap-7">
                {NAV.map((n, i) => (
                  <motion.div key={n.to}
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
                    <Link to={n.to} className="font-display text-4xl text-ivory hover:text-ochre transition-colors">{n.label}</Link>
                  </motion.div>
                ))}
              </div>
              <motion.div className="mt-12 flex flex-col gap-3 w-72"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Button onClick={() => { setMenuOpen(false); openEnquiry(); }} className="bg-ochre hover:bg-ochre/90 text-ivory w-full rounded-none">Enquire Now</Button>
                <div className="flex justify-center gap-3">
                  <SocialIconButton href={wa} label="WhatsApp" icon={WhatsAppIcon} variant="onDark" />
                  {phone && <SocialIconButton href={phone} label="Call" icon={Phone} variant="onDark" />}
                  {settings?.facebook && <SocialIconButton href={settings.facebook} label="Facebook" icon={Facebook} variant="onDark" />}
                  {settings?.instagram && <SocialIconButton href={settings.instagram} label="Instagram" icon={Instagram} variant="onDark" />}
                  {settings?.youtube && <SocialIconButton href={settings.youtube} label="YouTube" icon={Youtube} variant="onDark" />}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}