import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEnquiry } from "@/lib/enquiryContext";
import SectionReveal from "@/components/SectionReveal";
import PropertyCard from "@/components/PropertyCard";
import ExperienceCard from "@/components/ExperienceCard";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

// Per-destination editorial mood, keyed by slug. CMS data is shown alongside.
const DEST_MOOD = {
  "sasan-gir": { intro: "Where the Wild Begins", text: "Step into the landscapes of Gir and discover a stay shaped by nature, wildlife and unforgettable experiences." },
  "jawai": { intro: "The Wild Has a Different Rhythm", text: "Follow the landscapes, discover the wildlife and experience Jawai beyond the ordinary." },
  "udaipur": { intro: "A Royal Escape, Reimagined", text: "Slow down, take in the lake views and experience the timeless elegance of Udaipur." }
};

export default function DestinationDetail() {
  const { slug } = useParams();
  const [destination, setDestination] = useState(null);
  const [properties, setProperties] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openEnquiry } = useEnquiry();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    base44.entities.Destination.filter({ slug, status: "active" }, { limit: 1 })
      .then((r) => {
        const d = (r.items || [])[0];
        setDestination(d);
        if (d) {
          base44.entities.Property.filter({ destinationId: d.id, status: "active" }, { limit: 50 }).then((rr) => setProperties(rr.items || []));
          base44.entities.Experience.filter({ destinationId: d.id, status: "active" }, { limit: 20 }).then((rr) => setExperiences(rr.items || []));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-32 max-w-content mx-auto px-5"><div className="h-80 bg-stone animate-pulse" /></div>;
  if (!destination) return <div className="pt-40 pb-40 text-center text-muted-foreground">Destination not found. <Link to="/destinations" className="text-ochre underline">Back to destinations</Link></div>;

  const mood = DEST_MOOD[destination.slug] || { intro: destination.tagline, text: "" };

  return (
    <div className="pt-16 sm:pt-20 bg-ivory">
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[440px] overflow-hidden bg-charcoal">
        <Image src={destination.heroImage} fittingType="fill" alt={destination.name} className="w-full h-full animate-kenburns" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-juniper/20 to-charcoal/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-content mx-auto">
            <Link to="/destinations" className="text-ivory/70 text-sm flex items-center gap-1 mb-4 hover:text-ivory transition-colors"><ArrowLeft className="w-4 h-4" /> Destinations</Link>
            <div className="eyebrow text-ochre mb-3">{destination.tagline}</div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-ivory uppercase tracking-cinematic text-shadow-cinematic">{destination.name}</h1>
          </div>
        </div>
      </section>

      {/* INTRO + PLAN */}
      <section className="py-20 sm:py-28 max-w-content mx-auto px-5 sm:px-8 grid lg:grid-cols-3 gap-12">
        <SectionReveal className="lg:col-span-2">
          <div className="eyebrow text-ochre mb-4">{destination.name}</div>
          <h2 className="font-display text-4xl sm:text-5xl text-juniper leading-[1.05] mb-6">{mood.intro}</h2>
          {mood.text && <p className="text-xl text-muted-foreground font-light leading-relaxed mb-8 max-w-xl">{mood.text}</p>}
          {destination.description && <p className="text-lg leading-relaxed text-juniper/75 whitespace-pre-line">{destination.description}</p>}
          {destination.experiences?.length > 0 && (
            <div className="mt-10">
              <h3 className="eyebrow text-juniper/60 mb-4">Signature Experiences</h3>
              <div className="flex flex-wrap gap-2">
                {destination.experiences.map((e) => (
                  <span key={e} className="eyebrow text-ochre border border-ochre/30 px-4 py-2 normal-case tracking-normal text-sm font-body">{e}</span>
                ))}
              </div>
            </div>
          )}
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <div className="p-8 bg-juniper text-ivory sticky top-24">
            <h3 className="font-display text-3xl text-ivory mb-3">Plan your {destination.name} stay</h3>
            <p className="text-sm text-ivory/70 mb-6 font-light leading-relaxed">Tell us your dates and our concierge will craft the perfect getaway.</p>
            <Button onClick={() => openEnquiry({ destination: destination.name })} className="w-full bg-ochre hover:bg-ochre/90 text-ivory rounded-none">Enquire Now <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </SectionReveal>
      </section>

      {/* PROPERTIES */}
      {properties.length > 0 && (
        <section className="py-20 sm:py-28 bg-stone/40 border-y hairline">
          <div className="max-w-content mx-auto px-5 sm:px-8">
            <SectionReveal className="mb-14">
              <div className="eyebrow text-ochre mb-4">Stays</div>
              <h2 className="font-heading text-4xl sm:text-5xl text-juniper">Stays in {destination.name}</h2>
            </SectionReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {properties.map((p, i) => (
                <SectionReveal key={p.id} delay={(i % 3) * 0.1}><PropertyCard property={p} /></SectionReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXPERIENCES */}
      {experiences.length > 0 && (
        <section className="py-20 sm:py-28 max-w-content mx-auto px-5 sm:px-8">
          <SectionReveal className="mb-14"><div className="eyebrow text-ochre mb-4">Experiences</div><h2 className="font-heading text-4xl sm:text-5xl text-juniper">Experience {destination.name}</h2></SectionReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((e, i) => <SectionReveal key={e.id} delay={(i % 3) * 0.1}><ExperienceCard experience={e} /></SectionReveal>)}
          </div>
        </section>
      )}

      {/* NEARBY */}
      {destination.nearbyAttractions?.length > 0 && (
        <section className="py-16 sm:py-20 bg-stone/40 border-t hairline">
          <div className="max-w-content mx-auto px-5 sm:px-8">
            <SectionReveal><div className="eyebrow text-ochre mb-4">Explore Beyond</div><h2 className="font-heading text-3xl sm:text-4xl text-juniper mb-10">Nearby Attractions</h2></SectionReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10">
              {destination.nearbyAttractions.map((a) => (
                <div key={a} className="flex items-center gap-3 p-6 bg-card">
                  <MapPin className="w-4 h-4 text-ochre shrink-0" /><span className="text-juniper/80">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}