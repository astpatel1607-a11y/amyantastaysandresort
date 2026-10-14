import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Clock, Check, BedDouble, Utensils, ArrowUpRight, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getSiteSettings, buildWhatsAppUrl, buildTelUrl, buildPropertyWhatsAppMessage } from "@/lib/site";
import { useEnquiry } from "@/lib/enquiryContext";
import SectionReveal from "@/components/SectionReveal";
import Lightbox from "@/components/Lightbox";
import PropertyReviews from "@/components/PropertyReviews";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

export default function PropertyDetail() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [destination, setDestination] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const { openEnquiry } = useEnquiry();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    base44.entities.Property.filter({ slug, status: "active" }, { limit: 1 })
      .then(async (r) => {
        const p = (r.items || [])[0];
        setProperty(p);
        if (p) {
          base44.entities.Room.filter({ propertyId: p.id }, { limit: 50 }).then((rr) => setRooms(rr.items || []));
          if (p.destinationId) base44.entities.Destination.get(p.destinationId).then(setDestination).catch(() => {});
        }
      })
      .finally(() => setLoading(false));
    getSiteSettings().then(setSettings);
  }, [slug]);

  if (loading) return <div className="pt-32 max-w-content mx-auto px-5"><div className="h-80 bg-stone animate-pulse" /></div>;
  if (!property) return <div className="pt-40 pb-40 text-center text-muted-foreground">Property not found. <Link to="/destinations" className="text-ochre underline">Back to destinations</Link></div>;

  const gallery = property.gallery?.length ? property.gallery : [property.heroImage].filter(Boolean);
  const waMsg = buildPropertyWhatsAppMessage(property, destination);
  const wa = buildWhatsAppUrl(settings?.whatsappNumber, waMsg);
  const phone = settings?.phoneNumbers?.[0] ? buildTelUrl(settings.phoneNumbers[0]) : null;

  return (
    <div className="pt-16 sm:pt-20 pb-20 lg:pb-0 bg-ivory">
      {/* HERO */}
      <section className="relative h-[68vh] min-h-[460px] overflow-hidden bg-charcoal">
        <Image src={property.heroImage} fittingType="fill" alt={property.name} className="w-full h-full animate-kenburns" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-juniper/20 to-charcoal/30" />
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10">
          <div className="max-w-content mx-auto">
            <Link to={destination ? `/destinations/${destination.slug}` : "/destinations"} className="text-ivory/70 text-sm flex items-center gap-1 mb-4 hover:text-ivory transition-colors"><ArrowLeft className="w-4 h-4" /> {property.destinationName}</Link>
            <div className="eyebrow text-ochre mb-3">Your Escape Begins Here</div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-ivory max-w-3xl leading-[1.02] text-shadow-cinematic">{property.name}</h1>
            {property.tagline && <p className="mt-4 text-lg text-ivory/80 font-light italic max-w-xl">{property.tagline}</p>}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={() => openEnquiry({ property: property.name, destination: property.destinationName })} className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none px-6">Enquire Now <ArrowRight className="w-4 h-4" /></Button>
              <a href={wa} target="_blank" rel="noreferrer"><Button variant="outline" className="bg-transparent border-ivory/40 text-ivory hover:bg-ivory/10 rounded-none px-6"><WhatsAppIcon className="w-4 h-4" /> WhatsApp</Button></a>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY MASONRY */}
      {gallery.length > 0 && (
        <section className="py-16 sm:py-20 max-w-content mx-auto px-5 sm:px-8">
          <SectionReveal><div className="eyebrow text-ochre mb-4">A Look Inside</div><h2 className="font-heading text-3xl sm:text-4xl text-juniper mb-10">Gallery</h2></SectionReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setLightbox({ images: gallery, index: i })} className={`relative overflow-hidden group bg-stone ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                <Image src={img} fittingType="fill" alt={`${property.name} ${i + 1}`} className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-500" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* OVERVIEW + STICKY ENQUIRY */}
      <section className="py-16 sm:py-20 max-w-content mx-auto px-5 sm:px-8 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          <SectionReveal>
            <div className="eyebrow text-ochre mb-4">The Stay</div>
            <h2 className="font-display text-4xl text-juniper mb-6">{property.tagline || "An invitation to slow down"}</h2>
            <p className="text-lg leading-relaxed text-juniper/75 whitespace-pre-line font-light">{property.description}</p>
          </SectionReveal>

          {/* AMENITIES */}
          {property.amenities?.length > 0 && (
            <SectionReveal>
              <div className="eyebrow text-ochre mb-4">Amenities</div>
              <h2 className="font-heading text-3xl text-juniper mb-8">Designed for Comfort</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-foreground/10 border hairline">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-5 bg-card"><Check className="w-4 h-4 text-forest shrink-0" strokeWidth={2.5} /><span className="text-juniper/80 text-sm">{a}</span></div>
                ))}
              </div>
            </SectionReveal>
          )}

          {/* ROOMS */}
          {rooms.length > 0 && (
            <SectionReveal>
              <div className="eyebrow text-ochre mb-4">Rooms & Residences</div>
              <h2 className="font-display text-4xl text-juniper mb-2">Rooms & Residences</h2>
              <p className="text-muted-foreground mb-10 font-light italic">Designed for slow moments.</p>
              <div className="space-y-10">
                {rooms.map((room) => (
                  <div key={room.id} className="grid md:grid-cols-2 gap-6 group">
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone">
                      {room.images?.[0] && <Image src={room.images[0]} fittingType="fill" alt={room.name} className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-heading text-2xl text-juniper">{room.name}</h3>
                      <p className="text-sm text-juniper/70 mt-3 leading-relaxed">{room.description}</p>
                      <div className="flex flex-wrap gap-5 mt-5 text-sm text-muted-foreground">
                        {room.occupancy && <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-ochre" /> {room.occupancy}</span>}
                      </div>
                      {room.facilities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {room.facilities.map((f) => <span key={f} className="text-xs px-3 py-1 border hairline text-juniper/60">{f}</span>)}
                        </div>
                      )}
                      <Button onClick={() => openEnquiry({ property: property.name, destination: property.destinationName, message: `I am interested in the ${room.name} at ${property.name}.` })} variant="outline" className="mt-6 self-start border-juniper/20 text-juniper rounded-none">Enquire for this room <ArrowUpRight className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionReveal>
          )}

          {/* MEAL PLAN */}
          {property.mealPlan && (
            <SectionReveal>
              <div className="eyebrow text-ochre mb-4">Taste the Destination</div>
              <h2 className="font-heading text-3xl text-juniper mb-5 flex items-center gap-2"><Utensils className="w-5 h-5 text-ochre" strokeWidth={1.5} /> Dining</h2>
              <p className="text-juniper/75 leading-relaxed font-light">{property.mealPlan}</p>
            </SectionReveal>
          )}

          {/* TARIFF */}
          <SectionReveal>
            <div className="eyebrow text-ochre mb-4">Plan Your Stay</div>
            <h2 className="font-heading text-3xl text-juniper mb-6">The Tariff</h2>
            <div className="p-8 bg-juniper text-ivory flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="font-heading text-2xl text-ivory">Tariff on request</div>
                <p className="text-xs text-ivory/50 mt-2 font-light">Tariffs vary by season and room selection.</p>
              </div>
              <Button onClick={() => openEnquiry({ property: property.name, destination: property.destinationName })} className="bg-ochre hover:bg-ochre/90 text-ivory rounded-none">Enquire for tariff</Button>
            </div>
          </SectionReveal>

          {/* REVIEWS */}
          <PropertyReviews property={property} />

          {/* LOCATION */}
          {(property.location || property.mapUrl) && (
            <SectionReveal>
              <div className="eyebrow text-ochre mb-4">The Location</div>
              <h2 className="font-heading text-3xl text-juniper mb-5 flex items-center gap-2"><MapPin className="w-5 h-5 text-ochre" strokeWidth={1.5} /> Where You'll Be</h2>
              {property.location && <p className="text-juniper/75 mb-5 font-light">{property.location}</p>}
              {property.mapUrl && (
                <div className="overflow-hidden border hairline aspect-[16/10]">
                  <iframe src={property.mapUrl} className="w-full h-full grayscale" loading="lazy" title={`${property.name} map`} />
                </div>
              )}
            </SectionReveal>
          )}

          {/* NEARBY */}
          {property.nearbyAttractions?.length > 0 && (
            <SectionReveal>
              <div className="eyebrow text-ochre mb-4">Explore Beyond the Property</div>
              <h2 className="font-heading text-3xl text-juniper mb-6">Nearby Attractions</h2>
              <div className="grid sm:grid-cols-2 gap-px bg-foreground/10 border hairline">
                {property.nearbyAttractions.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-5 bg-card"><MapPin className="w-4 h-4 text-ochre shrink-0" /><span className="text-juniper/80 text-sm">{a}</span></div>
                ))}
              </div>
            </SectionReveal>
          )}

          {/* CHECK IN/OUT */}
          <SectionReveal>
            <div className="grid grid-cols-2 gap-px bg-foreground/10 border hairline">
              <div className="p-6 bg-card">
                <div className="flex items-center gap-2 text-ochre text-sm mb-2"><Clock className="w-4 h-4" strokeWidth={1.5} /> Check-in</div>
                <div className="font-display text-3xl text-juniper">{property.checkIn || "12:00 PM"}</div>
              </div>
              <div className="p-6 bg-card">
                <div className="flex items-center gap-2 text-ochre text-sm mb-2"><Clock className="w-4 h-4" strokeWidth={1.5} /> Check-out</div>
                <div className="font-display text-3xl text-juniper">{property.checkOut || "11:00 AM"}</div>
              </div>
            </div>
          </SectionReveal>
        </div>

        {/* STICKY ENQUIRY SIDEBAR */}
        <div className="hidden lg:block">
          <div className="sticky top-24 p-8 bg-juniper text-ivory">
            <div className="eyebrow text-ochre mb-4">Plan Your Stay</div>
            <h3 className="font-display text-3xl text-ivory mb-3">Begin the conversation</h3>
            <p className="text-ivory/70 text-sm mb-6 font-light leading-relaxed">Share your dates and our concierge will reach out with availability and the best tariff.</p>
            <div className="space-y-3">
              <Button onClick={() => openEnquiry({ property: property.name, destination: property.destinationName })} className="w-full bg-ochre hover:bg-ochre/90 text-ivory rounded-none">Enquire Now</Button>
              <a href={wa} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full bg-transparent border-ivory/30 text-ivory hover:bg-ivory/10 rounded-none"><WhatsAppIcon className="w-4 h-4" /> WhatsApp</Button></a>
              {phone && <a href={phone}><Button variant="outline" className="w-full bg-transparent border-ivory/30 text-ivory hover:bg-ivory/10 rounded-none"><span className="w-4 h-4 flex items-center justify-center"><Phone className="w-4 h-4" /></span> Call Now</Button></a>}
            </div>
          </div>
        </div>
      </section>

      {lightbox && <Lightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}