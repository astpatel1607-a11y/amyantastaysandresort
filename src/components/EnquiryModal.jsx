import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useEnquiry } from "@/lib/enquiryContext";
import { getSiteSettings, buildEnquiryMessage, buildWhatsAppUrl } from "@/lib/site";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function EnquiryModal() {
  const { open, prefill, closeEnquiry } = useEnquiry();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [settings, setSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [form, setForm] = useState({
    name: "", mobile: "", destination: "", property: "",
    checkIn: "", checkOut: "", guests: "", rooms: "", message: ""
  });

  useEffect(() => {
    if (!open) return;
    setForm((f) => ({
      ...f,
      destination: prefill.destination || f.destination,
      property: prefill.property || f.property,
      message: prefill.message || f.message
    }));
    setStep(1);
    setDone(false);
    setErrors({});
    getSiteSettings().then(setSettings);
    base44.entities.Destination.filter({ status: "active" }, { limit: 50, fields: ["name", "slug"] })
      .then((r) => setDestinations(r.items || []))
      .catch(() => {});
    base44.entities.Property.filter({ status: "active" }, { limit: 100, fields: ["name", "slug", "destinationName"] })
      .then((r) => setProperties(r.items || []))
      .catch(() => {});
  }, [open, prefill]);

  const [errors, setErrors] = useState({});
  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your full name";
    else if (form.name.trim().length < 2) e.name = "Name is too short";
    else if (form.name.trim().length > 50) e.name = "Name is too long";
    const digits = form.mobile.replace(/[^\d]/g, "");
    if (!form.mobile.trim()) e.mobile = "Please enter your mobile number";
    else if (digits.length < 10) e.mobile = "Enter a valid mobile number (at least 10 digits)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.checkIn && form.checkIn < today) {
      e.checkIn = "Check-in date cannot be in the past";
      toast({ title: "Invalid check-in date", description: "Check-in cannot be in the past.", variant: "destructive" });
    }
    if (form.checkOut && form.checkOut < today) {
      e.checkOut = "Check-out date cannot be in the past";
      toast({ title: "Invalid check-out date", description: "Check-out cannot be in the past.", variant: "destructive" });
    }
    if (form.checkOut && !form.checkIn) {
      e.checkIn = "Please select a check-in date";
      toast({ title: "Check-in required", description: "Please select a check-in date first.", variant: "destructive" });
    }
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      e.checkOut = "Check-out must be after check-in";
      toast({ title: "Invalid date range", description: "Check-out must be after check-in.", variant: "destructive" });
    }
    if (form.guests && !/^\d+$/.test(form.guests)) e.guests = "Enter a whole number";
    else if (form.guests && Number(form.guests) < 1) e.guests = "Must be at least 1";
    if (form.rooms && !/^\d+$/.test(form.rooms)) e.rooms = "Enter a whole number";
    else if (form.rooms && Number(form.rooms) < 1) e.rooms = "Must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const filteredProperties = form.destination
    ? properties.filter((p) => p.destinationName === form.destination)
    : properties;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Enquiry.create({
        ...form,
        status: "New"
      });
      // Best-effort email notification
      if (settings?.notificationEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: settings.notificationEmail,
            subject: `New Enquiry — ${form.destination || "Amyanta"}`,
            body: buildEnquiryMessage(form, settings)
          });
        } catch (e) { /* email notification is best-effort */ }
      }
      try {
        const ch = await base44.functions.invoke("appendEnquiryToSheet", { mode: "challenge" });
        const token = ch?.data?.token;
        if (token) {
          await base44.functions.invoke("appendEnquiryToSheet", { ...form, token });
        }
      } catch (e) { /* Google Sheet logging is best-effort */ }
      setSavedData(form);
      setDone(true);
    } catch (e) {
      // still show success to user; enquiry capture is best-effort
      setSavedData(form);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const waLink = savedData
    ? buildWhatsAppUrl(settings?.whatsappNumber, buildEnquiryMessage(savedData, settings))
    : "#";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) closeEnquiry(); }}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden rounded-none border-juniper/20">
        {!done ? (
          <div className="p-7 sm:p-9 bg-ivory">
            <DialogHeader className="mb-7">
              <DialogTitle className="font-display text-3xl text-juniper">Plan Your Stay</DialogTitle>
              <DialogDescription className="text-muted-foreground font-light mt-1">
                Share a few details and our concierge will reach out shortly.
              </DialogDescription>
            </DialogHeader>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="enq-name" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Full Name *</Label>
                  <Input id="enq-name" value={form.name} onChange={(e) => update("name", e.target.value.replace(/[^a-zA-Z\s]/g, ""))} placeholder="Your name" maxLength={50} className="mt-2 rounded-none" />
                  {errors.name && <p className="text-xs text-destructive mt-1.5">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="enq-mobile" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Mobile Number *</Label>
                  <Input id="enq-mobile" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="+91 ..." className="mt-2 rounded-none" />
                  {errors.mobile && <p className="text-xs text-destructive mt-1.5">{errors.mobile}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Destination</Label>
                    <Select value={form.destination} onValueChange={(v) => { update("destination", v); update("property", ""); }}>
                      <SelectTrigger className="mt-2 rounded-none"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {destinations.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Property</Label>
                    <Select value={form.property} onValueChange={(v) => update("property", v)}>
                      <SelectTrigger className="mt-2 rounded-none"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {filteredProperties.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end pt-3">
                  <Button onClick={() => { if (validateStep1()) setStep(2); }} className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="enq-ci" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Check-in</Label>
                    <Input id="enq-ci" type="date" min={today} value={form.checkIn} onChange={(e) => update("checkIn", e.target.value)} className="mt-2 rounded-none" />
                    {errors.checkIn && <p className="text-xs text-destructive mt-1.5">{errors.checkIn}</p>}
                  </div>
                  <div>
                    <Label htmlFor="enq-co" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Check-out</Label>
                    <Input id="enq-co" type="date" min={form.checkIn || today} value={form.checkOut} onChange={(e) => update("checkOut", e.target.value)} className="mt-2 rounded-none" />
                    {errors.checkOut && <p className="text-xs text-destructive mt-1.5">{errors.checkOut}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="enq-g" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Guests</Label>
                    <Input id="enq-g" value={form.guests} onChange={(e) => update("guests", e.target.value)} placeholder="e.g. 2" className="mt-2 rounded-none" />
                    {errors.guests && <p className="text-xs text-destructive mt-1.5">{errors.guests}</p>}
                  </div>
                  <div>
                    <Label htmlFor="enq-r" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Rooms</Label>
                    <Input id="enq-r" value={form.rooms} onChange={(e) => update("rooms", e.target.value)} placeholder="e.g. 1" className="mt-2 rounded-none" />
                    {errors.rooms && <p className="text-xs text-destructive mt-1.5">{errors.rooms}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="enq-msg" className="eyebrow text-juniper/60 normal-case tracking-widest text-xs">Message</Label>
                  <Textarea id="enq-msg" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Any special requests..." className="mt-2 rounded-none" rows={3} />
                </div>
                <div className="flex justify-between pt-3">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-juniper rounded-none">Back</Button>
                  <Button onClick={() => { if (validateStep2()) handleSubmit(); }} disabled={submitting} className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none">
                    {submitting ? <><Loader2 className="animate-spin" /> Submitting...</> : "Submit Enquiry"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative bg-juniper text-ivory">
            <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${settings?.heroImage || prefill.destinationImage || ""})` }}>
              <div className="h-full bg-juniper/55" />
            </div>
            <div className="p-8 sm:p-10 text-center -mt-12 relative">
              <div className="mx-auto w-16 h-16 border-2 border-ochre text-ochre flex items-center justify-center mb-5 bg-juniper">
                <Check className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <div className="eyebrow text-ochre mb-3">Your journey has begun</div>
              <h3 className="font-display text-3xl text-ivory mb-3">{savedData?.destination ? `Off to ${savedData.destination}` : "Your escape awaits"}</h3>
              <p className="text-ivory/65 mb-7 font-light">
                Our concierge will reach out to you shortly to craft the perfect stay.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href={waLink} target="_blank" rel="noreferrer">
                  <Button className="w-full bg-ochre hover:bg-ochre/90 text-ivory rounded-none">
                    <WhatsAppIcon className="w-4 h-4" /> Send on WhatsApp
                  </Button>
                </a>
                <Button variant="outline" onClick={closeEnquiry} className="w-full bg-transparent border-ivory/30 text-ivory hover:bg-ivory/10 rounded-none">Close</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}