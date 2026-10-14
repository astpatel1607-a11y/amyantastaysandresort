import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useEnquiry } from "@/lib/enquiryContext";

export default function ExperienceCard({ experience }) {
  const { openEnquiry } = useEnquiry();
  const img = experience.images?.[0];
  return (
    <button
      onClick={() => openEnquiry({ destination: experience.destinationName, message: `I'm interested in the ${experience.title} experience.` })}
      className="group relative block w-full overflow-hidden aspect-[4/5] text-left bg-juniper"
    >
      {img && <Image src={img} fittingType="fill" alt={experience.title} className="w-full h-full transition-transform duration-[1200ms] ease-out group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-juniper/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-ivory">
        {experience.category && <span className="eyebrow text-ochre mb-2">{experience.category}</span>}
        <h3 className="font-heading text-2xl leading-tight text-shadow-cinematic">{experience.title}</h3>
        {experience.description && <p className="text-sm text-ivory/70 mt-2 line-clamp-2">{experience.description}</p>}
        <div className="flex items-center gap-2 mt-4 eyebrow text-ivory">
          <span className="relative">Enquire
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-ochre transition-all duration-500 group-hover:w-full" />
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </button>
  );
}