import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function DestinationCard({ destination, index = 0 }) {
  return (
    <Link to={`/destinations/${destination.slug}`} className="group relative block overflow-hidden aspect-[4/5] bg-juniper transition-all duration-700 hover:shadow-2xl">
      <Image src={destination.heroImage} fittingType="fill" alt={destination.name} className="w-full h-full transition-transform duration-[1800ms] ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-juniper/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-ivory">
        <div className="eyebrow text-ochre mb-3 opacity-90">{String(index + 1).padStart(2, "0")} — Destination</div>
        <h3 className="font-display text-4xl sm:text-5xl leading-none text-shadow-cinematic">{destination.name}</h3>
        {destination.tagline && <p className="text-sm text-ivory/75 mt-3 max-w-xs">{destination.tagline}</p>}
        <div className="flex items-center gap-2 mt-5 text-sm font-medium text-ivory tracking-widest uppercase">
          <span className="relative">
            Explore
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-ochre transition-all duration-500 group-hover:w-full" />
          </span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </Link>
  );
}