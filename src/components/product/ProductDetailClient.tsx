"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiChevronRight, FiRefreshCw, FiTruck, FiDownload, FiShoppingCart, FiHeart,
} from "react-icons/fi";
import { useProductDetail, useSimilarItems } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { IMAGES, TEXT } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";

/* ─── Stepper / Add button — reused in both main card and sticky bar ────────── */
function CartControl({
  inStock,
  cartQty,
  onAdd,
  onInc,
  onDec,
  size = "md",
}: {
  inStock: boolean;
  cartQty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  size?: "sm" | "md";
}) {
  if (!inStock) {
    return (
      <span className={cn(
        "inline-flex items-center justify-center rounded-lg font-bold text-gray-400 dark:text-dm-muted bg-gray-100 dark:bg-dm-surface2",
        size === "sm" ? "px-4 py-1.5 text-xs" : "w-full py-3 text-sm"
      )}>
        {TEXT.product.outOfStock}
      </span>
    );
  }

  if (cartQty === 0) {
    return (
      <button
        onClick={onAdd}

        className={cn(
          "font-bold text-white rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 bg-primary",
          size === "sm" ? "px-5 py-2 text-sm" : "w-full py-3 text-sm"
        )}>
        {size === "sm" && <FiShoppingCart size={15} />}
        {TEXT.product.addToCart}
      </button>
    );
  }

  /* Stepper */
  return (
    <div className={cn(
      "flex items-center rounded-lg overflow-hidden bg-primary",
      size === "sm" ? "h-8" : "w-full h-11"
    )}>
      <button
        onClick={onDec}
        className={cn(
          "flex items-center justify-center text-white font-black hover:bg-primary-800 transition-colors flex-shrink-0",
          size === "sm" ? "w-8 h-8 text-lg" : "w-12 h-full text-xl"
        )}>
        −
      </button>
      <span className={cn(
        "flex-1 text-center text-white font-black",
        size === "sm" ? "text-sm" : "text-base"
      )}>
        {cartQty}
      </span>
      <button
        onClick={onInc}
        className={cn(
          "flex items-center justify-center text-white font-black hover:bg-primary-800 transition-colors flex-shrink-0",
          size === "sm" ? "w-8 h-8 text-lg" : "w-12 h-full text-xl"
        )}>
        +
      </button>
    </div>
  );
}

/* ─── Sticky bar ─────────────────────────────────────────────────────────────── */
function StickyBar({ show, name, image, price, inStock, cartQty, currencyCode, onAdd, onInc, onDec }: {
  show: boolean;
  name: string;
  image: string;
  price: number;
  inStock: boolean;
  cartQty: number;
  currencyCode: string;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  const cs = currencyCode;
  return (
    <div className={cn(
      "fixed left-0 right-0 z-40 bg-white dark:bg-dm-surface border-b border-gray-200 dark:border-dm-border shadow-md",
      "transition-all duration-300 ease-in-out",
      show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none",
    )} style={{ top: "70px" }}>
      <div className="container-custom py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border flex-shrink-0">
            <Image src={image || IMAGES.placeholder} alt={name} fill className="object-contain p-1" sizes="48px" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-dm-muted font-medium line-clamp-1">{name}</p>
            <span className="inline-block bg-primary-700 text-white text-sm font-black px-2.5 py-0.5 rounded-full mt-0.5">
              {cs}{price}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 min-w-[120px]">
          <CartControl size="sm" inStock={inStock} cartQty={cartQty}
            onAdd={onAdd} onInc={onInc} onDec={onDec} />
        </div>
      </div>
    </div>
  );
}

/* ─── Info row ───────────────────────────────────────────────────────────────── */
function InfoRow({ label, value, html }: { label: string; value?: string; html?: boolean }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[170px_1fr] gap-x-4 py-3 border-b border-gray-100 dark:border-dm-border last:border-0">
      <span className="text-xs text-gray-400 dark:text-dm-muted font-medium leading-relaxed">{label}</span>
      {html
        ? <span className="text-xs text-gray-700 dark:text-dm-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: value }} />
        : <span className="text-xs text-gray-700 dark:text-dm-muted leading-relaxed">{value}</span>
      }
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────────── */
export default function ProductDetailClient({ itemId }: { itemId: number | string }) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  const productRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useProductDetail(itemId);
  const { data: similarData } = useSimilarItems(itemId);

  const product = data?.result?.[0];
  const similar = similarData?.result ?? [];

  const { addItem, updateQuantity, cart } = useCartStore();
  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const cartItems = cart.items;
  const { openModal, isAuthenticated } = useAuthStore();
  const { settings } = useAppSettings();
  const cs = settings.currencyCode;

  const COUPONS = [
    { className: "bg-primary-700", text: `Flat ${cs}200 off on orders above ${cs}2399` },
    { className: "bg-primary-700", text: `Flat ${cs}150 off on orders above ${cs}1799` },
    { className: "bg-primary-700", text: `Flat ${cs}100 off on orders above ${cs}1199` },
    { className: "bg-primary-700", text: `Flat ${cs}50 off on orders above ${cs}599` },
    { className: "bg-gray-900", text: TEXT.support.cashback },
  ];

  /* Sticky scroll — triggers when Add To Cart button scrolls out of view */
  useEffect(() => {
    const handler = () => {
      if (!productRef.current) return;
      setStickyVisible(productRef.current.getBoundingClientRect().bottom < 80);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (isLoading) return (
    <div className="animate-fade-in flex gap-6">
      <div className="w-[40%] flex gap-3">
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton w-14 h-14 rounded-lg" />)}
        </div>
        <div className="skeleton flex-1 aspect-square rounded-xl" />
      </div>
      <div className="w-[60%] space-y-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-5 rounded" />)}
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="text-center py-16">
      <p className="text-gray-500 dark:text-dm-muted mb-4">Product not found.</p>
      <Link href="/" className="btn-primary text-sm">← {TEXT.common.backToHome}</Link>
    </div>
  );

  const images: string[] =
    (product.item_images?.length ?? 0) > 0
      ? product.item_images!.map((img) => img.image)
      : [product.portrait_img, product.landscape_img].filter(Boolean) as string[];
  const salePrice = product.final_price ?? product.price;
  const hasDisc = salePrice < product.price && product.price > 0;
  const discAmt = hasDisc ? Math.round(product.price - salePrice) : 0;
  const inStock = product.enable_stock === 0 || product.total_stock > 0;
  const rating = parseFloat(product.avg_rating ?? "0");
  const mainImage = images[selectedImg] || IMAGES.placeholder;

  /* Cart qty — derived from reactive store */
  const cartItem = cartItems.find(i => i.product_id === product.id);
  const cartQty = cartItem?.quantity ?? 0;

  const inWishlist = wishlistItems.some(p => p.id === product.id);

  const handleAdd = () => { if (!isAuthenticated) { openModal(); return; } addItem(product, 1); toast.success(TEXT.product.addedToCart); };
  const handleInc = () => { updateQuantity(product.id, cartQty + 1); };
  const handleDec = () => { updateQuantity(product.id, cartQty - 1); };
  const handleWish = () => { if (!isAuthenticated) { openModal(); return; } toggleItem(product); };

  const highlights: { label: string; value: string; html?: boolean }[] = [
    { label: TEXT.product.labelBrand, value: product.brand_name ?? "" },
    { label: TEXT.product.labelProductType, value: product.category_name ?? "" },
    { label: TEXT.product.labelKeyFeatures, value: product.sort_description ?? "" },
    { label: TEXT.product.labelIngredients, value: product.long_description ?? "", html: true },
    { label: TEXT.product.labelWeight, value: product.per_unit ? `${product.per_unit} ${product.unit}` : "" },
    { label: TEXT.product.labelUnit, value: product.unit ?? "" },
    { label: TEXT.product.labelPackaging, value: "Packet" },
    { label: TEXT.product.labelStorage, value: "Store in a cool, hygienic, and dry place." },
  ].filter(r => r.value);

  const information: { label: string; value: string }[] = [
    { label: TEXT.product.labelDisclaimer, value: "All images are for representational purposes only." },
    { label: TEXT.product.labelCustomerCare, value: TEXT.support.customerCare },
    { label: TEXT.product.labelCountry, value: "India" },
  ];
  const thumbnails: (string | undefined)[] = [
    ...images,
    ...Array.from({ length: Math.max(0, 5 - images.length) }, () => undefined),
  ];
  return (
    <div className="animate-fade-in">

      {/* Sticky bar */}
      <StickyBar
        show={stickyVisible} name={product.name} image={mainImage} price={salePrice}
        inStock={inStock} cartQty={cartQty} currencyCode={cs}
        onAdd={handleAdd} onInc={handleInc} onDec={handleDec}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-dm-muted mb-3">
        <Link href="/" className="hover:text-primary-700">{TEXT.category.breadcrumbHome}</Link>
        <FiChevronRight size={11} className="text-gray-400 dark:text-dm-muted" />
        <Link href={`/categories/${product.category_id}/0`} className="hover:text-primary-700">
          {product.category_name}
        </Link>
        <FiChevronRight size={11} className="text-gray-400 dark:text-dm-muted" />
        <span className="text-gray-700 dark:text-dm-text line-clamp-1">{product.name}</span>
      </nav>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-0 bg-white dark:bg-dm-surface rounded-xl border border-gray-100 dark:border-dm-border shadow-sm ">

        {/* ── LEFT 40% — sticky ── */}
        <div className="md:w-[40%] flex-shrink-0 p-5 border-b md:border-b-0 md:border-r border-gray-100 dark:border-dm-border md:sticky md:top-[88px] md:self-start">

          <div className="flex gap-3">
            {/* Thumbnails */}

            {/* {(images.length > 0 ? images : [IMAGES.placeholder]).map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImg(idx)}
                  className={cn(
                    "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 dark:border-gray-600",
                    selectedImg === idx ? "border-primary-600" : "border-gray-200 hover:border-gray-300"
                  )}>
                  <Image src={img} alt="" fill className="object-contain p-1" sizes="56px" />
                </button>
              ))} */}


            <div className="flex flex-col gap-2 flex-shrink-0">
              {thumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => img && setSelectedImg(idx)}
                  className={cn(
                    "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 dark:border-gray-600",
                    selectedImg === idx
                      ? "border-primary-600"
                      : "border-gray-200 hover:border-gray-300",
                    !img && "cursor-default"
                  )}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt="product"
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border rounded-lg" />
                  )}
                </button>
              ))}
            </div>
            {/* Main image */}
            <div className="flex-1 relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-dm-surface2">
              <Image src={mainImage} alt={product.name} fill
                className="object-contain p-6"
                sizes="(max-width:768px) 100vw, 40vw" priority />
            </div>
          </div>

          {/* Add to Cart / Stepper — ref triggers sticky bar */}
          <div className="mt-4" ref={productRef}>
            <CartControl
              inStock={inStock} cartQty={cartQty}
              onAdd={handleAdd} onInc={handleInc} onDec={handleDec}
            />
          </div>
        </div>

        {/* ── RIGHT 60% — scrollable ── */}
        <div className="flex-1 min-w-0 ">

          <div className="p-5 pb-0">

            {/* Wishlist */}
            <div className="flex items-center gap-2 mb-2">
              <button onClick={handleWish}
                aria-label={inWishlist ? TEXT.product.removeFromWishlist : TEXT.product.addToWishlist}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all hover:scale-105",
                  inWishlist ? "border-red-500 bg-red-50" : "border-gray-200 dark:border-dm-border bg-transparent"
                )}>
                <FiHeart size={16} className={inWishlist ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-dm-muted"} />
                <span className={`text-xs font-semibold ${inWishlist ? "text-red-500" : "text-gray-500 dark:text-dm-muted"}`}>
                  {inWishlist ? TEXT.product.wishlisted : TEXT.product.wishlist}
                </span>
              </button>
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-dm-surface2 rounded-lg" aria-label="Share">
                <FiDownload size={16} className="text-gray-400 dark:text-dm-muted" />
              </button>
            </div>

            {/* Brand */}
            {product.brand_name && (
              <p className="text-xs font-semibold mb-1 flex items-center gap-0.5 text-primary-700">
                {product.brand_name} <FiChevronRight size={11} />
              </p>
            )}

            {/* Name */}
            <h1 className="text-base font-bold text-gray-900 dark:text-dm-text leading-snug mb-1">{product.name}</h1>

            {/* Qty + rating */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              {product.unit && (
                <p className="text-xs text-gray-500 dark:text-dm-muted">{TEXT.product.netQty}: {TEXT.product.onePack} ({product.unit})</p>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white font-bold px-1.5 py-0.5 rounded bg-primary-700">
                    {rating.toFixed(1)} ★
                  </span>
                  {product.total_reviews > 0 && (
                    <span className="text-xs text-gray-400 dark:text-dm-muted">{product.total_reviews.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex items-center text-white font-black text-base px-3 py-1 rounded-lg bg-primary-700">
                {cs}{salePrice}
              </span>
            </div>

            {hasDisc && (
              <p className="text-xs text-gray-400 dark:text-dm-muted mb-3">
                MRP {cs}{product.price}{" "}
                <span className="text-gray-400 dark:text-dm-muted text-[10px]">(Inclusive of all taxes)</span>{" "}
                <span className="text-green-600 font-semibold">{cs}{discAmt} {TEXT.product.off}</span>
              </p>
            )}

            {/* Coupons */}
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-dm-text mb-2">{TEXT.product.couponsOffers}</h3>
              <div className="space-y-1.5">
                {(showAllCoupons ? COUPONS : COUPONS.slice(0, 4)).map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0", c.className)}>
                      <span className="text-white text-[9px] font-black">✓</span>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-dm-muted flex-1 leading-snug">{c.text}</span>
                    <FiChevronRight size={12} className="text-gray-400 dark:text-dm-muted flex-shrink-0" />
                  </div>
                ))}
              </div>
              <button onClick={() => setShowAllCoupons(s => !s)}
                className="mt-2 text-xs font-semibold hover:opacity-80 transition-opacity text-primary-700">
                {showAllCoupons ? TEXT.product.hideCoupons : TEXT.product.viewAllCoupons}
              </button>
            </div>

            {/* Delivery icons */}
            <div className="flex gap-5 pb-4 border-b border-gray-100 dark:border-dm-border">
              {[
                { Icon: FiRefreshCw, label: TEXT.product.easyReturns },
                { Icon: FiTruck, label: TEXT.product.fastDelivery },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dm-surface2 flex items-center justify-center">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-dm-muted leading-tight whitespace-pre-line">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dm-border">
            <h2 className="text-sm font-bold text-gray-900 dark:text-dm-text mb-1">{TEXT.product.highlights}</h2>
            {highlights.map(({ label, value, html }) => (
              <InfoRow key={label} label={label} value={value} html={html} />
            ))}
          </div>

          {/* Information */}
          <div className="px-5 py-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-dm-text mb-1">{TEXT.product.information}</h2>
            {information.map(({ label, value }) => (
              <InfoRow key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="bg-white dark:bg-dm-surface rounded-xl border border-gray-100 dark:border-dm-border shadow-sm p-5 mt-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-dm-text mb-4">{TEXT.product.similarProducts}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {similar.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}