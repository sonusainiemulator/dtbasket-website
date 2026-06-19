"use client";
import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/hooks/useApi";
import { IMAGES } from "@/branding";

export default function CategoryPageClient() {
  const { data, isLoading } = useCategories(0, 1);
  const categories = data?.result ?? [];

  return (
    <div>
      <h1 className="section-title mb-6">All Categories</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => <div key={i} className="skeleton rounded-xl h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.id}/0`}
              className="group card p-4 flex flex-col items-center gap-3 text-center hover:border-primary-200 border-2 border-transparent transition-all">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border group-hover:scale-105 transition-transform">
                <Image src={cat.image || IMAGES.placeholder} alt={cat.name} fill className="object-contain p-2" sizes="80px" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-dm-text group-hover:text-primary-700 transition-colors line-clamp-2">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
