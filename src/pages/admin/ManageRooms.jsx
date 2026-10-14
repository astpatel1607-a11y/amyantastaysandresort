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

const empty = { propertyId: "", propertyName: "", name: "", description: "", occupancy: "", price: 0, images: [], facilities: [] };

export default function ManageRooms() {
  const [items, setItems] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [filterProp, setFilterProp] = useState("all");

  const load = () => base44.entities.Room.filter({}, { limit: 200 }).then((r) => setItems(r.items || []));
  useEffect(() => {
    base44.entities.Property.filter({ status: "active" }, { limit: 100, fields: ["name"] }).then((r) => setProperties(r.items || []));
    load().finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onPropChange = (id) => { const p = properties.find((x) => x.id === id); setForm((f) => ({ ...f, propertyId: id, propertyName: p?.name || "" })); };

  const openNew = () => { setForm(empty); setEditing("new"); };
  const openEdit = (r) => { setForm({ ...empty, ...r }); setEditing(r.id); };

  const save = async () => {
    setSaving(true);
    const data = { ...form, price: Number(form.price) || 0, facilities: Array.isArray(form.facilities) ? form.facilities : (form.facilities ? form.facilities.split(",").map((s) => s.trim()).filter(Boolean) : []) };
    try {
      if (editing === "new") await base44.entities.Room.create(data);
      else await base44.entities.Room.update(editing, data);
      setEditing(null); load();
    } catch (e) { alert("Save failed: " + (e.message || "error")); }
    finally { setSaving(false); }
  };

  const remove = async (r) => { if (!confirm("Delete this room?")) return; await base44.entities.Room.delete(r.id); load(); };

  const shown = filterProp === "all" ? items : items.filter((r) => r.propertyId === filterProp);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-heading text-2xl text-juniper">Rooms</h1>
        <div className="flex gap-3">
          <Select value={filterProp} onValueChange={setFilterProp}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All properties" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All properties</SelectItem>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={openNew} className="bg-ochre hover:bg-ochre/90 text-white"><Plus className="w-4 h-4" /> Add Room</Button>
        </div>
      </div>
      {loading ? <Loader2 className="animate-spin text-ochre" /> : (
        <div className="space-y-3">
          {shown.map((r) => (
            <div key={r.id} className="flex gap-4 p-4 rounded-2xl bg-card border border-juniper/5">
              {r.images?.[0] && <img src={r.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="font-heading text-lg text-juniper">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.propertyName} · {r.occupancy}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(r)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
          {!shown.length && <p className="text-muted-foreground text-sm">No rooms yet.</p>}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing === "new" ? "Add Room" : "Edit Room"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Property *</Label>
              <Select value={form.propertyId} onValueChange={onPropChange}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select property" /></SelectTrigger>
                <SelectContent>{properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Room Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Occupancy</Label><Input value={form.occupancy} onChange={(e) => set("occupancy", e.target.value)} placeholder="2 Adults + 1 Child" className="mt-1" /></div>
              <div><Label>Starting Tariff (₹)</Label><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className="mt-1" /></div>
            </div>
            <AdminImageUpload label="Room Images" value={form.images} onChange={(v) => set("images", v)} />
            <div><Label>Facilities (comma separated)</Label><Input value={Array.isArray(form.facilities) ? form.facilities.join(", ") : form.facilities} onChange={(e) => set("facilities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.name || !form.propertyId} className="bg-ochre hover:bg-ochre/90 text-white">{saving ? <Loader2 className="animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}