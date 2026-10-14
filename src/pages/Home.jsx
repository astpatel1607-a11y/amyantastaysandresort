import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown, Compass, MapPin, Sparkles, HandHeart, Crown, Leaf } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSiteSettings, buildWhatsAppUrl, buildTelUrl } from "@/lib/site";
import { useEnquiry } from "@/lib/enquiryContext";
import SectionReveal from "@/components/SectionReveal";
import PropertyCard from "@/components/PropertyCard";
import ExperienceCard from "@/components/ExperienceCard";
import Testimonials from "@/components/Testimonials";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

// Per-destination editorial copy for the home "Choose Your Escape" section.
const DEST_COPY = {
  "sasan-gir": { heading: "Into the Wild", text: "Discover the forests, wildlife and unforgettable safari experiences of Gir.", cta: "Explore Sasan Gir" },
  "jawai": { heading: "Wild, Untamed, Extraordinary", text: "Explore dramatic landscapes, leopard country and the raw beauty of Jawai.", cta: "Discover Jawai" },
  "udaipur": { heading: "Where Royalty Meets Tranquillity", text: "Experience the timeless charm of Udaipur through refined stays, lakeside beauty and Rajasthan's royal character.", cta: "Discover Udaipur" }
};

const WHY = [
  { icon: Compass, title: "Curated Stays", text: "Selected properties with character and comfort." },
  { icon: Leaf, title: "Authentic Experiences", text: "Discover the destination beyond your room." },
  { icon: MapPin, title: "Wild Escapes", text: "From Gir forests to Jawai's dramatic landscapes." },
  { icon: Crown, title: "Royal Getaways", text: "Experience the timeless elegance of Rajasthan." },
  { icon: HandHeart, title: "Personalized Assistance", text: "Plan your stay directly with Amyanta." }
];

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [gallery, setGallery] = useState([]);
  const { openEnquiry } = useEnquiry();

  useEffect(() => {
    getSiteSettings().then(setSettings);
    base44.entities.Destination.filter({ status: "active", featured: true }, { limit: 6 }).then((r) => setDestinations(r.items || []));
    base44.entities.Property.filter({ status: "active", featured: true }, { limit: 6, sort: "-created_date" }).then((r) => setProperties(r.items || []));
    base44.entities.Experience.filter({ status: "active", featured: true }, { limit: 6 }).then((r) => setExperiences(r.items || []));
    base44.entities.GalleryItem.filter({}, { limit: 8 }).then((r) => setGallery(r.items || []));
  }, []);

  const wa = buildWhatsAppUrl(settings?.whatsappNumber, `Hello ${settings?.brandName || "Amyanta"}, I would like to enquire about a stay.`);
  const heroImg = settings?.heroImage;

  // Order destinations to match the brand narrative: Gir, Jawai, Udaipur
  const ordered = ["sasan-gir", "jawai", "udaipur"]
    .map((s) => destinations.find((d) => d.slug === s))
    .filter(Boolean);
  const homeDestinations = ordered.length ? ordered : destinations;

  return (
    <div className="bg-ivory">
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-charcoal">
        {heroImg && (
          <div className="absolute inset-0">
            <Image src={heroImg} fittingType="fill" quality={100} alt="Amyanta — curated stays across Rajasthan and Gujarat" className="w-full h-full animate-kenburns" />
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/25 to-charcoal/70" />
          </div>
        )}
        <div className="relative h-full max-w-content mx-auto px-5 sm:px-8 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl">
            <div className="eyebrow text-ivory/80 mb-6">Amyanta Stays & Resorts</div>
            <h1 className="display-heading text-ivory text-5xl sm:text-7xl lg:text-8xl uppercase tracking-cinematic text-shadow-cinematic">
              Stay. Explore.<br />Experience.
            </h1>
            <p className="mt-8 text-lg sm:text-xl text-ivory/85 max-w-xl leading-relaxed font-light">
              Curated stays and extraordinary experiences across the wild landscapes and timeless beauty of Rajasthan and Gujarat.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/destinations">
                <Button className="bg-ivory hover:bg-ivory/90 text-juniper px-7 h-12 rounded-none font-medium tracking-wide">Explore Destinations <ArrowRight className="w-4 h-4" /></Button>
              </Link>
              <Button onClick={() => openEnquiry()} variant="outline" className="bg-transparent border-ivory/40 text-ivory hover:bg-ivory/10 px-7 h-12 rounded-none font-medium tracking-wide">Plan Your Stay</Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-ivory/60">
          <span className="eyebrow text-[0.6rem] mb-3">Scroll</span>
          <div className="w-px h-12 bg-ivory/25 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-3 bg-ochre animate-scroll-hint" />
          </div>
          <ChevronDown className="w-4 h-4 -mt-1 animate-bounce" />
        </div>
      </section>

      {/* DESTINATIONS — editorial alternating panels */}
      <section className="py-24 sm:py-36 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-2xl mb-20">
          <div className="eyebrow text-ochre mb-4">Choose Your Escape</div>
          <h2 className="font-heading text-4xl sm:text-6xl text-juniper leading-[1.05]">From untamed wilderness to royal tranquillity</h2>
          <p className="mt-6 text-lg text-muted-foreground font-light max-w-xl">Discover destinations designed for unforgettable stays.</p>
        </SectionReveal>

        <div className="space-y-24 sm:space-y-36">
          {homeDestinations.map((d, i) => {
            const copy = DEST_COPY[d.slug] || { heading: d.name, text: d.tagline, cta: `Explore ${d.name}` };
            const flip = i % 2 === 1;
            return (
              <SectionReveal key={d.id}>
                <div className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${flip ? "lg:[&>div:first-child]:order-2" : ""}`}>
                  <Link to={`/destinations/${d.slug}`} className="group relative block aspect-[4/5] sm:aspect-[5/6] overflow-hidden bg-stone">
                    <Image src={d.heroImage} fittingType="fill" alt={d.name} className="w-full h-full transition-transform duration-[1800ms] ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-6 left-6 eyebrow text-ivory/90 bg-charcoal/30 backdrop-blur-sm px-3 py-1.5">{String(i + 1).padStart(2, "0")}</div>
                  </Link>
                  <div className={flip ? "lg:pl-8" : "lg:pr-8"}>
                    <div className="eyebrow text-ochre mb-4">{d.name}</div>
                    <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-juniper leading-[1.02]">{copy.heading}</h3>
                    <p className="mt-6 text-lg text-muted-foreground font-light leading-relaxed max-w-md">{copy.text}</p>
                    <Link to={`/destinations/${d.slug}`} className="inline-flex items-center gap-2 mt-8 eyebrow text-juniper hover:text-ochre transition-colors group/cta">
                      {copy.cta}
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1" />
                    </Link>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-24 sm:py-32 bg-stone/40 border-y hairline">
        <div className="max-w-content mx-auto px-5 sm:px-8">
          <SectionReveal className="flex flex-wrap items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <div className="eyebrow text-ochre mb-4">Featured Stays</div>
              <h2 className="font-heading text-4xl sm:text-6xl text-juniper leading-[1.05]">Stays Worth Remembering</h2>
              <p className="mt-5 text-lg text-muted-foreground font-light">Handpicked stays where comfort, character and destination come together.</p>
            </div>
            <Link to="/destinations" className="inline-flex items-center gap-2 eyebrow text-juniper hover:text-ochre transition-colors group">
              View All Properties <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </SectionReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {properties.map((p, i) => (
              <SectionReveal key={p.id} delay={(i % 3) * 0.1}>
                <PropertyCard property={p} />
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY AMYANTA */}
      <section className="py-24 sm:py-36 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-2xl mb-16">
          <div className="eyebrow text-ochre mb-4">More Than a Stay</div>
          <h2 className="font-heading text-4xl sm:text-6xl text-juniper leading-[1.05]">The experience is the destination</h2>
          <p className="mt-6 text-lg text-muted-foreground font-light">Amyanta brings together distinctive stays and the experiences that make a destination unforgettable.</p>
        </SectionReveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14">
          {WHY.map((w, i) => (
            <SectionReveal key={w.title} delay={(i % 3) * 0.08}>
              <div className="group">
                <div className="flex items-center gap-3 mb-4">
                  <w.icon className="w-5 h-5 text-ochre" strokeWidth={1.5} />
                  <span className="eyebrow text-juniper/50">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-heading text-2xl text-juniper mb-2">{w.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-light">{w.text}</p>
                <div className="mt-5 w-12 h-px bg-ochre/40 group-hover:w-20 transition-all duration-700" />
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* EXPERIENCES — cinematic dark */}
      <section className="relative py-24 sm:py-36 bg-juniper text-ivory overflow-hidden">
        <div className="max-w-content mx-auto px-5 sm:px-8 relative">
          <SectionReveal className="max-w-2xl mb-16">
            <div className="eyebrow text-ochre mb-4">Experience the Extraordinary</div>
            <h2 className="font-display text-4xl sm:text-6xl text-ivory leading-[1.02]">Because the best journeys are remembered for what you experienced</h2>
            <p className="mt-6 text-lg text-ivory/70 font-light">Not just where you stayed.</p>
          </SectionReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((e, i) => (
              <SectionReveal key={e.id} delay={(i % 3) * 0.1}>
                <ExperienceCard experience={e} />
              </SectionReveal>
            ))}
          </div>
          <div className="mt-14">
            <Link to="/experiences" className="inline-flex items-center gap-2 eyebrow text-ivory hover:text-ochre transition-colors group">
              Explore Experiences <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-24 sm:py-32 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="eyebrow text-ochre mb-4">Moments</div>
            <h2 className="font-heading text-4xl sm:text-5xl text-juniper">A Glimpse of the Wild</h2>
          </div>
          <Link to="/gallery" className="inline-flex items-center gap-2 eyebrow text-juniper hover:text-ochre transition-colors group">
            View Full Gallery <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </SectionReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {gallery.slice(0, 8).map((g, i) => (
            <SectionReveal key={g.id} delay={(i % 4) * 0.06}>
              <div className="relative overflow-hidden bg-stone aspect-square">
                <Image src={g.image} fittingType="fill" alt={g.caption || "Amyanta gallery"} className="w-full h-full transition-transform duration-[1200ms] ease-out hover:scale-110" />
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 sm:py-48 overflow-hidden bg-charcoal">
        {heroImg && <div className="absolute inset-0"><Image src={heroImg} fittingType="fill" alt="" className="w-full h-full" /><div className="absolute inset-0 bg-charcoal/80" /></div>}
        <div className="relative max-w-content mx-auto px-5 sm:px-8 text-center">
          <SectionReveal>
            <div className="eyebrow text-ochre mb-6">Your Next Escape Awaits</div>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl text-ivory leading-[1.0] text-shadow-cinematic max-w-4xl mx-auto">Wild landscapes. Timeless stays.</h2>
            <p className="mt-8 text-lg text-ivory/70 max-w-2xl mx-auto font-light">Experiences worth remembering.</p>
            <div className="mt-12 flex flex-wrap gap-4 justify-center">
              <Button onClick={() => openEnquiry()} className="bg-ochre hover:bg-ochre/90 text-ivory px-8 h-13 py-3.5 rounded-none font-medium tracking-wide">Enquire Now</Button>
              <a href={wa} target="_blank" rel="noreferrer">
                <Button variant="outline" className="bg-transparent border-ivory/40 text-ivory hover:bg-ivory/10 px-8 h-13 py-3.5 rounded-none font-medium tracking-wide">
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp Amyanta
                </Button>
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}