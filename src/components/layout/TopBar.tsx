"use client";
import Link from "next/link";

import { TEXT } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import Image from "next/image";

export default function TopBar() {
  const { socialLinks } = useAppSettings();
  return (
    <div className="hidden md:block text-white text-xs py-2 bg-primary-700 dark:bg-dm-primary">
      <div className="container-custom flex items-center justify-between">

        {/* Left — nav links */}
        <div className="flex items-center gap-5">
          <Link href="/account" className="hover:text-green-200 transition-colors font-medium">{TEXT.nav.myAccount}</Link>
          <Link href="/wishlist" className="hover:text-green-200 transition-colors font-medium">{TEXT.nav.wishlist}</Link>
          <Link href="/account/orders" className="hover:text-green-200 transition-colors font-medium">{TEXT.nav.orderTracking}</Link>
        </div>

        {/* Center */}
        <p className="font-medium text-white/90 hidden md:block">
          {TEXT.topBar.welcome}
        </p>

        {/* Right — Follow Us + icons */}
        <div className="flex items-center gap-2.5">
          <span className="font-medium">{TEXT.nav.followUs}</span>
          {socialLinks.map((data) => (
            <a
              key={data.id}
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={data.name}
              className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Image
                src={data.image}
                alt={data.name}
                width={20}
                height={20}
                className="w-3 h-3 object-contain"
              />
            </a>
          ))}

        </div>
      </div>
    </div>
  );
}