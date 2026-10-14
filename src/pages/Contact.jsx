import React, { useState, useEffect } from "react";
import { Phone, Mail, Instagram, MapPin, Facebook, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSiteSettings, buildWhatsAppUrl, buildTelUrl, buildEnquiryMessage } from "@/lib/site";
import { useEnquiry } from "@/lib/enquiryContext";
import SectionReveal from "@/components/SectionReveal";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check } from "lucide-react";

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ name: "", mobile: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { openEnquiry } = useEnquiry();

  useEffect(() => { getSiteSettings().then(setSettings); }, []);

  const wa = buildWhatsAppUrl(settings?.whatsappNumber, `Hello ${settings?.brandName || "Amyanta"}, I would like to enquire.`);
  const phone = settings?.phoneNumbers?.[0] ? buildTelUrl(settings.phoneNumbers[0]) : null;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.Enquiry.create({ ...form, status: "New" });
      setDone(true);
    } catch (err) { setDone(true); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="pt-16 sm:pt-20 bg-ivory">
      <section className="py-20 sm:py-32 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-2xl mb-16">
          <div className="eyebrow text-ochre mb-4">Contact</div>
          <h1 className="font-heading text-5xl sm:text-7xl text-juniper leading-[1.02]">Let's Plan Your Escape</h1>
          <p className="mt-6 text-lg text-muted-foreground font-light">Questions, custom requests or group bookings — our concierge is here to help.</p>
        </SectionReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* CONTACT INFO */}
          <SectionReveal>
            <div className="space-y-px bg-foreground/10 border hairline">
              {phone && (
                <a href={phone} className="flex items-center gap-5 p-6 bg-card hover:bg-stone/50 transition-colors">
                  <div className="w-11 h-11 border border-ochre/30 text-ochre flex items-center justify-center"><Phone className="w-4 h-4" strokeWidth={1.5} /></div>
                  <div><div className="eyebrow text-muted-foreground mb-1">Call</div><div className="font-medium text-juniper">{settings.phoneNumbers.join(" · ")}</div></div>
                </a>
              )}
              <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-6 bg-card hover:bg-stone/50 transition-colors">
                <div className="w-11 h-11 border border-ochre/30 flex items-center justify-center"><WhatsAppIcon className="w-5 h-5" /></div>
                <div><div className="eyebrow text-muted-foreground mb-1">WhatsApp</div><div className="font-medium text-juniper">Chat with us instantly</div></div>
              </a>
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-5 p-6 bg-card hover:bg-stone/50 transition-colors">
                  <div className="w-11 h-11 border border-ochre/30 text-ochre flex items-center justify-center"><Mail className="w-4 h-4" strokeWidth={1.5} /></div>
                  <div><div className="eyebrow text-muted-foreground mb-1">Email</div><div className="font-medium text-juniper">{settings.email}</div></div>
                </a>
              )}
              {settings?.instagram && (
                <a href={settings.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-6 bg-card hover:bg-stone/50 transition-colors">
                  <div className="w-11 h-11 border border-ochre/30 text-ochre flex items-center justify-center"><Instagram className="w-4 h-4" strokeWidth={1.5} /></div>
                  <div><div className="eyebrow text-muted-foreground mb-1">Instagram</div><div className="font-medium text-juniper">Follow our journey</div></div>
                </a>
              )}
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-6 bg-card hover:bg-stone/50 transition-colors">
                  <div className="w-11 h-11 border border-ochre/30 text-ochre flex items-center justify-center"><Facebook className="w-4 h-4" strokeWidth={1.5} /></div>
                  <div><div className="eyebrow text-muted-foreground mb-1">Facebook</div><div className="font-medium text-juniper">Follow our page</div></div>
                </a>
              )}
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-6 bg-card hover:bg-stone/50 transition-colors">
                  <div className="w-11 h-11 border border-ochre/30 text-ochre flex items-center justify-center"><Youtube className="w-4 h-4" strokeWidth={1.5} /></div>
                  <div><div className="eyebrow text-muted-foreground mb-1">YouTube</div><div className="font-medium text-juniper">Watch our journey</div></div>
                </a>
              )}
              {settings?.address && (
                <div className="flex items-center gap-5 p-6 bg-card">
                  <div className="w-11 h-11 border border-ochre/30 text-ochre flex items-center justify-center"><MapPin className="w-4 h-4" strokeWidth={1.5} /></div>
                  <div><div className="eyebrow text-muted-foreground mb-1">Address</div><div className="font-medium text-juniper">{settings.address}</div></div>
                </div>
              )}
            </div>
            {settings?.mapUrl && (
              <div className="overflow-hidden border hairline mt-6 aspect-[16/9]">
                <iframe src={settings.mapUrl} className="w-full h-full grayscale" loading="lazy" title="Amyanta location" />
              </div>
            )}
          </SectionReveal>

          {/* FORM */}
          <SectionReveal delay={0.1}>
            <div className="p-8 sm:p-10 bg-juniper text-ivory h-full">
              <h2 className="font-display text-3xl text-ivory mb-2">Send a Message</h2>
              <p className="text-ivory/60 text-sm mb-8 font-light">We'll get back to you shortly.</p>
              {done ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-14 h-14 border border-ochre text-ochre flex items-center justify-center mb-5"><Check className="w-7 h-7" strokeWidth={1.5} /></div>
                  <h3 className="font-display text-3xl text-ivory mb-3">Thank you</h3>
                  <p className="text-ivory/60 mb-8 font-light">Your message has been received. Our concierge will reach out shortly.</p>
                  <a href={buildWhatsAppUrl(settings?.whatsappNumber, buildEnquiryMessage(form, settings))} target="_blank" rel="noreferrer">
                    <Button className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none"><WhatsAppIcon className="w-4 h-4" /> Also send on WhatsApp</Button>
                  </a>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div><Label htmlFor="c-name" className="text-ivory/70 eyebrow normal-case tracking-widest text-xs">Name *</Label><Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 bg-transparent border-ivory/20 text-ivory rounded-none focus-visible:ring-ochre placeholder:text-ivory/30" /></div>
                  <div><Label htmlFor="c-mobile" className="text-ivory/70 eyebrow normal-case tracking-widest text-xs">Mobile *</Label><Input id="c-mobile" required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="mt-2 bg-transparent border-ivory/20 text-ivory rounded-none focus-visible:ring-ochre placeholder:text-ivory/30" /></div>
                  <div><Label htmlFor="c-msg" className="text-ivory/70 eyebrow normal-case tracking-widest text-xs">Message</Label><Textarea id="c-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="mt-2 bg-transparent border-ivory/20 text-ivory rounded-none focus-visible:ring-ochre placeholder:text-ivory/30" /></div>
                  <Button type="submit" disabled={submitting} className="w-full bg-ochre hover:bg-ochre/90 text-ivory rounded-none h-11">{submitting ? <><Loader2 className="animate-spin" /> Sending...</> : "Send Message"}</Button>
                  <button type="button" onClick={() => openEnquiry()} className="w-full eyebrow text-ivory/60 hover:text-ivory transition-colors pt-1">Open full enquiry form</button>
                </form>
              )}
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}