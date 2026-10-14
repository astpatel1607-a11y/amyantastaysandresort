import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SectionReveal from "@/components/SectionReveal";
import Lightbox from "@/components/Lightbox";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Properties", "Rooms", "Food", "Nature", "Wildlife", "Safari", "Experiences", "Destinations"];

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.GalleryItem.filter({}, { limit: 200 })
      .then((r) => setItems(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <div className="pt-16 sm:pt-20 bg-ivory">
      <section className="py-20 sm:py-32 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-2xl mb-12">
          <div className="eyebrow text-ochre mb-4">Gallery</div>
          <h1 className="font-heading text-5xl sm:text-7xl text-juniper leading-[1.02]">Moments in the Wild</h1>
          <p className="mt-6 text-lg text-muted-foreground font-light">A visual journey through our stays, wildlife and landscapes.</p>
        </SectionReveal>

        <div className="flex flex-wrap gap-2 mb-12">
          {CATEGORIES.map((c) => (
            <Button key={c} size="sm" variant={active === c ? "default" : "outline"}
              className={active === c ? "bg-juniper text-ivory hover:bg-juniper/90 rounded-none" : "border-juniper/20 text-juniper rounded-none bg-transparent"}
              onClick={() => setActive(c)}>{c}</Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[0,1,2,3,4,5].map((i) => <div key={i} className="aspect-square bg-stone animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((g, i) => (
              <button key={g.id} onClick={() => setLightbox({ images: filtered.map((f) => f.image), index: i })} className="relative aspect-square block overflow-hidden group bg-stone">
                <Image src={g.image} fittingType="fill" alt={g.caption || "Amyanta gallery"} className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
                {g.caption && <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5"><span className="text-ivory text-sm font-light">{g.caption}</span></div>}
              </button>
            ))}
          </div>
        )}
      </section>
      {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}