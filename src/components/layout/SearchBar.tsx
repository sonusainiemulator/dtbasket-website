"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { useSearch } from "@/hooks/useSearch";
import { IMAGES, CONFIG } from "@/branding";

export default function SearchBar() {
  const router = useRouter();
  const { query, results, isLoading, isOpen, setIsOpen, handleChange, clearSearch } = useSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setIsOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      clearSearch();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex h-10">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search for products, categories"
          className="flex-1 px-4 text-sm border border-gray-200 dark:border-dm-border rounded-l-lg focus:outline-none focus:border-gray-300 bg-white dark:bg-dm-surface2 dark:text-dm-text placeholder-gray-400 dark:placeholder-dm-muted min-w-0"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-5 font-bold text-sm text-gray-900 rounded-r-lg flex-shrink-0 transition-opacity hover:opacity-90 bg-secondary"
        >
          Search <FiSearch size={15} />
        </button>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-dm-surface rounded-xl shadow-xl border border-gray-100 dark:border-dm-border z-50 max-h-80 overflow-y-auto scrollbar-thin animate-slide-down">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-11 h-11 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 py-1">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-1.5">
                {results.slice(0, CONFIG.searchSuggestLimit).map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} onClick={clearSearch}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors group">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-50 dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border flex-shrink-0">
                      <Image src={product.portrait_img || IMAGES.placeholder} alt={product.name} fill className="object-contain" sizes="44px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-primary-700">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.unit}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary-700">₹{product.price}</p>

                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-dm-border">
                <button onClick={() => { router.push(`/search?q=${encodeURIComponent(query)}`); clearSearch(); }}
                  className="w-full text-center text-sm text-primary-700 font-semibold hover:text-primary-800 py-1">
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-400 text-sm">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
