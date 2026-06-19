"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiTrash2, FiPlus, FiMinus, FiTag, FiShoppingCart } from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { promoService } from "@/services/promoService";
import { IMAGES, TEXT, CONFIG } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import toast from "react-hot-toast";

export default function CartPageClient() {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { settings } = useAppSettings();
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<{ id: number; code: string } | null>(null);

  const deliveryFee = cart.subtotal >= CONFIG.freeDeliveryThreshold ? 0 : settings.deliveryCharges;
  const total = cart.subtotal - discount + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) { toast.error(TEXT.checkout.enterPromoCode); return; }
    setPromoLoading(true);
    try {
      const res = await promoService.applyPromoCode(promoCode.trim(), cart.subtotal);
      if (res.status === 200 && res.result?.[0]) {
        const disc = (res.result[0] as { discount_amount?: number }).discount_amount ?? 0;
        setDiscount(disc);
        setAppliedPromo({ id: 0, code: promoCode.trim() });
        toast.success(`${TEXT.carts.promoCode} ${TEXT.carts.apply}! ${TEXT.carts.youSaved} ${settings.currencyCode}${disc}`);
      } else {
        toast.error(res.message || TEXT.carts.invalidCoupon);
      }
    } catch {
      toast.error(TEXT.common.error);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => { setAppliedPromo(null); setDiscount(0); setPromoCode(""); };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-dm-surface2 rounded-full flex items-center justify-center mb-5">
          <FiShoppingCart size={40} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-dm-muted mb-2">{TEXT.carts.emptyTitle}</h2>
        <p className="text-gray-400 dark:text-dm-muted mb-8">{TEXT.carts.emptySubtitle}</p>
        <Link href="/" className="btn-primary">{TEXT.carts.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Items */}
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{TEXT.carts.title} ({cart.total_items} items)</h2>
            <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
              {TEXT.carts.clearAll}
            </button>
          </div>
          <div className="space-y-3 divide-y divide-gray-50">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-3 first:pt-0 group animate-fade-in">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border flex-shrink-0">
                  <Image src={item.product.portrait_img || IMAGES.placeholder} alt={item.product.name} fill className="object-contain p-2" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-dm-text line-clamp-2">{item.product.name}</h3>
                  {item.product.unit && <p className="text-xs text-gray-400 dark:text-dm-muted mt-0.5">{item.product.unit}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1 border-2 border-gray-100 dark:border-dm-border rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-primary-50 text-primary-700 transition-colors">
                        <FiMinus size={13} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-800 dark:text-dm-text">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-primary-50 text-primary-700 transition-colors">
                        <FiPlus size={13} />
                      </button>
                    </div>
                    <span className="text-base font-bold text-primary-700">{settings.currencyCode}{item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product_id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all h-fit opacity-0 group-hover:opacity-100">
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        {/* Promo Code */}
        <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5">
          <h3 className="font-bold text-gray-800 dark:text-dm-text mb-3 flex items-center gap-2"><FiTag size={16} className="text-primary-600" /> {TEXT.carts.promoCode}</h3>
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
              <div>
                <p className="text-sm font-bold text-green-700">{appliedPromo.code}</p>
                <p className="text-xs text-green-600">{TEXT.carts.youSaved} {settings.currencyCode}{discount}</p>
              </div>
              <button onClick={removePromo} className="text-xs text-red-500 hover:text-red-600 font-medium">{TEXT.common.remove}</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="text" placeholder={TEXT.carts.enterCouponCode} value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                className="flex-1 px-3 py-2.5 border-2 border-gray-100 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-300 uppercase"
              />
              <button onClick={handleApplyPromo} disabled={promoLoading} className="btn-primary text-sm py-2 px-4 disabled:opacity-50">
                {promoLoading ? TEXT.common.loading : TEXT.common.apply}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5">
          <h3 className="font-bold text-gray-800 dark:text-dm-text mb-4">{TEXT.carts.orderSummary}</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-dm-muted">
              <span>{TEXT.carts.subtotal} ({cart.total_items} items)</span>
              <span>{settings.currencyCode}{cart.subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{TEXT.common.discount}</span>
                <span>-{settings.currencyCode}{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-dm-muted">
              <span>{TEXT.carts.deliveryFee}</span>
              {deliveryFee === 0 ? (
                <span className="text-green-600 font-medium">{TEXT.carts.freeDelivery}</span>
              ) : (
                <span>{settings.currencyCode}{deliveryFee.toFixed(2)}</span>
              )}
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                {TEXT.carts.addItemsWorth} {settings.currencyCode}{(CONFIG.freeDeliveryThreshold - cart.subtotal).toFixed(2)} {TEXT.carts.toGetFreeDelivery}
              </p>
            )}
            <div className="flex justify-between font-bold text-gray-800 dark:text-dm-text text-base pt-3 border-t border-gray-100 dark:border-dm-border">
              <span>{TEXT.carts.total}</span>
              <span className="text-primary-700 text-lg">{settings.currencyCode}{total.toFixed(2)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full justify-center mt-5">{TEXT.carts.checkout}</Link>
          <Link href="/" className="btn-outline w-full justify-center mt-2 text-sm">{TEXT.carts.continueShopping}</Link>
        </div>
      </div>
    </div>
  );
}
