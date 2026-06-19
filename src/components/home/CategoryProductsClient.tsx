"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronRight } from "react-icons/fi";
import { useItemsByCategory, useCategories } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { ProductItem, Category } from "@/types";
import { IMAGES, TEXT } from "@/branding";
import { cn } from "@/lib/utils";

/* ── Product card ─────────────────────────────────────────────────────────── */
function CategoryProductCard({ product }: { product: ProductItem }) {
  const [imgErr, setImgErr] = useState(false);
  const { addItem, updateQuantity, cart } = useCartStore();
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const cartItems = cart.items;
  const { isAuthenticated, openModal } = useAuthStore();

  const cartItem = cartItems.find(i => i.product_id === product.id);
  const cartQty = cartItem?.quantity ?? 0;
  const salePrice = product.final_price ?? product.price;
  const hasDisc = salePrice < product.price && product.price > 0;
  const discAmt = hasDisc ? Math.round(product.price - salePrice) : 0;
  const thumb = imgErr ? IMAGES.placeholder : (product.portrait_img || product.landscape_img || IMAGES.placeholder);
  const inStock = product.enable_stock === 0 || product.total_stock > 0;
  const isFresh = product.stock_name?.toLowerCase().includes("fresh");
  const inWishlist = wishlistItems.some(p => p.id === product.id);

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleAdd = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } addItem(product, 1); };
  const handleInc = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty + 1); };
  const handleDec = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty - 1); };
  const handleWish = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } toggleItem(product); };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white dark:bg-dm-surface rounded-lg overflow-hidden border border-gray-100 dark:border-dm-border hover:border-gray-200 dark:hover:border-dm-border hover:shadow-md transition-all duration-200">

        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-dm-surface2" >

          <Image
            src={thumb}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 160px"
            onError={() => setImgErr(true)}
          />


          {/* Wishlist heart */}
          <button onClick={handleWish}
            aria-label={inWishlist ? TEXT.product.removeFromWishlist : TEXT.product.addToWishlist}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white dark:bg-dm-surface shadow-sm flex items-center justify-center transition-all hover:scale-110 z-10">
            <span className={`text-sm ${inWishlist ? "text-red-500" : "text-gray-400 dark:text-dm-muted"}`}>
              {inWishlist ? "♥" : "♡"}
            </span>
          </button>

          {/* ADD / stepper */}
          <div className="absolute bottom-2 right-2" onClick={stop}>
            {inStock ? (
              cartQty === 0 ? (
                <button onClick={handleAdd}
                  className="bg-white dark:bg-dm-surface border border-gray-200 dark:border-dm-border text-primary-700 font-bold text-xs px-3 py-1.5 rounded-md shadow-sm hover:bg-primary-700 hover:text-white hover:border-primary-700 transition-all">
                  {TEXT.product.add}
                </button>
              ) : (
                <div className="flex items-center bg-primary-700 rounded-md overflow-hidden shadow-sm">
                  <button onClick={handleDec} className="w-7 h-7 flex items-center justify-center text-white hover:bg-primary-800 text-base font-bold">−</button>
                  <span className="w-7 text-center text-white text-xs font-black">{cartQty}</span>
                  <button onClick={handleInc} className="w-7 h-7 flex items-center justify-center text-white hover:bg-primary-800 text-base font-bold">+</button>
                </div>
              )
            ) : (
              <button onClick={stop}
                className="bg-white dark:bg-dm-surface border border-gray-200 dark:border-dm-border text-gray-400 dark:text-dm-muted font-bold text-xs px-2 py-1.5 rounded-md shadow-sm cursor-not-allowed">
                {TEXT.product.notify}
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-2 pb-2.5">
          <div className="flex items-baseline gap-1.5 mb-0.5">
            <span className="inline-flex items-center text-white text-sm font-black px-2.5 py-1 mb-2 rounded-lg leading-none
            bg-primary shadow-[4px_4px_0px_black]">₹{salePrice}</span>
            {hasDisc && <span className="text-xs text-gray-400 dark:text-dm-muted line-through">₹{product.price}</span>}
          </div>
          {discAmt > 0 && (
            <p className="text-[10px] font-bold text-primary-700 mb-0.5">
              ₹{discAmt} {TEXT.product.off}
            </p>
          )}
          <h3 className="text-xs font-semibold text-gray-800 dark:text-dm-text line-clamp-1 leading-snug">{product.name}</h3>
          {product.unit && <p className="text-[10px] text-gray-400 dark:text-dm-muted mt-0.5">{product.per_unit}{product.unit}</p>}
          {isFresh && <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{TEXT.product.fresh}</span>}
          {!inStock && <span className="inline-block mt-1 text-[10px] font-bold text-gray-400 dark:text-dm-muted bg-gray-100 dark:bg-dm-surface2 px-1.5 py-0.5 rounded">{TEXT.product.soldOut}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ── Sidebar item ─────────────────────────────────────────────────────────── */
function SidebarItem({ label, image, active, onClick }: {
  label: string; image?: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-2.5 pl-3 pr-3 text-left transition-all relative",
        active ? "bg-green-50 font-bold text-gray-900" : "bg-white dark:bg-dm-surface hover:bg-gray-50 dark:hover:bg-dm-surface2 text-gray-700 dark:text-dm-muted font-medium"
      )}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm bg-primary " />}
      {image ? (
        <div className={cn("relative flex-shrink-0 rounded-full overflow-hidden border",
          active ? "w-10 h-10 border-primary-200" : "w-9 h-9 border-gray-200")}>
          <Image src={image} alt={label} fill className="object-cover" sizes="40px" />
        </div>
      ) : (
        <div className={cn("flex-shrink-0 rounded-full bg-gray-200 dark:bg-dm-surface2 flex items-center justify-center",
          active ? "w-10 h-10" : "w-9 h-9")}>
          <span className="text-xs font-bold text-gray-500 dark:text-dm-muted">{label[0]}</span>
        </div>
      )}
      <span className="text-sm line-clamp-1 leading-tight">{label}</span>
    </button>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
interface Props { categoryId: string; initialSubCatId?: number }

export default function CategoryProductsClient({ categoryId, initialSubCatId = 0 }: Props) {
  const [subCatId, setSubCatId] = useState<number>(initialSubCatId);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const prevSubCat = useRef<number>(initialSubCatId);

  const { data: allCats } = useCategories(0, 1);
  const allCategories: Category[] = allCats?.result ?? [];
  const activeCategory = allCategories.find(s => String(s.id) === categoryId);

  const { data: catData } = useCategories(categoryId, 1);
  const subCategories = catData?.result ?? [];

  const { data, isLoading } = useItemsByCategory(categoryId, subCatId, page);

  /* Accumulate results — replace on filter change, append on load more */
  useEffect(() => {
    const incoming = data?.result ?? [];
    setHasMore(!!data?.more_page);
    if (subCatId !== prevSubCat.current || page === 1) {
      setAllProducts(incoming);
      prevSubCat.current = subCatId;
    } else {
      setAllProducts(prev => {
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...incoming.filter(p => !ids.has(p.id))];
      });
    }
    setIsAppending(false);
  }, [data]);

  const handleSubCat = (id: number) => {
    setSubCatId(id);
    setPage(1);
    setAllProducts([]);
  };

  const handleLoadMore = () => {
    setIsAppending(true);
    setPage(p => p + 1);
  };

  const activeSubName = subCatId === 0
    ? TEXT.category.allLabel
    : (subCategories.find(s => s.id === subCatId)?.name ?? TEXT.category.allLabel);

  const sidebarHasSubs = subCategories.length > 0;

  return (
    <div className=" min-h-screen">

      {/* Breadcrumb */}
      <div className="container-custom pt-4 pb-2">
        <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-dm-muted">
          <Link href="/" className="hover:text-primary-700 transition-colors">{TEXT.category.breadcrumbHome}</Link>
          <FiChevronRight size={11} className="text-gray-400 dark:text-dm-muted" />
          <Link href="/categories" className="hover:text-primary-700 transition-colors">
            {activeCategory?.name ?? TEXT.category.breadcrumbCategories}
          </Link>
          <FiChevronRight size={11} className="text-gray-400 dark:text-dm-muted" />
          <span className="text-gray-800 dark:text-dm-text font-semibold">{activeSubName}</span>
        </nav>
      </div>

      <div className="container-custom pb-10 flex gap-5 items-start">

        {/* Sidebar */}
        {sidebarHasSubs && (<aside className="w-48 flex-shrink-0 hidden md:block sticky top-24 self-start">
          <div className="bg-white dark:bg-dm-surface rounded-xl border border-gray-100 dark:border-dm-border overflow-hidden shadow-sm">

            <>
              <SidebarItem
                label={TEXT.category.allLabel}
                image={activeCategory?.image}
                active={subCatId === 0}
                onClick={() => handleSubCat(0)}
              />
              {subCategories.map(sub => (
                <SidebarItem key={sub.id} label={sub.name} image={sub.image}
                  active={subCatId === sub.id}
                  onClick={() => handleSubCat(sub.id)} />
              ))}
            </>

          </div>
        </aside>)}

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Title + count */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-gray-900 dark:text-dm-text">{activeSubName}</h1>
            {!isLoading && data?.total_rows != null && (
              <span className="text-xs text-gray-400 dark:text-dm-muted">{data.total_rows} {TEXT.category.productsCount}</span>
            )}
          </div>

          {/* Mobile chips */}
          {sidebarHasSubs && (
            <div className="flex gap-2 flex-wrap mb-4 md:hidden">
              <button onClick={() => handleSubCat(0)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  subCatId === 0 ? "bg-primary-700 text-white border-primary-700" : "bg-white dark:bg-dm-surface border-gray-200 dark:border-dm-border text-gray-600 dark:text-dm-muted")}>
                {TEXT.category.allLabel}
              </button>
              {subCategories.map(sub => (
                <button key={sub.id} onClick={() => handleSubCat(sub.id)}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    subCatId === sub.id ? "bg-primary-700 text-white border-primary-700" : "bg-white dark:bg-dm-surface border-gray-200 dark:border-dm-border text-gray-600 dark:text-dm-muted")}>
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {isLoading && allProducts.length === 0 ? (
            /* Full skeleton — only on first load or sub-cat change */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9 gap-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-dm-surface rounded-lg overflow-hidden border border-gray-100 dark:border-dm-border">
                  <div className="skeleton aspect-square" />
                  <div className="p-2 space-y-1.5">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-dm-surface2 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <h2 className="text-lg font-bold text-gray-700 dark:text-dm-muted mb-2">{TEXT.category.noProducts}</h2>
              <p className="text-gray-400 dark:text-dm-muted text-sm">{TEXT.category.noProductsSub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-9 gap-3">
              {allProducts.map(product => <CategoryProductCard key={product.id} product={product} />)}
            </div>
          )}

          {/* Load More — only spinner in button, no full skeleton */}
          {hasMore && allProducts.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={isAppending}
                className="flex items-center gap-2 px-8 py-2.5 rounded-full border-2 border-primary-700 text-primary-700 text-sm font-bold hover:bg-primary-50 transition-colors disabled:opacity-50">
                {isAppending
                  ? <span className="w-4 h-4 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                  : TEXT.pagination.loadMore
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}