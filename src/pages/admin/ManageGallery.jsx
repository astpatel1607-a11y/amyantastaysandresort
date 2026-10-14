import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AdminImageUpload from "@/components/admin/AdminImageUpload";

const CATEGORIES = ["Properties", "Rooms", "Food", "Nature", "Wildlife", "Safari", "Experiences", "Destinations"];

export default function ManageGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ image: "", caption: "", category: "Nature" });

  const load = () => base44.entities.GalleryItem.filter({}, { limit: 300 }).then((r) => setItems(r.items || []));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const add = async () => {
    if (!form.image) { alert("Upload an image first."); return; }
    setAdding(true);
    try { await base44.entities.GalleryItem.create(form); setForm({ image: "", caption: "", category: form.category }); load(); }
    catch (e) { alert("Failed: " + (e.message || "error")); }
    finally { setAdding(false); }
  };

  const remove = async (g) => { if (!confirm("Delete this image?")) return; await base44.entities.GalleryItem.delete(g.id); load(); };

  return (
    <div>
      <h1 className="font-heading text-2xl text-juniper mb-6">Gallery</h1>

      <div className="p-5 rounded-2xl bg-card border border-juniper/5 mb-8">
        <div className="font-heading text-lg text-juniper mb-4">Add Image</div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><Label>Caption</Label><Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="mt-1" /></div>
        </div>
        <div className="mt-4"><AdminImageUpload label="Image" multiple={false} value={form.image} onChange={(v) => setForm({ ...form, image: v })} /></div>
        <Button onClick={add} disabled={adding} className="mt-4 bg-ochre hover:bg-ochre/90 text-white"><Plus className="w-4 h-4" /> {adding ? <Loader2 className="animate-spin" /> : "Add to Gallery"}</Button>
      </div>

      {loading ? <Loader2 className="animate-spin text-ochre" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((g) => (
            <div key={g.id} className="relative group rounded-xl overflow-hidden aspect-square">
              <img src={g.image} alt={g.caption || ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-juniper/0 group-hover:bg-juniper/50 transition-colors flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100">
                <span className="text-sand text-xs">{g.category}</span>
                {g.caption && <span className="text-sand/80 text-xs line-clamp-1">{g.caption}</span>}
                <Button size="sm" variant="ghost" className="text-white hover:bg-destructive mt-1 self-start" onClick={() => remove(g)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}