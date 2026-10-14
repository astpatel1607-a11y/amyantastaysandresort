import React, { useState, useEffect } from "react";
import { Phone, FileText, Facebook, Youtube, Instagram } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useEnquiry } from "@/lib/enquiryContext";
import { getSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/lib/site";

export default function MobileConcierge() {
  const [settings, setSettings] = useState(null);
  const { openEnquiry } = useEnquiry();
  useEffect(() => { getSiteSettings().then(setSettings); }, []);

  const wa = buildWhatsAppUrl(settings?.whatsappNumber, `Hello ${settings?.brandName || "Amyanta"}, I'd like to enquire.`);
  const phone = settings?.phoneNumbers?.[0] ? buildTelUrl(settings.phoneNumbers[0]) : null;

  const IconBadge = ({ as: As = "a", href, onClick, bg, label, icon }) => (
    <As
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      {...(onClick ? { onClick } : {})}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full ${bg} text-ivory shadow-sm active:scale-95 transition-transform`}
    >
      {icon}
    </As>
  );

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 bg-ivory/95 backdrop-blur-md border-t hairline">
      <div className="flex items-center gap-2">
        <IconBadge as="a" href={wa} bg="bg-forest" label="WhatsApp" icon={<WhatsAppIcon className="w-5 h-5" />} />
        {phone && <IconBadge as="a" href={phone} bg="bg-juniper" label="Call" icon={<Phone className="w-5 h-5" strokeWidth={1.5} />} />}
        {settings?.facebook && (
          <IconBadge as="a" href={settings.facebook} bg="bg-[#1877F2]" label="Facebook" icon={<Facebook className="w-5 h-5" strokeWidth={1.5} />} />
        )}
        {settings?.instagram && (
          <IconBadge as="a" href={settings.instagram} bg="bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]" label="Instagram" icon={<Instagram className="w-5 h-5" strokeWidth={1.5} />} />
        )}
        {settings?.youtube && (
          <IconBadge as="a" href={settings.youtube} bg="bg-[#FF0000]" label="YouTube" icon={<Youtube className="w-5 h-5" strokeWidth={1.5} />} />
        )}
        <button onClick={() => openEnquiry()} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full bg-ochre text-ivory text-sm font-medium tracking-wide shadow-sm active:scale-[0.98] transition-transform">
          <FileText className="w-5 h-5" strokeWidth={1.5} /> Enquire
        </button>
      </div>
    </div>
  );
}