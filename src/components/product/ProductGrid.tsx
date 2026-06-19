import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { ProductItem } from "@/types";

interface Props {
  products?: ProductItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const colsMap = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
};

export default function ProductGrid({ products = [], isLoading = false, skeletonCount = 10, columns = 5 }: Props) {
  return (
    <div className={`grid ${colsMap[columns]} gap-3 md:gap-4`}>
      {isLoading
        ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
