import React from "react";

interface Blob {
  className: string;
  radius: string;
  opacity: number;
}

/**
 * Solid organic backdrop shapes. Asymmetric border-radii give the pebble /
 * amoeba silhouettes from the reference; fills are flat (no blur).
 * Rendered behind the app content by App.tsx.
 */
const BLOBS: Blob[] = [
  {
    // large beige shape, bleeding off the left
    className: "absolute -left-40 -top-12 h-[100rem] w-[78rem] bg-[#EFE5D0]",
    radius: "42% 58% 63% 37% / 48% 43% 57% 52%",
    opacity: 0.35,
  },
  {
    // paler cream shape, top-right
    className: "absolute -right-32 -top-48 h-[70rem] w-[40rem] bg-[#F8F1E1]",
    radius: "55% 45% 40% 60% / 52% 60% 40% 48%",
    opacity: 0.3,
  },
  {
    // muted rose shape, bottom-right
    className: "absolute -bottom-32 right-8 h-[28rem] w-[28rem] bg-[#EADDD7]",
    radius: "60% 40% 55% 45% / 55% 60% 40% 45%",
    opacity: 0.35,
  },
];

export const BackdropBlobs: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    {BLOBS.map((blob, index) => (
      <div
        key={index}
        className={blob.className}
        style={{ borderRadius: blob.radius, opacity: blob.opacity }}
      />
    ))}
  </div>
);
