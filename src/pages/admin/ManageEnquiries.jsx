import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildWhatsAppUrl, buildEnquiryMessage, getSiteSettings } from "@/lib/site";

const STATUSES = ["New", "Contacted", "Confirmed", "Closed"];

export default function ManageEnquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [view, setView] = useState(null);

  const load = () => base44.entities.Enquiry.filter({}, { limit: 200, sort: "-created_date" }).then((r) => setItems(r.items || []));
  useEffect(() => {
    load().finally(() => setLoading(false));
    getSiteSettings().then(setSettings);
  }, []);

  const updateStatus = async (id, status) => { await base44.entities.Enquiry.update(id, { status }); load(); };
  const remove = async (e) => { if (!confirm("Delete this enquiry?")) return; await base44.entities.Enquiry.delete(e.id); load(); };

  const newCount = items.filter((i) => i.status === "New").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-juniper">Enquiries {newCount > 0 && <span className="ml-2 text-xs bg-ochre text-white px-2 py-0.5 rounded-full">{newCount} new</span>}</h1>
      </div>
      {loading ? <Loader2 className="animate-spin text-ochre" /> : items.length === 0 ? (
        <p className="text-muted-foreground">No enquiries yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <div key={e.id} className="p-4 rounded-2xl bg-card border border-juniper/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg text-juniper">{e.name}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{e.mobile} · {e.destination || "—"} {e.property ? `· ${e.property}` : ""}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {e.checkIn && `Check-in: ${e.checkIn}`} {e.checkOut && `· Check-out: ${e.checkOut}`} {e.guests && `· Guests: ${e.guests}`} {e.rooms && `· Rooms: ${e.rooms}`}
                  </div>
                  {e.message && <p className="text-sm text-juniper/70 mt-2 line-clamp-2">{e.message}</p>}
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(e.created_date).toLocaleString()}</div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Select value={e.status} onValueChange={(v) => updateStatus(e.id, v)}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setView(e)}>View</Button>
                    <a href={buildWhatsAppUrl(settings?.whatsappNumber, buildEnquiryMessage(e, settings))} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="text-forest"><MessageCircle className="w-3.5 h-3.5" /></Button></a>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Enquiry from {view?.name}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-2 text-sm py-2">
              <Row label="Mobile" value={view.mobile} />
              <Row label="Destination" value={view.destination} />
              <Row label="Property" value={view.property} />
              <Row label="Check-in" value={view.checkIn} />
              <Row label="Check-out" value={view.checkOut} />
              <Row label="Guests" value={view.guests} />
              <Row label="Rooms" value={view.rooms} />
              <Row label="Status" value={view.status} />
              <Row label="Submitted" value={new Date(view.created_date).toLocaleString()} />
              {view.message && <div><div className="text-muted-foreground text-xs mb-1">Message</div><div className="text-juniper/80">{view.message}</div></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { New: "bg-ochre/15 text-ochre", Contacted: "bg-blue-100 text-blue-700", Confirmed: "bg-forest/15 text-forest", Closed: "bg-muted text-muted-foreground" };
  return <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${colors[status] || ""}`}>{status}</span>;
}

function Row({ label, value }) {
  if (!value) return null;
  return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="text-juniper text-right">{value}</span></div>;
}