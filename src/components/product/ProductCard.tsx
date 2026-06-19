"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiHeart, FiStar, FiPlus, FiMinus } from "react-icons/fi";
import { ProductItem } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { IMAGES, TEXT } from "@/branding";

interface Props { product: ProductItem; }

export default function ProductCard({ product }: Props) {
  const [imgErr, setImgErr] = useState(false);

  const { addItem, updateQuantity, cart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isAuthenticated, openModal } = useAuthStore();
  const cartItems = cart.items;

  const inWishlist = isInWishlist(product.id);
  const cartItem = cartItems.find((i) => i.product_id === product.id);
  const cartQty = cartItem?.quantity ?? 0;

  const salePrice = product.final_price ?? product.price;
  const hasDiscount = salePrice < product.price && product.price > 0;
  const discountPct = hasDiscount ? Math.round(((product.price - salePrice) / product.price) * 100) : null;
  const thumbnail = imgErr ? IMAGES.placeholder : (product.portrait_img || product.landscape_img || IMAGES.placeholder);
  const inStock = product.enable_stock === 0 || product.total_stock > 0;
  const isLowStock = inStock && product.enable_stock === 1 && product.total_stock <= 10;

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleAdd = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } addItem(product, 1); };
  const handleInc = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } if (cartItem) { updateQuantity(product.id, cartQty + 1); } else { addItem(product, 1); } };
  const handleDec = (e: React.MouseEvent) => { stop(e); updateQuantity(product.id, cartQty - 1); };
  const handleWishlist = (e: React.MouseEvent) => { stop(e); if (!isAuthenticated) { openModal(); return; } toggleItem(product); };

  const rating = parseFloat(product.avg_rating ?? "0");

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 dark:bg-dm-surface2 overflow-hidden">
          <Image
            src={thumbnail}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onError={() => setImgErr(true)}
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPct && <span className="badge-sale text-xs">-{discountPct}%</span>}
          </div>
          <button onClick={handleWishlist}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-dm-surface shadow-md flex items-center justify-center transition-all hover:scale-110"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
            <FiHeart size={15} className={cn("transition-colors", inWishlist ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400")} />
          </button>
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 flex items-center justify-center">
              <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded-full">{TEXT.product.outOfStock}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-1 dark:bg-dm-surface">
          {product.category_name && <p className="text-xs text-gray-400 dark:text-dm-muted line-clamp-1">{product.category_name}</p>}
          <h3 className="text-sm font-semibold text-gray-800 dark:text-dm-text line-clamp-1 leading-snug flex-1">{product.name}</h3>
          {product.unit && <p className="text-xs text-gray-400 dark:text-dm-muted">{product.unit} {product.per_unit > 1 ? `× ${product.per_unit}` : ""}</p>}
          {isLowStock && <p className="text-xs text-orange-500">{TEXT.product.lowStock(product.total_stock)}</p>}

          {rating > 0 && (
            <div className="flex items-center gap-1">
              <FiStar size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-500 font-medium">{rating.toFixed(1)}</span>
              {product.total_reviews > 0 && <span className="text-xs text-gray-300">({product.total_reviews})</span>}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            <div>
              <p className="text-base font-bold text-primary-700">₹{salePrice}</p>
              {hasDiscount && <p className="price-original text-xs">₹{product.price}</p>}
            </div>
            {inStock && (
              cartQty === 0 ? (
                <button onClick={handleAdd}
                  className="w-8 h-8 bg-primary-700 hover:bg-primary-800 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                  aria-label={TEXT.product.addToCart}>
                  <FiPlus size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-primary-700 rounded-full overflow-hidden">
                  <button onClick={handleDec} className="w-7 h-7 flex items-center justify-center text-white hover:bg-primary-800" aria-label="Remove one"><FiMinus size={12} /></button>
                  <span className="text-white text-xs font-bold min-w-[18px] text-center">{cartQty}</span>
                  <button onClick={handleInc} className="w-7 h-7 flex items-center justify-center text-white hover:bg-primary-800" aria-label="Add one"><FiPlus size={12} /></button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}