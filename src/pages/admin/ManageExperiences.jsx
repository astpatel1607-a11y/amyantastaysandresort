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

const empty = { title: "", description: "", category: "", destinationId: "", destinationName: "", propertyId: "", propertyName: "", images: [], featured: false, status: "active" };

export default function ManageExperiences() {
  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Experience.filter({}, { limit: 200 }).then((r) => setItems(r.items || []));
  useEffect(() => {
    base44.entities.Destination.filter({ status: "active" }, { limit: 50, fields: ["name"] }).then((r) => setDestinations(r.items || []));
    base44.entities.Property.filter({ status: "active" }, { limit: 100, fields: ["name", "destinationId"] }).then((r) => setProperties(r.items || []));
    load().finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onDest = (id) => { const d = destinations.find((x) => x.id === id); setForm((f) => ({ ...f, destinationId: id, destinationName: d?.name || "" })); };
  const onProp = (id) => { const p = properties.find((x) => x.id === id); setForm((f) => ({ ...f, propertyId: id, propertyName: p?.name || "" })); };

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (e) => { setForm({ ...empty, ...e }); setEditing(e.id); };

  const save = async () => {
    setSaving(true);
    try {
      if (editing === "new") await base44.entities.Experience.create(form);
      else await base44.entities.Experience.update(editing, form);
      setEditing(null); load();
    } catch (e) { alert("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  const remove = async (e) => { if (!confirm(`Delete ${e.title}?`)) return; await base44.entities.Experience.delete(e.id); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-juniper">Experiences</h1>
        <Button onClick={openNew} className="bg-ochre hover:bg-ochre/90 text-white"><Plus className="w-4 h-4" /> Add Experience</Button>
      </div>
      {loading ? <Loader2 className="animate-spin text-ochre" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((e) => (
            <div key={e.id} className="p-4 rounded-2xl bg-card border border-juniper/5">
              {e.images?.[0] && <img src={e.images[0]} alt="" className="w-full h-32 rounded-lg object-cover mb-3" />}
              <div className="font-heading text-lg text-juniper">{e.title}</div>
              <div className="text-xs text-muted-foreground">{e.destinationName} · {e.category}</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /> Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add Experience" : "Edit Experience"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1" /></div>
            <div><Label>Category</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Safari / Wildlife / Heritage..." className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" /></div>
            <div>
              <Label>Destination *</Label>
              <Select value={form.destinationId} onValueChange={onDest}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>{destinations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Related Property (optional)</Label>
              <Select value={form.propertyId} onValueChange={onProp}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value={null}>None</SelectItem>{properties.filter((p) => !form.destinationId || p.destinationId === form.destinationId).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <AdminImageUpload label="Images" value={form.images} onChange={(v) => set("images", v)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title || !form.destinationId} className="bg-ochre hover:bg-ochre/90 text-white">{saving ? <Loader2 className="animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}