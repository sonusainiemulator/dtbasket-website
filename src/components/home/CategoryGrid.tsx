"use client";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useApi";
import { TEXT, IMAGES } from "@/branding";
import { Category } from "@/types";

/* ── Single card — large square image + label below, matching screenshot ── */
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.id}/0`}
      className="group flex flex-col items-center gap-2 cursor-pointer">

      {/* Square image box — light warm bg, rounded corners, subtle shadow */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FFF8F0] dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
        <Image
          src={category.image || IMAGES.placeholder}
          alt={category.name}
          fill
          className="object-contain p-3"
          sizes="(max-width:640px) 25vw, (max-width:1024px) 12vw, 110px"
        />
      </div>

      {/* Category name */}
      <span className="text-xs font-semibold text-gray-700 dark:text-dm-muted text-center group-hover:text-primary-700 transition-colors line-clamp-2 leading-tight w-full px-1">
        {category.name}
      </span>
    </Link>
  );
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="skeleton w-full aspect-square rounded-2xl" />
      <div className="skeleton h-3 w-3/4 rounded mx-auto" />
    </div>
  );
}

export default function CategoryGrid() {
  const { data, isLoading } = useCategories(0, 1);
  const categories: Category[] = data?.result ?? [];

  return (
    <section className=" p-5 pb-6">
      {/* Centered heading — no "See All" link, matching screenshot */}
      <h2 className="text-xl font-black text-gray-800 dark:text-dm-text text-center mb-6" style={{ fontFamily: "var(--font-poppins)" }}>
        {TEXT.home.exploreCategories}
      </h2>

      {/* 9 columns on large, scales down — matches 9-per-row in screenshot */}
      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-x-2 gap-y-5">
        {isLoading
          ? Array.from({ length: 18 }).map((_, i) => <CategorySkeleton key={i} />)
          : categories.map(cat => <CategoryCard key={cat.id} category={cat} />)}
      </div>
    </section>
  );
}