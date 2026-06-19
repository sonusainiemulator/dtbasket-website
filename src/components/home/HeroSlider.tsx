"use client";
import { useRef, useState } from "react";
import Image from "next/image";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { useHeroBanners } from "@/hooks/useApi";
import { IMAGES } from "@/branding";
import { DisplayBanner } from "@/services/bannerService";
import type { Swiper as SwiperType } from "swiper";

const fallbackBanners: DisplayBanner[] = IMAGES.heroBanners.map((b, i) => ({
  id: i + 1,
  item_id: 0,
  title: b.title,
  description: b.description,
  image: b.image,
  thumbnail: b.image,
  discount_amount: 0,
  button_text: b.button_text,
  button_link: b.button_link,
}));
type Props = {
  typeId?: string;
};
export default function HeroSlider({ typeId }: Props) {
  const { data, isLoading } = useHeroBanners(typeId == null ? "1" : "2", String(typeId == null ? "0" : typeId));
  const banners = data?.length ? data : fallbackBanners;
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);

  if (isLoading) return <div className="skeleton w-full aspect-[3/1] min-h-[240px] rounded-xl" />;
  if (!data?.length) return null;
  return (
    <>
      {data?.length && (<div className="relative group flex items-center gap-2">

        {/* ← Outside the banner, left */}
        <button onClick={() => swiperRef?.slidePrev()} aria-label="Previous"
          className="flex-shrink-0 w-9 h-9 bg-white dark:bg-dm-surface hover:bg-gray-50 dark:hover:bg-dm-surface2 border border-gray-200 dark:border-dm-border rounded-full shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:shadow-md">
          <FiChevronLeft size={18} className="text-gray-700 dark:text-dm-text" />
        </button>

        {/* Banner */}
        <div className="flex-1 min-w-0 rounded-xl overflow-hidden shadow-card">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop effect="fade"
            onSwiper={setSwiperRef}
          // onBeforeInit={(swiper) => {
          //   if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
          //     swiper.params.navigation.prevEl = prevRef.current;
          //     swiper.params.navigation.nextEl = nextRef.current;
          //   }
          // }}
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full aspect-[3/1] min-h-[220px] bg-gradient-to-r from-green-50 to-green-100">
                  <Image src={banner.image} alt={banner.title} fill className="object-fill" priority sizes="100vw" />
                  {(banner.title || banner.button_text) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
                  )}

                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* → Outside the banner, right */}
        <button onClick={() => swiperRef?.slideNext()} aria-label="Next"
          className="flex-shrink-0 w-9 h-9 bg-white dark:bg-dm-surface hover:bg-gray-50 dark:hover:bg-dm-surface2 border border-gray-200 dark:border-dm-border rounded-full shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:shadow-md">
          <FiChevronRight size={18} className="text-gray-700 dark:text-dm-text" />
        </button>

      </div>)}
    </>
  );
}