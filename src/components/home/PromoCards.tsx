"use client";
import SafeImage from "@/components/ui/SafeImage";
import { IMAGES } from "@/branding";

export default function PromoBannerCards() {
  return (
    <div className="w-full rounded-2xl overflow-hidden">
      <SafeImage
        src={IMAGES.promoCard}
        alt="Promotional offers"
        width={6664}
        height={1600}
        className="w-full h-auto object-cover"
        priority
      />
    </div>
  );
}
