"use client";
import { useRef } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { useItemsByCategory, useSectionDetails } from "@/hooks/useApi";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  sectionId?: number;           // use section_id from API
  categoryId?: number;          // or use category_id
  bgColor?: string;
  seeAllHref?: string;
}

export default function ProductSection({ title, sectionId, categoryId, bgColor, seeAllHref }: Props) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Prefer section detail if sectionId provided, else items by category
  const sectionQuery = useSectionDetails(sectionId ?? 0, 1);
  const categoryQuery = useItemsByCategory(categoryId ?? 0, 0, 1);

  const query = sectionId ? sectionQuery : categoryQuery;
  const products = query.data?.result ?? [];
  const isLoading = query.isLoading;

  return (
    <section className={cn("rounded-xl shadow-card p-4 sm:p-5", bgColor || "bg-white dark:bg-dm-surface")}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <Link href={seeAllHref} className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors mr-2">
              See All →
            </Link>
          )}
          <button ref={prevRef} className="w-7 h-7 border border-gray-200 dark:border-dm-border rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors disabled:opacity-40" aria-label="Previous">
            <FiChevronLeft size={14} />
          </button>
          <button ref={nextRef} className="w-7 h-7 border border-gray-200 dark:border-dm-border rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors disabled:opacity-40" aria-label="Next">
            <FiChevronRight size={14} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-dm-muted py-8 text-sm">No products found.</p>
      ) : (
        <Swiper
          modules={[Navigation, FreeMode]}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          freeMode
          slidesPerView={2}
          spaceBetween={12}
          breakpoints={{ 480: { slidesPerView: 3 }, 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 }, 1280: { slidesPerView: 6 } }}
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="h-auto">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
