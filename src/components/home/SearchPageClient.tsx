"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useSearchItems } from "@/hooks/useApi";
import ProductCard from "@/components/product/ProductCard";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { ProductItem } from "@/types";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<ProductItem[]>([]);
  const prevQuery = useRef(query);

  const { data, isLoading, isFetching } = useSearchItems(query, page);
  const newItems = data?.result ?? [];
  const hasMore = data?.more_page ?? false;
  const totalRows = data?.total_rows ?? 0;

  /* Reset accumulated list whenever the search query changes */
  useEffect(() => {
    if (prevQuery.current !== query) {
      prevQuery.current = query;
      setPage(1);
      setAllItems([]);
    }
  }, [query]);

  /* Append new page results to accumulated list */
  useEffect(() => {
    if (newItems.length === 0) return;
    if (page === 1) {
      /* Fresh search — replace everything */
      setAllItems(newItems);
    } else {
      /* Load more — append, de-duplicate by id */
      setAllItems(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const fresh = newItems.filter(p => !existingIds.has(p.id));
        return [...prev, ...fresh];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleLoadMore = () => setPage(p => p + 1);

  /* No query entered */
  if (!query) {
    return (
      <div className="text-center py-16">
        <FiSearch size={48} className="mx-auto text-gray-200 dark:text-dm-muted mb-4" />
        <p className="text-gray-500 dark:text-dm-muted">Enter a search term to find products.</p>
      </div>
    );
  }

  /* Loading first page */
  if (isLoading && page === 1) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="section-title">Search results for &quot;{query}&quot;</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  /* No results */
  if (!isLoading && allItems.length === 0) {
    return (
      <div className="text-center py-16">
        <FiSearch size={48} className="mx-auto text-gray-200 dark:text-dm-muted mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-dm-muted mb-2">No products found</h2>
        <p className="text-gray-400 dark:text-dm-muted text-sm">Try different keywords or browse our categories.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="section-title">Search results for &quot;{query}&quot;</h1>
        <p className="text-sm text-gray-400 dark:text-dm-muted mt-1">
          {allItems.length} of {totalRows} products
        </p>
      </div>

      {/* Product grid — accumulated items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {allItems.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}

        {/* Skeleton cards appended at bottom while loading more */}
        {isFetching && page > 1 &&
          Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)
        }
      </div>

      {/* Load More button */}
      {hasMore && !isFetching && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90
            bg-primary ">
            Load More
          </button>
        </div>
      )
      }

      {/* Loading spinner for load more */}
      {
        isFetching && page > 1 && (
          <div className="flex justify-center mt-6">
            <div className="w-6 h-6 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }
    </div >
  );
}