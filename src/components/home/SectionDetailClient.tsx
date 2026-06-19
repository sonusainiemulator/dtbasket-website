"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronRight, FiHeart } from "react-icons/fi";
import { useSectionDetails, useHomeSections } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { ProductItem } from "@/types";
import { COLORS, IMAGES } from "@/branding";


interface Props { sectionId: string, typeId: string }

/* ══════════════════════════════════════════════════════════════════════════════
   PORTRAIT CARD  (potrait_item layout)
   Same card as HomeSectionsClient PortraitProductCard
══════════════════════════════════════════════════════════════════════════════ */
function PortraitCard({ product }: { product: ProductItem }) {
  const { addItem, updateQuantity, cart } = useCartStore();
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const cartItems = cart.items;
  const { isAuthenticated, openModal } = useAuthStore();

  const cartItem = cartItems.find(i => i.product_id === product.id);
  const cartQty = cartItem?.quantity ?? 0;
  const salePrice = product.final_price ?? product.price;
  const hasDisc = product.price > 0 && salePrice < product.price;
  const discAmt = hasDisc ? Math.round(product.price - salePrice) : 0;
  const inStock = product.enable_stock === 0 || product.total_stock > 0;
  const tag = product.sub_category_name || product.category_name || "";
  const rating = parseFloat(product.avg_rating ?? "0");
  const unitLabel = product.per_unit > 1
    ? `${product.per_unit} ${product.unit}`
    : product.unit ? `1 pack (${product.unit})` : "";
  const inWishlist = wishlistItems.some(p => p.id === product.id);

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleAdd = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } addItem(product, 1); };
  const handleInc = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty + 1); };
  const handleDec = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty - 1); };
  const handleWish = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } toggleItem(product); };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-dm-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden h-full">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-dm-surface2 rounded-t-2xl overflow-hidden">
          <Image
            src={product.portrait_img || product.landscape_img || IMAGES.placeholder}
            alt={product.name} fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 200px"
          />
          {/* Wishlist heart — top right */}
          <button onClick={handleWish} aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white dark:bg-dm-surface shadow-sm flex items-center justify-center transition-all hover:scale-110 z-10">
            <FiHeart size={13} className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-dm-muted"} />
          </button>
          <div className="absolute bottom-2.5 right-2.5" onClick={stop}>
            {inStock ? (
              cartQty === 0 ? (
                <button onClick={handleAdd}
                  className="bg-white dark:bg-dm-surface text-primary-700 font-black text-sm px-4 py-1.5 rounded-xl shadow-sm hover:bg-primary-700 hover:text-white transition-all"
                  style={{ border: `2px solid ${COLORS.primary[700]}` }}>
                  ADD
                </button>
              ) : (
                <div className="flex items-center rounded-xl overflow-hidden shadow-sm"
                  style={{ backgroundColor: COLORS.primary[700], border: `2px solid ${COLORS.primary[700]}` }}>
                  <button onClick={handleDec} className="w-8 h-8 flex items-center justify-center text-white font-black text-base hover:bg-green-800">−</button>
                  <span className="w-7 text-center text-white text-sm font-black">{cartQty}</span>
                  <button onClick={handleInc} className="w-8 h-8 flex items-center justify-center text-white font-black text-base hover:bg-green-800">+</button>
                </div>
              )
            ) : (
              <span className="bg-gray-100 dark:bg-dm-surface2 text-gray-400 dark:text-dm-muted text-xs font-bold px-3 py-1.5 rounded-xl">Sold Out</span>
            )}
          </div>
        </div>
        {/* Info */}
        <div className="px-2.5 pt-2.5 pb-3 space-y-1">
          <span className="inline-flex items-center text-white text-sm font-black px-2.5 py-1 rounded-lg leading-none
            bg-primary shadow-[4px_4px_0px_black]">₹{salePrice}</span>
          {discAmt > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-primary-700">₹{discAmt} OFF</span>
              <span className="text-xs text-gray-400 dark:text-dm-muted line-through">₹{product.price}</span>
            </div>
          )}
          <p className="text-sm font-semibold text-gray-900 dark:text-dm-text line-clamp-2 leading-snug">{product.name}</p>
          {unitLabel && <p className="text-xs text-gray-400 dark:text-dm-muted">{unitLabel}</p>}
          {tag && <p className="text-xs font-medium text-primary-800">{tag}</p>}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-primary-700">★</span>
              <span className="text-xs text-gray-500 dark:text-dm-muted font-medium">
                {rating.toFixed(1)}
                {product.total_reviews > 0 && (
                  <span className="text-gray-400 dark:text-dm-muted font-normal">
                    {" "}({product.total_reviews >= 1000
                      ? `${(product.total_reviews / 1000).toFixed(1)}k`
                      : product.total_reviews})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link >
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CATEGORY GRID CARD  (category_grid layout)
   2×2 sub_cat images + category name
══════════════════════════════════════════════════════════════════════════════ */
function CategoryGridCard({ item }: { item: ProductItem }) {
  const subs = item.sub_cat ?? [];
  const slots = [...subs.slice(0, 4)];
  while (slots.length < 4) slots.push({ id: -slots.length, name: "", image: "" });
  const catImage = item.image;

  return (
    <Link href={`/categories/${item.id || item.category_id}/0`} className="group block">
      <div className="bg-white dark:bg-dm-surface rounded-xl border border-gray-100 dark:border-dm-border overflow-hidden group-hover:shadow-md group-hover:border-primary-200 transition-all duration-200">
        <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-dm-border">
          {slots.map((sub, i) => (
            <div key={`${sub.id}-${i}`} className="relative aspect-square bg-white dark:bg-dm-surface overflow-hidden">
              {sub.image ? (
                <Image src={sub.image} alt={sub.name} fill
                  className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-200"
                  sizes="80px" />
              ) : catImage && i === 0 ? (
                <Image src={catImage} alt={item.name} fill className="object-contain p-1.5" sizes="80px" />
              ) : (
                <div className="w-full h-full bg-gray-50" />
              )}
            </div>
          ))}
        </div>
        <div className="px-2 py-2.5 text-center">
          <p className="text-xs font-semibold text-gray-800 dark:text-dm-text leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
            {item.name}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CATEGORY LIST CARD  (category_list layout)
   Circular image + name
══════════════════════════════════════════════════════════════════════════════ */
function CategoryListCard({ item }: { item: ProductItem }) {
  const catImage = item.image;
  const href = `/categories/${item.id || item.category_id}/0`;

  return (
    <Link href={href} className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-primary-50 dark:hover:bg-dm-surface2 transition-all">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 dark:border-dm-border bg-white dark:bg-dm-surface shadow-sm group-hover:border-primary-300 group-hover:scale-105 transition-all">
        <Image
          src={catImage || item.portrait_img || IMAGES.placeholder}
          alt={item.name} fill
          className="object-contain p-1.5"
          sizes="64px"
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-dm-text text-center leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
        {item.name}
      </span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function SectionDetailClient({ sectionId, typeId }: Props) {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<ProductItem[]>([]);
  const prevId = useRef(sectionId);
  console.log("Section ID:", sectionId);
  console.log("Type ID:", typeId);
  console.log("Current Page:", page);
  const { data, isLoading, isFetching } = useSectionDetails(sectionId, page);
  console.log("Section Details API Response:", data);
  const newItems = data?.result ?? [];
  const hasMore = data?.more_page ?? false;
  const totalRows = data?.total_rows ?? 0;
  console.log("New Items:", newItems);
  console.log("Has More:", hasMore);
  console.log("Total Rows:", totalRows);
  /* Get section meta from home sections */
  const { data: sectionsData } = useHomeSections(1, typeId == null || typeId == "0" ? 1 : 2, Number(typeId == null ? "0" : typeId));
  console.log("Home Sections API:", sectionsData);
  const section = sectionsData?.result?.find(s => String(s.id) === sectionId);
  console.log("Matched Section:", section);
  const title = section?.title ?? "Products";
  const layout = (section?.screen_layout ?? "potrait_item").toLowerCase().replace(/\s+/g, "");
  console.log("Section Title:", title);
  console.log("Section Layout:", layout);
  /* Reset on sectionId change */
  useEffect(() => {
    if (prevId.current !== sectionId) {
      prevId.current = sectionId;
      setPage(1);
      setAllItems([]);
    }
  }, [sectionId]);

  /* Accumulate pages — append, never replace */
  useEffect(() => {
    if (newItems.length === 0) return;
    if (page === 1) {
      setAllItems(newItems);
    } else {
      setAllItems(prev => {
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...newItems.filter(p => !ids.has(p.id))];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* Grid class per layout */
  const gridClass =
    layout === "category_grid"
      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      : layout === "category_list"
        ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3"
        : /* potrait_item */
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";

  /* Card renderer per layout */
  const renderCard = (item: ProductItem) => {
    if (layout === "category_grid") return <CategoryGridCard key={item.id} item={item} />;
    if (layout === "category_list") return <CategoryListCard key={item.id} item={item} />;
    return <PortraitCard key={item.id} product={item} />;
  };

  /* Skeleton per layout */
  const renderSkeleton = (i: number) => {
    if (layout === "category_grid") {
      return (
        <div key={i} className="bg-white dark:bg-dm-surface rounded-xl border border-gray-100 dark:border-dm-border overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-dm-border">
            {Array.from({ length: 4 }).map((_, j) => <div key={j} className="skeleton aspect-square" />)}
          </div>
          <div className="p-2"><div className="skeleton h-3 w-3/4 mx-auto rounded" /></div>
        </div>
      );
    }
    if (layout === "category_list") {
      return (
        <div key={i} className="flex flex-col items-center gap-2 p-3">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="skeleton h-3 w-14 rounded" />
        </div>
      );
    }
    return <ProductCardSkeleton key={i} />;
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-dm-muted mb-5">
        <Link href="/" className="hover:text-primary-700 transition-colors">Home</Link>
        <FiChevronRight size={11} className="text-gray-400 dark:text-dm-muted" />
        <span className="text-gray-800 dark:text-dm-text font-semibold">{title}</span>
      </nav>

      {/* Title + count */}
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-900 dark:text-dm-text">{title}</h1>
        {!isLoading && totalRows > 0 && (
          <p className="text-sm text-gray-400 dark:text-dm-muted mt-0.5">
            {allItems.length} of {totalRows} products
          </p>
        )}
      </div>

      {/* First page skeleton */}
      {isLoading && page === 1 ? (
        <div className={gridClass}>
          {Array.from({ length: 10 }).map((_, i) => renderSkeleton(i))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dm-surface rounded-xl border border-gray-100 dark:border-dm-border">
          <p className="text-gray-400 dark:text-dm-muted text-sm">No products found in this section.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-primary-700 hover:underline">
            ← Back to Home
          </Link>
        </div>
      ) : (
        <>
          <div className={gridClass}>
            {allItems.map(item => renderCard(item))}
            {isFetching && page > 1 &&
              Array.from({ length: 5 }).map((_, i) => renderSkeleton(i + 100))
            }
          </div>

          {hasMore && !isFetching && (
            <div className="flex justify-center mt-8">
              <button onClick={() => setPage(p => p + 1)}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all
                bg-primary ">
                Load More
              </button>
            </div>
          )}

          {isFetching && page > 1 && (
            <div className="flex justify-center mt-6">
              <div className="w-6 h-6 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )
      }
    </div >
  );
}