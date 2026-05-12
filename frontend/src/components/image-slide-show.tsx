"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const images = [
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    alt: "Modern architecture",
    caption: "Streamlined permit approvals for modern construction",
  },
  {
    src: "https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&q=80&w=1200",
    alt: "Urban planning",
    caption: "Connecting architects, citizens, and authorities",
  },
  {
    src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
    alt: "Government collaboration",
    caption: "Transparent digital administration across Morocco",
  },
  {
    src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200",
    alt: "Construction site",
    caption: "From blueprint to building permit — fully digital",
  },
];

export function ImageSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [displayedIndex, setDisplayedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = images.map((_, i) => i).filter((i) => i !== current);
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      goTo(next);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  function goTo(i: number) {
    if (i === current) return;
    setPrev(current);
    setTransitioning(true);
    setCurrent(i);
    setDisplayedIndex(i);
    setTimeout(() => {
      setPrev(null);
      setTransitioning(false);
    }, 800);
  }

  return (
    <div className="relative hidden h-full w-full overflow-hidden lg:block">
      {/* Previous image — fades out */}
      {prev !== null && (
        <Image
          src={images[prev].src}
          alt={images[prev].alt}
          fill
          sizes="50vw"
          className="object-cover grayscale transition-opacity duration-700 opacity-0"
        />
      )}

      {/* Current image — fades in */}
      <Image
        src={images[current].src}
        alt={images[current].alt}
        fill
        sizes="50vw"
        className="object-cover grayscale transition-opacity duration-700 opacity-100"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Caption */}
      <div className="absolute bottom-10 left-8 right-8 z-10">
        <p className="text-lg font-medium text-white leading-snug">
          {images[displayedIndex].caption}
        </p>
        <div className="mt-4 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
