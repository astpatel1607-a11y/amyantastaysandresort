import React, { useState, useEffect } from "react";
import { Quote, Star, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SectionReveal from "@/components/SectionReveal";
import ReviewForm from "@/components/ReviewForm";
import { Image } from "@/components/ui/image";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Review.filter({ status: "active" }, { sort: "-created_date", limit: 100 })
      .then((r) => setReviews(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-ivory pt-28 sm:pt-32">
      <section className="max-w-content mx-auto px-5 sm:px-8 pb-16">
        <SectionReveal className="max-w-2xl mb-14">
          <div className="eyebrow text-ochre mb-4">Guest Stories</div>
          <h1 className="font-heading text-4xl sm:text-6xl text-juniper leading-[1.05]">Stories from our travellers</h1>
          <p className="mt-6 text-lg text-muted-foreground font-light">Real experiences from guests who discovered the wild and the refined with Amyanta.</p>
        </SectionReveal>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-ochre w-8 h-8" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground font-light text-center py-16">No reviews yet — be the first to share your story below.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((t, i) => (
              <SectionReveal key={t.id} delay={(i % 3) * 0.1}>
                <figure className="h-full flex flex-col bg-card border border-juniper/5 p-7 sm:p-9">
                  <div className="flex items-center gap-1 mb-5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-4 h-4 ${n <= (t.rating || 5) ? "text-ochre fill-ochre" : "text-juniper/15"}`} />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 text-ochre/60 mb-4" strokeWidth={1.25} />
                  <blockquote className="font-display text-lg sm:text-xl text-juniper leading-relaxed flex-1">"{t.quote}"</blockquote>
                  <figcaption className="mt-7 flex items-center gap-4 pt-6 border-t hairline">
                    {t.photo && (
                      <span className="shrink-0 h-12 w-12 rounded-full overflow-hidden ring-1 ring-juniper/10 bg-stone">
                        <Image src={t.photo} fittingType="fill" alt={t.name} className="h-full w-full object-cover" />
                      </span>
                    )}
                    <div>
                      <div className="font-heading text-base text-juniper leading-tight">{t.name}</div>
                      {t.location && <div className="eyebrow text-ochre mt-1 normal-case tracking-widest text-[0.62rem]">{t.location}</div>}
                    </div>
                  </figcaption>
                </figure>
              </SectionReveal>
            ))}
          </div>
        )}
      </section>

      <section className="py-20 sm:py-28 bg-stone/40 border-t hairline">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <SectionReveal className="text-center mb-12">
            <div className="eyebrow text-ochre mb-4">Share Your Experience</div>
            <h2 className="font-heading text-3xl sm:text-5xl text-juniper">Leave a Review</h2>
            <p className="mt-5 text-muted-foreground font-light">We'd love to hear about your stay with Amyanta.</p>
          </SectionReveal>
          <div className="bg-card border border-juniper/5 p-7 sm:p-10">
            <ReviewForm />
          </div>
        </div>
      </section>
    </div>
  );
}