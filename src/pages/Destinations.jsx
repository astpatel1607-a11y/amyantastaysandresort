import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SectionReveal from "@/components/SectionReveal";
import DestinationCard from "@/components/DestinationCard";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Destination.filter({ status: "active" }, { limit: 50, sort: "name" })
      .then((r) => setDestinations(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 sm:pt-20 bg-ivory">
      <section className="py-20 sm:py-32 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-2xl mb-16">
          <div className="eyebrow text-ochre mb-4">Destinations</div>
          <h1 className="font-heading text-5xl sm:text-7xl text-juniper leading-[1.02]">Choose Your Escape</h1>
          <p className="mt-6 text-lg text-muted-foreground font-light">From untamed wilderness to royal tranquillity — discover destinations designed for unforgettable stays across Gujarat and Rajasthan.</p>
        </SectionReveal>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0,1,2].map((i) => <div key={i} className="aspect-[4/5] bg-stone animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {destinations.map((d, i) => (
              <SectionReveal key={d.id} delay={(i % 3) * 0.1}>
                <DestinationCard destination={d} index={i} />
              </SectionReveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}