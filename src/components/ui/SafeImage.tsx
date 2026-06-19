"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type SafeImageProps = ImageProps;

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 rounded overflow-hidden ${className ?? ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M4.5 6h15M4.5 18h15"
          />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}