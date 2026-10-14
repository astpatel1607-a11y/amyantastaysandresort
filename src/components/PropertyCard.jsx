import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useEnquiry } from "@/lib/enquiryContext";

export default function PropertyCard({ property }) {
  const { openEnquiry } = useEnquiry();

  return (
    <div className="group flex flex-col">
      <Link to={`/properties/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-stone">
        <Image src={property.heroImage} fittingType="fill" alt={property.name} className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        {property.featured && (
          <span className="absolute top-4 left-4 eyebrow text-[0.6rem] text-ivory bg-charcoal/50 backdrop-blur-sm px-3 py-1.5">Featured</span>
        )}
      </Link>
      <div className="flex flex-col flex-1 pt-5">
        <div className="eyebrow text-ochre mb-2">{property.destinationName}</div>
        <Link to={`/properties/${property.slug}`}>
          <h3 className="font-heading text-2xl text-juniper leading-tight group-hover:text-forest transition-colors duration-500">{property.name}</h3>
        </Link>
        {property.tagline && <p className="text-sm text-muted-foreground mt-2 line-clamp-1 italic">{property.tagline}</p>}
        <div className="flex items-end justify-between mt-auto pt-5 border-t hairline mt-5">
          <div className="text-sm">
            <span className="eyebrow text-muted-foreground">Tariff on request</span>
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={() => openEnquiry({ property: property.name, destination: property.destinationName })} className="eyebrow text-juniper hover:text-ochre transition-colors">Enquire</button>
            <span className="w-px h-4 bg-foreground/15" />
            <Link to={`/properties/${property.slug}`} className="flex items-center gap-1.5 eyebrow text-juniper hover:text-ochre transition-colors group/link">
              Discover
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}