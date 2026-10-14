import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Quote, Loader2, ArrowRight } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Review.filter({ status: "active" }, { sort: "-created_date", limit: 3 })
      .then((r) => setReviews(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 sm:py-36 max-w-content mx-auto px-5 sm:px-8">
      <SectionReveal className="max-w-2xl mb-16 sm:mb-20">
        <div className="eyebrow text-ochre mb-4">Guest Stories</div>
        <h2 className="font-heading text-4xl sm:text-6xl text-juniper leading-[1.05]">Loved by travellers, remembered forever</h2>
        <p className="mt-6 text-lg text-muted-foreground font-light">Real experiences from guests who discovered the wild and the refined with Amyanta.</p>
      </SectionReveal>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-ochre w-7 h-7" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-muted-foreground font-light py-12">Reviews coming soon.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((t, i) => (
            <SectionReveal key={t.id} delay={(i % 3) * 0.12}>
              <figure className="group h-full flex flex-col bg-card border border-juniper/5 p-7 sm:p-9 transition-colors hover:border-ochre/30">
                <Quote className="w-8 h-8 text-ochre/70 mb-6" strokeWidth={1.25} />
                <blockquote className="font-display text-xl sm:text-2xl text-juniper leading-relaxed flex-1">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 pt-6 border-t hairline">
                  {t.photo && (
                    <span className="shrink-0 h-14 w-14 rounded-full overflow-hidden ring-1 ring-juniper/10 bg-stone">
                      <Image src={t.photo} fittingType="fill" alt={t.name} className="h-full w-full object-cover" />
                    </span>
                  )}
                  <div>
                    <div className="font-heading text-base text-juniper leading-tight">{t.name}</div>
                    {t.location && <div className="eyebrow text-ochre mt-1.5 normal-case tracking-widest text-[0.62rem]">{t.location}</div>}
                  </div>
                </figcaption>
              </figure>
            </SectionReveal>
          ))}
        </div>
      )}

      <div className="mt-14 text-center">
        <Link to="/reviews" className="inline-flex items-center gap-2 eyebrow text-juniper hover:text-ochre transition-colors group">
          Share Your Story
          <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}