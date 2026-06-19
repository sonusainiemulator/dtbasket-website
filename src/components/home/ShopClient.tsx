"use client";
import { useState } from "react";
import { useTopRatingItems } from "@/hooks/useApi";
import ProductGrid from "@/components/product/ProductGrid";

export default function ShopClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTopRatingItems(page);
  const products = data?.result ?? [];

  return (
    <div>
      <h1 className="section-title mb-6">Shop</h1>
      <ProductGrid products={products} isLoading={isLoading} columns={5} skeletonCount={20} />
      {data?.more_page && (
        <div className="flex justify-center mt-8">
          <button onClick={() => setPage((p) => p + 1)} className="btn-primary text-sm">Load More</button>
        </div>
      )}
    </div>
  );
}
