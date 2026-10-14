import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Loader2, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AdminImageUpload from "@/components/admin/AdminImageUpload";

const empty = { name: "", location: "", quote: "", photo: "", rating: 5, status: "active", featured: false, propertyId: "", propertyName: "" };

export default function ManageReviews() {
  const [items, setItems] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Review.filter({}, { sort: "-created_date", limit: 200 }).then((r) => setItems(r.items || []));
  useEffect(() => {
    base44.entities.Property.filter({ status: "active" }, { limit: 100, fields: ["name"] }).then((r) => setProperties(r.items || []));
    load().finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onPropChange = (id) => { const p = properties.find((x) => x.id === id); setForm((f) => ({ ...f, propertyId: id || "", propertyName: p?.name || "" })); };
  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (r) => { setForm({ ...empty, ...r, rating: r.rating || 5 }); setEditing(r.id); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (editing === "new") await base44.entities.Review.create(payload);
      else await base44.entities.Review.update(editing, payload);
      setEditing(null); load();
    } catch (e) { alert("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  const remove = async (r) => { if (!confirm(`Delete review by ${r.name}?`)) return; await base44.entities.Review.delete(r.id); load(); };
  const approve = async (r) => { await base44.entities.Review.update(r.id, { status: "active" }); load(); };

  const statusColor = (s) => s === "active" ? "bg-forest/15 text-forest" : s === "pending" ? "bg-ochre/15 text-ochre" : "bg-muted text-muted-foreground";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-heading text-2xl text-juniper">Reviews</h1>
        <Button onClick={openNew} className="bg-ochre hover:bg-ochre/90 text-white"><Plus className="w-4 h-4" /> Add Review</Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Guest-submitted reviews appear as <span className="text-ochre font-medium">Pending</span> until you approve them.</p>

      {loading ? <Loader2 className="animate-spin text-ochre" /> : items.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl bg-card border border-juniper/5 flex gap-4 items-start">
              {r.photo ? <img src={r.photo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" /> : <div className="w-12 h-12 rounded-full bg-stone shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading text-lg text-juniper">{r.name}</span>
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                  {r.featured && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-juniper/10 text-juniper">Featured</span>}
                </div>
                {r.location && <div className="text-xs text-ochre mt-0.5">{r.location}</div>}
                <div className="flex items-center gap-0.5 my-1">
                  {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= (r.rating || 5) ? "text-ochre fill-ochre" : "text-juniper/15"}`} />)}
                </div>
                <p className="text-sm text-muted-foreground font-light line-clamp-2">"{r.quote}"</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {r.status === "pending" && <Button size="sm" className="bg-forest hover:bg-forest/90 text-white" onClick={() => approve(r)}><Check className="w-3.5 h-3.5" /> Approve</Button>}
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /> Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add Review" : "Edit Review"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Guest Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Mumbai · Sasan Gir" className="mt-1" /></div>
            </div>
            <div><Label>Review *</Label><Textarea value={form.quote} onChange={(e) => set("quote", e.target.value)} rows={4} className="mt-1" /></div>
            <div>
              <Label>Property (optional)</Label>
              <Select value={form.propertyId} onValueChange={onPropChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="General review (no property)" /></SelectTrigger>
                <SelectContent><SelectItem value={null}>None</SelectItem>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Rating</Label>
                <Select value={String(form.rating)} onValueChange={(v) => set("rating", Number(v))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} Star{n > 1 ? "s" : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AdminImageUpload label="Guest Photo" multiple={false} value={form.photo} onChange={(v) => set("photo", v)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name || !form.quote} className="bg-ochre hover:bg-ochre/90 text-white">{saving ? <Loader2 className="animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}