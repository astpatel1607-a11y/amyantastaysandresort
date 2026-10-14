import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SectionReveal from "@/components/SectionReveal";
import ExperienceCard from "@/components/ExperienceCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Destination.filter({ status: "active" }, { limit: 50, fields: ["name"] }).then((r) => setDestinations(r.items || []));
    base44.entities.Experience.filter({ status: "active" }, { limit: 100 })
      .then((r) => setExperiences(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? experiences : experiences.filter((e) => e.destinationName === filter);

  return (
    <div className="pt-16 sm:pt-20 bg-ivory">
      <section className="py-20 sm:py-32 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-2xl mb-12">
          <div className="eyebrow text-ochre mb-4">Experiences</div>
          <h1 className="font-heading text-5xl sm:text-7xl text-juniper leading-[1.02]">Experience the Extraordinary</h1>
          <p className="mt-6 text-lg text-muted-foreground font-light">Because the best journeys are remembered for what you experienced, not just where you stayed.</p>
        </SectionReveal>

        <div className="flex items-center gap-3 mb-14">
          <span className="eyebrow text-juniper/50">Filter</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-56 border-juniper/20 bg-card rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All destinations</SelectItem>
              {destinations.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0,1,2].map((i) => <div key={i} className="aspect-[4/5] bg-stone animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e, i) => <SectionReveal key={e.id} delay={(i % 3) * 0.08}><ExperienceCard experience={e} /></SectionReveal>)}
          </div>
        )}
      </section>
    </div>
  );
}