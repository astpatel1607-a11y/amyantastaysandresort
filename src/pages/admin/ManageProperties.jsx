import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { slugify } from "@/lib/site";

const empty = { name: "", slug: "", destinationId: "", destinationName: "", tagline: "", description: "", heroImage: "", gallery: [], location: "", mapUrl: "", startingPrice: 0, amenities: [], mealPlan: "", checkIn: "12:00 PM", checkOut: "11:00 AM", nearbyAttractions: [], featured: false, status: "active", seoTitle: "", seoDescription: "" };

export default function ManageProperties() {
  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Property.filter({}, { limit: 200 }).then((r) => setItems(r.items || []));
  useEffect(() => {
    base44.entities.Destination.filter({ status: "active" }, { limit: 50 }).then((r) => setDestinations(r.items || []));
    load().finally(() => setLoading(false));
  }, []);

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (p) => { setForm({ ...empty, ...p }); setEditing(p.id); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const listField = (k, val) => setForm((f) => ({ ...f, [k]: val.split("\n").filter(Boolean) }));

  const onDestChange = (id) => {
    const d = destinations.find((x) => x.id === id);
    setForm((f) => ({ ...f, destinationId: id, destinationName: d?.name || "" }));
  };

  const save = async () => {
    setSaving(true);
    const data = { ...form, slug: form.slug || slugify(form.name), startingPrice: Number(form.startingPrice) || 0 };
    try {
      if (editing === "new") await base44.entities.Property.create(data);
      else await base44.entities.Property.update(editing, data);
      setEditing(null); load();
    } catch (e) { alert("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  const remove = async (p) => { if (!confirm(`Delete ${p.name}?`)) return; await base44.entities.Property.delete(p.id); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-juniper">Properties</h1>
        <Button onClick={openNew} className="bg-ochre hover:bg-ochre/90 text-white"><Plus className="w-4 h-4" /> Add Property</Button>
      </div>
      {loading ? <Loader2 className="animate-spin text-ochre" /> : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-juniper/5">
              {p.heroImage && <img src={p.heroImage} alt="" className="w-16 h-16 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="font-heading text-lg text-juniper">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.destinationName} · /{p.slug} {p.featured ? "· Featured" : ""}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(p)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add Property" : "Edit Property"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" className="mt-1" /></div>
            </div>
            <div>
              <Label>Destination *</Label>
              <Select value={form.destinationId} onValueChange={onDestChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>{destinations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="mt-1" /></div>
            <div><Label>Overview Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="mt-1" /></div>
            <AdminImageUpload label="Hero Image" multiple={false} value={form.heroImage} onChange={(v) => set("heroImage", v)} />
            <AdminImageUpload label="Gallery" value={form.gallery} onChange={(v) => set("gallery", v)} />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => set("location", e.target.value)} className="mt-1" /></div>
              <div><Label>Starting Price (₹)</Label><Input type="number" value={form.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Google Maps Embed URL</Label><Input value={form.mapUrl} onChange={(e) => set("mapUrl", e.target.value)} className="mt-1" /></div>
            <div><Label>Amenities (one per line)</Label><Textarea value={(form.amenities || []).join("\n")} onChange={(e) => listField("amenities", e.target.value)} rows={3} className="mt-1" /></div>
            <div><Label>Meal Plan</Label><Textarea value={form.mealPlan} onChange={(e) => set("mealPlan", e.target.value)} rows={2} className="mt-1" /></div>
            <div><Label>Nearby Attractions (one per line)</Label><Textarea value={(form.nearbyAttractions || []).join("\n")} onChange={(e) => listField("nearbyAttractions", e.target.value)} rows={3} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Check-in</Label><Input value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} className="mt-1" /></div>
              <div><Label>Check-out</Label><Input value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>SEO Title</Label><Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="mt-1" /></div>
            <div><Label>SEO Description</Label><Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} className="mt-1" /></div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"><option value="active">active</option><option value="hidden">hidden</option></select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name || !form.destinationId} className="bg-ochre hover:bg-ochre/90 text-white">{saving ? <Loader2 className="animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}