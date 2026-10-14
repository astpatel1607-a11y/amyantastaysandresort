import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images, index, onClose }) {
  const [i, setI] = useState(index || 0);
  const list = images || [];

  const next = useCallback(() => setI((p) => (p + 1) % list.length), [list.length]);
  const prev = useCallback(() => setI((p) => (p - 1 + list.length) % list.length), [list.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [next, prev, onClose]);

  if (!list.length) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-juniper/95 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-5 right-5 text-sand/80 hover:text-white p-2" onClick={onClose}><X className="w-8 h-8" /></button>
      <button className="absolute left-3 sm:left-6 text-sand/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); prev(); }}><ChevronLeft className="w-8 h-8" /></button>
      <div className="max-w-5xl w-full px-12 sm:px-20" onClick={(e) => e.stopPropagation()}>
        <img src={list[i]} alt="Amyanta gallery" className="w-full max-h-[80vh] object-contain mx-auto rounded-lg" />
        {list.length > 1 && (
          <div className="text-center text-sand/60 text-sm mt-4">{i + 1} / {list.length}</div>
        )}
      </div>
      <button className="absolute right-3 sm:right-6 text-sand/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); next(); }}><ChevronRight className="w-8 h-8" /></button>
    </div>
  );
}