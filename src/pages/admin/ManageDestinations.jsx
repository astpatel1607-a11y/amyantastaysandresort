import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import { slugify } from "@/lib/site";

const empty = { name: "", slug: "", tagline: "", description: "", heroImage: "", gallery: [], experiences: [], nearbyAttractions: [], featured: true, status: "active", seoTitle: "", seoDescription: "" };

export default function ManageDestinations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Destination.filter({}, { limit: 100, sort: "name" }).then((r) => setItems(r.items || []));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (d) => { setForm({ ...d }); setEditing(d.id); };

  const save = async () => {
    setSaving(true);
    const data = { ...form, slug: form.slug || slugify(form.name) };
    try {
      if (editing === "new") await base44.entities.Destination.create(data);
      else await base44.entities.Destination.update(editing, data);
      setEditing(null); load();
    } catch (e) { alert("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  const remove = async (d) => { if (!confirm(`Delete ${d.name}?`)) return; await base44.entities.Destination.delete(d.id); load(); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const listField = (k, val) => setForm((f) => ({ ...f, [k]: val.split("\n").filter(Boolean) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-juniper">Destinations</h1>
        <Button onClick={openNew} className="bg-ochre hover:bg-ochre/90 text-white"><Plus className="w-4 h-4" /> Add Destination</Button>
      </div>
      {loading ? <Loader2 className="animate-spin text-ochre" /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((d) => (
            <div key={d.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-juniper/5">
              {d.heroImage && <img src={d.heroImage} alt="" className="w-20 h-20 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="font-heading text-lg text-juniper">{d.name}</div>
                <div className="text-xs text-muted-foreground">/{d.slug}</div>
                <div className="text-sm text-juniper/60 line-clamp-2">{d.tagline}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(d)}><Pencil className="w-3.5 h-3.5" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(d)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add Destination" : "Edit Destination"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" className="mt-1" /></div>
            </div>
            <div><Label>Tagline</Label><Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="mt-1" /></div>
            <AdminImageUpload label="Hero Image" multiple={false} value={form.heroImage} onChange={(v) => set("heroImage", v)} />
            <AdminImageUpload label="Gallery" value={form.gallery} onChange={(v) => set("gallery", v)} />
            <div><Label>Experiences (one per line)</Label><Textarea value={(form.experiences || []).join("\n")} onChange={(e) => listField("experiences", e.target.value)} rows={3} className="mt-1" /></div>
            <div><Label>Nearby Attractions (one per line)</Label><Textarea value={(form.nearbyAttractions || []).join("\n")} onChange={(e) => listField("nearbyAttractions", e.target.value)} rows={3} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>SEO Title</Label><Input value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="mt-1" /></div>
              <div><Label>Status</Label><select value={form.status} onChange={(e) => set("status", e.target.value)} className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3"><option value="active">active</option><option value="hidden">hidden</option></select></div>
            </div>
            <div><Label>SEO Description</Label><Textarea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} className="mt-1" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured on home</label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name} className="bg-ochre hover:bg-ochre/90 text-white">{saving ? <Loader2 className="animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}