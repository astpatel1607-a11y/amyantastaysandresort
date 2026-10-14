import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { getSiteSettings } from "@/lib/site";
import SectionReveal from "@/components/SectionReveal";
import { Image } from "@/components/ui/image";

export default function About() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { getSiteSettings().then(setSettings); }, []);

  return (
    <div className="pt-16 sm:pt-20 bg-ivory">
      <section className="py-20 sm:py-32 max-w-content mx-auto px-5 sm:px-8">
        <SectionReveal className="max-w-3xl">
          <div className="eyebrow text-ochre mb-4">About</div>
          <h1 className="font-heading text-5xl sm:text-7xl text-juniper leading-[1.02]">More Than a Stay</h1>
          <p className="mt-8 text-xl leading-relaxed text-juniper/75 font-light">
            Amyanta Stays and Resorts is a hospitality brand bringing together distinctive stays and the experiences that make a destination unforgettable — across the wild landscapes and timeless beauty of Gujarat and Rajasthan.
          </p>
        </SectionReveal>

        {settings?.heroImage && (
          <SectionReveal delay={0.1} className="mt-16">
            <div className="aspect-[21/9] overflow-hidden bg-stone">
              <Image src={settings.heroImage} fittingType="fill" alt="Amyanta — curated wilderness hospitality" className="w-full h-full" />
            </div>
          </SectionReveal>
        )}

        {settings?.aboutStory && (
          <SectionReveal className="mt-20 max-w-3xl">
            <div className="eyebrow text-ochre mb-4">Our Story</div>
            <h2 className="font-display text-4xl text-juniper mb-6">The journey so far</h2>
            <p className="text-lg leading-relaxed text-juniper/75 whitespace-pre-line font-light">{settings.aboutStory}</p>
          </SectionReveal>
        )}

        <div className="mt-20 grid md:grid-cols-2 gap-px bg-foreground/10 border hairline">
          {settings?.vision && (
            <SectionReveal>
              <div className="p-10 bg-card h-full">
                <div className="eyebrow text-ochre mb-4">Vision</div>
                <p className="text-juniper/75 leading-relaxed font-light text-lg">{settings.vision}</p>
              </div>
            </SectionReveal>
          )}
          {settings?.mission && (
            <SectionReveal delay={0.1}>
              <div className="p-10 bg-card h-full">
                <div className="eyebrow text-ochre mb-4">Mission</div>
                <p className="text-juniper/75 leading-relaxed font-light text-lg">{settings.mission}</p>
              </div>
            </SectionReveal>
          )}
        </div>

        {settings?.founderName && (
          <SectionReveal className="mt-24">
            <div className="grid md:grid-cols-3 gap-10 items-center">
              {settings.founderImage && (
                <div className="aspect-[3/4] overflow-hidden bg-stone">
                  <Image src={settings.founderImage} fittingType="fill" alt={settings.founderName} className="w-full h-full" />
                </div>
              )}
              <div className="md:col-span-2">
                <div className="eyebrow text-ochre mb-4">Founder</div>
                <h2 className="font-display text-4xl text-juniper mb-5">{settings.founderName}</h2>
                <p className="text-lg leading-relaxed text-juniper/75 whitespace-pre-line font-light">{settings.founderStory}</p>
              </div>
            </div>
          </SectionReveal>
        )}
      </section>
    </div>
  );
}