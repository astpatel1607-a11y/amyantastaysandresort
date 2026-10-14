import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { clearSettingsCache } from "@/lib/site";

export default function ManageSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.SiteSetting.list({ limit: 1 }).then((res) => {
      const items = res.items || res;
      setForm(items[0] || { brandName: "Amyanta Stays & Resorts", tagline: "Stay. Explore. Experience.", whatsappNumber: "", phoneNumbers: [], email: "", instagram: "", facebook: "", youtube: "", address: "", mapUrl: "", heroImage: "", aboutStory: "", vision: "", mission: "", founderName: "", founderImage: "", founderStory: "", notificationEmail: "", googleSheetUrl: "" });
    });
  }, []);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    try {
      const data = { ...form, phoneNumbers: Array.isArray(form.phoneNumbers) ? form.phoneNumbers : form.phoneNumbers.split("\n").filter(Boolean) };
      if (form.id) await base44.entities.SiteSetting.update(form.id, data);
      else await base44.entities.SiteSetting.create(data);
      clearSettingsCache();
      setSaved(true);
    } catch (e) { alert("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  if (!form) return <Loader2 className="animate-spin text-ochre" />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl text-juniper mb-6">Site Settings</h1>
      <div className="space-y-5">
        <section className="p-5 rounded-2xl bg-card border border-juniper/5 space-y-4">
          <h2 className="font-heading text-lg text-juniper">Brand & Contact</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Brand Name</Label><Input value={form.brandName || ""} onChange={(e) => set("brandName", e.target.value)} className="mt-1" /></div>
            <div><Label>Tagline</Label><Input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} className="mt-1" /></div>
          </div>
          <div><Label>WhatsApp Number (digits with country code)</Label><Input value={form.whatsappNumber || ""} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="919999999999" className="mt-1" /></div>
          <div><Label>Phone Numbers (one per line)</Label><Textarea value={(form.phoneNumbers || []).join("\n")} onChange={(e) => set("phoneNumbers", e.target.value.split("\n").filter(Boolean))} rows={2} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} className="mt-1" /></div>
            <div><Label>Instagram URL</Label><Input value={form.instagram || ""} onChange={(e) => set("instagram", e.target.value)} className="mt-1" /></div>
            <div><Label>Facebook URL</Label><Input value={form.facebook || ""} onChange={(e) => set("facebook", e.target.value)} placeholder="https://facebook.com/…" className="mt-1" /></div>
            <div><Label>YouTube URL</Label><Input value={form.youtube || ""} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/…" className="mt-1" /></div>
          </div>
          <div><Label>Address</Label><Textarea value={form.address || ""} onChange={(e) => set("address", e.target.value)} rows={2} className="mt-1" /></div>
          <div><Label>Google Maps Embed URL</Label><Input value={form.mapUrl || ""} onChange={(e) => set("mapUrl", e.target.value)} className="mt-1" /></div>
          <div><Label>Notification Email (receives new enquiries)</Label><Input value={form.notificationEmail || ""} onChange={(e) => set("notificationEmail", e.target.value)} className="mt-1" /></div>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-juniper/5 space-y-4">
          <h2 className="font-heading text-lg text-juniper">Enquiry Tracking</h2>
          <div>
            <Label>Google Sheet URL</Label>
            <Input value={form.googleSheetUrl || ""} onChange={(e) => set("googleSheetUrl", e.target.value)} placeholder="https://docs.google.com/spreadsheets/d/.../edit" className="mt-1" />
            <p className="text-xs text-muted-foreground mt-1">Leave blank to auto-create a sheet on the first enquiry. New enquiries are appended as rows.</p>
          </div>
        </section>

        <section className="p-5 rounded-2xl bg-card border border-juniper/5 space-y-4">
          <h2 className="font-heading text-lg text-juniper">Home Hero</h2>
          <AdminImageUpload label="Hero Image" multiple={false} value={form.heroImage} onChange={(v) => set("heroImage", v)} />
        </section>

        <section className="p-5 rounded-2xl bg-card border border-juniper/5 space-y-4">
          <h2 className="font-heading text-lg text-juniper">About Page</h2>
          <div><Label>Company Story</Label><Textarea value={form.aboutStory || ""} onChange={(e) => set("aboutStory", e.target.value)} rows={4} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Vision</Label><Textarea value={form.vision || ""} onChange={(e) => set("vision", e.target.value)} rows={3} className="mt-1" /></div>
            <div><Label>Mission</Label><Textarea value={form.mission || ""} onChange={(e) => set("mission", e.target.value)} rows={3} className="mt-1" /></div>
          </div>
          <div><Label>Founder Name</Label><Input value={form.founderName || ""} onChange={(e) => set("founderName", e.target.value)} className="mt-1" /></div>
          <AdminImageUpload label="Founder Image" multiple={false} value={form.founderImage} onChange={(v) => set("founderImage", v)} />
          <div><Label>Founder Story</Label><Textarea value={form.founderStory || ""} onChange={(e) => set("founderStory", e.target.value)} rows={4} className="mt-1" /></div>
        </section>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="bg-ochre hover:bg-ochre/90 text-white">{saving ? <Loader2 className="animate-spin" /> : "Save Settings"}</Button>
          {saved && <span className="text-forest text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
        </div>
      </div>
    </div>
  );
}