import Link from "next/link";
import SafeImage from "./SafeImage";
import { IMAGES } from "@/branding";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

/**
 * BrandLogo — renders the DTBasket logo with
 * "DTBas" in black and "ket" in yellow (#F0C832).
 * Wrap in a Link to "/" by default.
 */
export default function BrandLogo({ size = "md", href = "/", className = "" }: Props) {
  const content = (
    <span className={`font-black font-display leading-none ${sizes[size]} ${className}`}>
      <SafeImage
        src={IMAGES.appLogo}
        alt="DTBasket logo"
        width={724}
        height={188}
        className="h-auto object-contain"
        priority
      />
    </span>
  );

  if (!href) return content;
  return <Link href={href} className="flex-shrink-0 flex items-center">{content}</Link>;
}
