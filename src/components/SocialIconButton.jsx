import React from "react";
import { motion } from "framer-motion";

/**
 * Innovative social icon button — a refined circular badge with an animated
 * antique-gold ring that sweeps in on hover, a soft radial glow, and a lifted
 * icon. Adapts its resting colors to the surface it sits on.
 *
 * variant:
 *  - "onDark"  : ivory icon, faint ivory border (hero / dark footer)
 *  - "onLight" : juniper icon, faint juniper border (scrolled light header)
 */
export default function SocialIconButton({ href, label, icon: Icon, variant = "onDark", className = "" }) {
  if (!href) return null;
  const onDark = variant === "onDark";

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-full ${className}`}
    >
      {/* animated gold ring */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-full border transition-all duration-500 ease-out ${
          onDark
            ? "border-ivory/25 group-hover:border-ochre"
            : "border-juniper/20 group-hover:border-ochre"
        }`}
      />
      {/* sweep arc — a gold segment that rotates in on hover */}
      <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from -90deg, transparent 0deg, rgba(168,139,94,0.0) 200deg, rgba(168,139,94,0.55) 340deg, transparent 360deg)",
          }}
        />
      </span>
      {/* soft radial glow */}
      <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(168,139,94,0.18),transparent_70%)]" />
      {/* icon */}
      <Icon
        className={`relative z-10 w-4 h-4 transition-all duration-500 group-hover:-translate-y-0.5 ${
          onDark ? "text-ivory/90 group-hover:text-ochre" : "text-juniper group-hover:text-ochre"
        }`}
        strokeWidth={1.5}
      />
    </motion.a>
  );
}