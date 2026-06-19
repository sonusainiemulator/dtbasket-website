"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import { useHomeSections } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton";
import { SectionResult, ProductItem } from "@/types";
import { COLORS, IMAGES, TEXT } from "@/branding";
import DeliveryFeatures from "./DeliveryFeatures";
import { useDarkModeContext } from "@/lib/darkModeContext";

/* ─── Padding that matches container-custom ─────────────────────────────────── */

type CategoryGridSectionProps = {
  section: SectionResult;
  typeId?: string;
};
/* ─── Section background helpers ────────────────────────────────────────────── */
function darkenColor(hex: string, amount = 0.4) {
  const color = hex.replace("#", "")

  let r = parseInt(color.substring(0, 2), 16)
  let g = parseInt(color.substring(2, 4), 16)
  let b = parseInt(color.substring(4, 6), 16)

  r = Math.floor(r * amount)
  g = Math.floor(g * amount)
  b = Math.floor(b * amount)

  return `rgb(${r}, ${g}, ${b})`
}

function getBgStyle(section: SectionResult, isDark: boolean): React.CSSProperties {
  const val = section.background_value
  if (!val || section.background_type !== "color") return {}
  const hex = val.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  // Skip near-black
  if (r < 30 && g < 30 && b < 30) return {}

  return {
    backgroundColor: isDark ? darkenColor(val, 0.4) : val,
  }
}
/* Renders a full-bleed bg image using CSS (works for live URLs) */
function SectionBgImage({ url }: { url: string }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `url("${url}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
      }}
    />
  );
}

/* Shared semi-transparent overlay for image backgrounds */
function BgOverlay() {
  return <div className="absolute inset-0 bg-white/75 dark:bg-black/60" style={{ zIndex: 1 }} />;
}

/* ─── Shared section title ───────────────────────────────────────────────────── */
function SectionHeader({ section, typeId }: CategoryGridSectionProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1" />
      <h2 className="text-xl font-black text-gray-900 dark:text-dm-text font-display text-center flex-1">
        {section.title}
      </h2>
      <div className="flex-1 flex justify-end">
        <Link href={`/sections/${section.id}/${typeId == null ? 0 : typeId}`}
          className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors whitespace-nowrap">
          {TEXT.home.seeAll}
        </Link>
      </div>
    </div>
  );
}

/* ─── Scroll arrows ──────────────────────────────────────────────────────────── */
const arrowCls = "absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white dark:bg-dm-surface border border-gray-200 dark:border-dm-border rounded-full shadow-md flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-all";

/* ══════════════════════════════════════════════════════════════════════════════
   1. PORTRAIT ITEM
══════════════════════════════════════════════════════════════════════════════ */
function PortraitProductCard({ product }: { product: ProductItem }) {
  const { addItem, updateQuantity, cart } = useCartStore();
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const cartItems = cart.items;
  const { isAuthenticated, openModal } = useAuthStore();

  const cartItem = cartItems.find(i => i.product_id === product.id);
  const cartQty = cartItem?.quantity ?? 0;
  const salePrice = product.final_price ?? product.price;
  const hasDisc = salePrice < product.price && product.price > 0;
  const discAmt = hasDisc ? Math.round(product.price - salePrice) : 0;
  const inStock = product.enable_stock === 0 || product.total_stock > 0;
  const tag = product.sub_category_name || product.category_name || "";
  const rating = parseFloat(product.avg_rating ?? "0");
  const inWishlist = wishlistItems.some(p => p.id === product.id);

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleAdd = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } addItem(product, 1); };
  const handleInc = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty + 1); };
  const handleDec = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty - 1); };
  const handleWish = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } toggleItem(product); };

  return (
    <Link href={`/products/${product.id}`} className="group block flex-shrink-0 w-40">
      <div className=" rounded-2xl  hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="relative aspect-square bg-gray-50 dark:bg-dm-surface2 rounded-2xl overflow-hidden">
          <Image src={product.portrait_img || product.landscape_img || IMAGES.placeholder}
            alt={product.name} fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="160px" />
          <button onClick={handleWish}
            aria-label={inWishlist ? TEXT.product.removeFromWishlist : TEXT.product.addToWishlist}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white dark:bg-dm-surface shadow-sm flex items-center justify-center transition-all hover:scale-110 z-10">
            <FiHeart size={13} className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"} />
          </button>
          <div className="absolute bottom-2.5 right-2.5" onClick={stop}>
            {inStock ? (
              cartQty === 0 ? (
                <button onClick={handleAdd}
                  className="bg-white dark:bg-dm-surface text-primary-700 font-black text-sm px-4 py-1.5 rounded-xl shadow-sm transition-all hover:bg-primary-700 hover:text-white"
                  style={{ border: `2px solid ${COLORS.primary[700]}` }}>
                  {TEXT.product.add}
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
              <span className="bg-gray-100 dark:bg-dm-surface2 text-gray-400 dark:text-dm-muted text-xs font-bold px-3 py-1.5 rounded-xl">{TEXT.product.soldOut}</span>
            )}
          </div>
        </div>
        <div className="px-2.5 pt-2.5 pb-3 space-y-1">

          <span className="inline-flex items-center text-white text-sm font-black px-2.5 py-1 rounded-lg leading-none
            bg-primary shadow-[4px_4px_0px_black]">₹{salePrice}</span>
          {discAmt > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-primary-700" >₹{discAmt} {TEXT.product.off}</span>
              <span className="text-xs text-gray-400 dark:text-dm-muted line-through">₹{product.price}</span>
            </div>
          )}
          <p className="text-sm font-semibold text-gray-900 dark:text-dm-text line-clamp-1 leading-snug">{product.name}</p>
          {product.unit && (
            <p className="text-xs text-gray-400 dark:text-dm-muted">
              {product.per_unit > 1 ? `${product.per_unit} ${product.unit}` : `1 pack (${product.unit})`}
            </p>
          )}
          {tag && (
            <div className="inline-block bg-gray-100 dark:bg-dm-surface2 rounded-md px-2 py-1">
              <p className="text-xs font-medium text-primary-800 dark:text-primary-300">
                {tag}
              </p>
            </div>
          )}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-primary-700">★</span>
              <span className="text-xs text-gray-500 dark:text-dm-muted font-medium">
                {rating.toFixed(1)}
                {product.total_reviews > 0 && (
                  <span className="text-gray-400 dark:text-dm-muted font-normal">
                    {" "}({product.total_reviews >= 1000 ? `${(product.total_reviews / 1000).toFixed(1)}k` : product.total_reviews})
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

function PortraitItemSection({ section, typeId }: CategoryGridSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = section.data ?? [];
  const { isDark } = useDarkModeContext();
  const bgStyle = getBgStyle(section, isDark);
  const hasBgImg = section.background_type === "image" && !!section.background_value;
  const hasBg = hasBgImg || Object.keys(bgStyle).length > 0;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  const content = (
    <section className="w-full py-5 relative" style={bgStyle}>
      {hasBgImg && <SectionBgImage url={section.background_value!} />}
      {hasBgImg && <BgOverlay />}
      {/* Header — constrained */}
      <div className={`container-custom relative mb-4`} style={{ zIndex: 2 }}>
        <SectionHeader section={section} typeId={typeId} />
      </div>
      {/* Scroll row — full width, padded to align with container */}
      <div className="container-custom relative group/scroll" style={{ zIndex: 2 }}>
        <button onClick={() => scroll("left")} aria-label="Scroll left" className={`${arrowCls} left-0`}>
          <FiChevronLeft size={16} className="text-gray-700 dark:text-dm-text" />
        </button>
        <div ref={scrollRef} className={` flex gap-3 overflow-x-auto pb-2 `} style={{ scrollbarWidth: "none" }}>
          {items.length === 0
            ? <p className="text-sm text-gray-400 py-4">{TEXT.category.noProducts}</p>
            : items.map(p => <PortraitProductCard key={p.id} product={p} />)
          }
        </div>
        <button onClick={() => scroll("right")} aria-label="Scroll right" className={`${arrowCls} right-0`}>
          <FiChevronRight size={16} className="text-gray-700 dark:text-dm-text" />
        </button>
      </div>
    </section>
  );

  /* With bg → full width. Without → keep inside container */
  return hasBg ? content : <div className="">{content}</div>;
}

/* ══════════════════════════════════════════════════════════════════════════════
   2. CATEGORY GRID
══════════════════════════════════════════════════════════════════════════════ */
function CategoryGridItem({ item }: { item: ProductItem }) {
  const subs = item.sub_cat ?? [];
  const slots = [...subs.slice(0, 4)];
  while (slots.length < 4) slots.push({ id: -slots.length, name: "", image: "" });

  return (
    <Link href={`/categories/${item.category_id || item.id}/0`} className="group block flex-shrink-0 w-40">
      <div className="rounded-xl overflow-hidden group-hover:shadow-md group-hover:border-primary-200 transition-all duration-200">
        <div className="rounded-xl grid grid-cols-2 gap-px bg-gray-100 dark:bg-dm-surface2">
          {slots.map((sub, i) => (
            <div key={`${sub.id}-${i}`} className="relative aspect-square bg-white dark:bg-dm-surface overflow-hidden">
              {sub.image ? (
                <Image src={sub.image} alt={sub.name} fill
                  className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-200" sizes="72px" />
              ) : item.image && i === 0 ? (
                <Image src={item.image} alt={item.name} fill className="object-contain p-1.5" sizes="72px" />
              ) : <div className="w-full h-full bg-gray-50 dark:bg-dm-surface2" />}
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

function CategoryGridSection({ section, typeId }: CategoryGridSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = section.data ?? [];
  const { isDark } = useDarkModeContext();
  const bgStyle = getBgStyle(section, isDark);
  const hasBgImg = section.background_type === "image" && !!section.background_value;
  const hasBg = hasBgImg || Object.keys(bgStyle).length > 0;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
  };

  const content = (
    <section className="w-full py-5 relative" style={bgStyle}>
      {hasBgImg && <SectionBgImage url={section.background_value!} />}
      {hasBgImg && <BgOverlay />}
      <div className={`container-custom relative  mb-4`} style={{ zIndex: 2 }}>
        <SectionHeader section={section} typeId={typeId} />
      </div>
      <div className=" container-custom relative group/scroll" style={{ zIndex: 2 }}>
        <button onClick={() => scroll("left")} aria-label="Scroll left" className={`${arrowCls} left-2`}>
          <FiChevronLeft size={16} className="text-gray-700 dark:text-dm-text" />
        </button>
        <div ref={scrollRef} className={`flex gap-5 overflow-x-auto pb-2 `} style={{ scrollbarWidth: "none" }}>
          {items.map(item => <CategoryGridItem key={item.id} item={item} />)}
        </div>
        <button onClick={() => scroll("right")} aria-label="Scroll right" className={`${arrowCls} right-2`}>
          <FiChevronRight size={16} className="text-gray-700 dark:text-dm-text" />
        </button>
      </div>
    </section>
  );

  return hasBg ? content : <div className="container-custom">{content}</div>;
}

/* ══════════════════════════════════════════════════════════════════════════════
   3. CATEGORY LIST
══════════════════════════════════════════════════════════════════════════════ */
function CategoryListSection({ section, typeId }: CategoryGridSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = section.data ?? [];
  const { isDark } = useDarkModeContext();
  const bgStyle = getBgStyle(section, isDark);
  const hasBgImg = section.background_type === "image" && !!section.background_value;
  const hasBg = hasBgImg || Object.keys(bgStyle).length > 0;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  const content = (
    <section className="w-full py-5 relative" style={bgStyle}>
      {hasBgImg && <SectionBgImage url={section.background_value!} />}
      {hasBgImg && <BgOverlay />}
      <div className={`container-custom relative  mb-4`} style={{ zIndex: 2 }}>
        <SectionHeader section={section} typeId={typeId} />
      </div>
      <div className=" container-custom relative group/scroll" style={{ zIndex: 2 }}>
        <button onClick={() => scroll("left")} aria-label="Scroll left" className={`${arrowCls} left-0`}>
          <FiChevronLeft size={16} className="text-gray-700 dark:text-dm-text" />
        </button>
        <div ref={scrollRef} className={`flex gap-4 overflow-x-auto pb-2 `} style={{ scrollbarWidth: "none" }}>
          {items.map(item => {
            const imgSrc = item.image || item.portrait_img || item.landscape_img || IMAGES.placeholder;
            const href = `/categories/${item.id || item.category_id}/0`;
            return (
              <Link key={item.id} href={href}
                className="group flex flex-col items-center gap-2 flex-shrink-0 py-1"
                style={{ width: "130px" }}>
                {/* Fixed 80×80 image box — identical for every item */}
                <div className="relative flex-shrink-0 rounded-2xl overflow-hidden bg-[#FFF8F0] border border-gray-100 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200"
                  style={{ width: "120px", height: "120px" }}>
                  <Image src={imgSrc} alt={item.name} fill
                    className="object-contain p-2" sizes="80px" />
                </div>
                {/* Fixed min-height label so text doesn't shift card height */}
                <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors dark:text-white"
                  style={{ width: "80px", minHeight: "28px" }}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
        <button onClick={() => scroll("right")} aria-label="Scroll right" className={`${arrowCls} right-0`}>
          <FiChevronRight size={16} className="text-gray-700 dark:text-dm-text" />
        </button>
      </div>
    </section>
  );

  return hasBg ? content : <div className="">{content}</div>;
}


/* ══════════════════════════════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════════════════════════════ */
type Props = {
  typeId?: string;
};
export default function HomeSectionsClient({ typeId }: Props) {
  const { data, isLoading } = useHomeSections(1, typeId == null ? 1 : 2, Number(typeId == null ? "0" : typeId));
  const sections = data?.result ?? [];

  if (isLoading) {
    return (
      <div className="container-custom space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5">
            <div className="skeleton h-7 w-48 rounded mx-auto mb-4" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, j) => <ProductCardSkeleton key={j} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="">
      {sections.map((section, index) => {
        const layout = (section.screen_layout ?? "").toLowerCase().replace(/\s+/g, "");

        const sectionEl =
          layout === "category_grid" ? <CategoryGridSection key={section.id} section={section} typeId={typeId} /> :
            layout === "category_list" ? <CategoryListSection key={section.id} section={section} typeId={typeId} /> :
              <PortraitItemSection key={section.id} section={section} typeId={typeId} />;

        if (index === 2) {
          return (
            <div key={`delivery-group-${section.id}`} className="space-y-7">
              {typeId == null && (<div className="container-custom mt-7"><DeliveryFeatures /></div>)}
              {sectionEl}
            </div>
          );
        }

        return sectionEl;
      })}
    </div>
  );
}