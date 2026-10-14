import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Quote, ArrowRight } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";

export default function PropertyReviews({ property }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!property?.id) return;
    setLoading(true);
    base44.entities.Review.filter({ propertyId: property.id, status: "active" }, { sort: "-created_date", limit: 50 })
      .then((r) => setReviews(r.items || []))
      .finally(() => setLoading(false));
  }, [property?.id]);

  if (loading || reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length;
  const avgRounded = Math.round(avg);

  return (
    <SectionReveal>
      <div className="eyebrow text-ochre mb-4">Guest Stories</div>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <h2 className="font-display text-4xl text-juniper">What our guests say</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} className={`w-5 h-5 ${n <= avgRounded ? "text-ochre fill-ochre" : "text-juniper/15"}`} />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-heading text-2xl text-juniper mr-1.5">{avg.toFixed(1)}</span>
            based on {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {reviews.map((t) => (
          <figure key={t.id} className="h-full flex flex-col bg-card border border-juniper/5 p-7 sm:p-9 transition-colors hover:border-ochre/30">
            <div className="flex items-center justify-between mb-5">
              <Quote className="w-7 h-7 text-ochre/70" strokeWidth={1.25} />
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-3.5 h-3.5 ${n <= (t.rating || 5) ? "text-ochre fill-ochre" : "text-juniper/15"}`} />
                ))}
              </div>
            </div>
            <blockquote className="font-display text-xl text-juniper leading-relaxed flex-1">"{t.quote}"</blockquote>
            <figcaption className="mt-7 flex items-center gap-4 pt-6 border-t hairline">
              {t.photo ? (
                <span className="shrink-0 h-12 w-12 rounded-full overflow-hidden ring-1 ring-juniper/10 bg-stone">
                  <Image src={t.photo} fittingType="fill" alt={t.name} className="h-full w-full object-cover" />
                </span>
              ) : (
                <span className="shrink-0 h-12 w-12 rounded-full bg-stone ring-1 ring-juniper/10" />
              )}
              <div>
                <div className="font-heading text-base text-juniper leading-tight">{t.name}</div>
                {t.location && <div className="eyebrow text-ochre mt-1.5 normal-case tracking-widest text-[0.62rem]">{t.location}</div>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12">
        <Link to="/reviews" className="inline-flex items-center gap-2 eyebrow text-juniper hover:text-ochre transition-colors group">
          Share your story
          <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </div>
    </SectionReveal>
  );
}