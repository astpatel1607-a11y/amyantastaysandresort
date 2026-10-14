import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ReviewForm() {
  const [form, setForm] = useState({ name: "", location: "", rating: "5", quote: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSubmitting(true);
    try {
      await base44.entities.Review.create({
        name: form.name,
        location: form.location,
        quote: form.quote,
        rating: Number(form.rating),
        status: "pending",
        featured: false
      });
      setDone(true);
    } catch (e) {
      alert("Could not submit your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-14 h-14 border-2 border-ochre text-ochre flex items-center justify-center mb-5 rounded-full">
          <Check className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-2xl text-juniper mb-2">Thank you for sharing</h3>
        <p className="text-muted-foreground font-light max-w-md mx-auto">
          Your review has been received and will appear here once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Your Name *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" placeholder="Your name" />
        </div>
        <div>
          <Label>Location / Stay</Label>
          <Input value={form.location} onChange={(e) => set("location", e.target.value)} className="mt-1" placeholder="e.g. Mumbai · Sasan Gir" />
        </div>
      </div>
      <div>
        <Label>Rating</Label>
        <Select value={form.rating} onValueChange={(v) => set("rating", v)}>
          <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} Star{n > 1 ? "s" : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Your Review *</Label>
        <Textarea value={form.quote} onChange={(e) => set("quote", e.target.value)} rows={4} className="mt-1" placeholder="Share your experience with Amyanta..." />
      </div>
      <Button onClick={submit} disabled={submitting || !form.name || !form.quote} className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none">
        {submitting ? <><Loader2 className="animate-spin" /> Submitting...</> : "Submit Review"}
      </Button>
    </div>
  );
}