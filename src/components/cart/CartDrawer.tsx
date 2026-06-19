"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiX,
  FiPlus,
  FiAlertTriangle,
  FiMessageSquare,
  FiHome,
  FiBriefcase,
  FiMapPin,
  FiTrash2
} from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import {
  useAddresses,
  usePromoCodes,
} from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { promoService } from "@/services/promoService";
import { profileService } from "@/services/profileService";
import { Address } from "@/types";
import { IMAGES, TEXT, CONFIG } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import PaymentModal from "./PaymentModal";

/* ══════════════════════════════════════════════════════════════════════════════
   COUPON MODAL  — uses real API: getPromoCodes + applyPromoCode
══════════════════════════════════════════════════════════════════════════════ */
function CouponModal({
  onClose,
  onApply,
  cartTotal,
}: {
  onClose: () => void;
  onApply: (code: string, promoId: number, discount: number) => void;
  cartTotal: number;
}) {
  const [input, setInput] = useState("");
  const [applying, setApplying] = useState<number | null>(null);

  const { isAuthenticated, openModal } = useAuthStore();
  const { settings } = useAppSettings();
  const { data, isLoading } = usePromoCodes(1);
  const promos = data?.result ?? [];

  const applyPromo = async (promoId: number, promoCode: string) => {
    if (!isAuthenticated) {
      onClose();
      openModal();
      return;
    }
    setApplying(promoId);
    try {
      const res = await promoService.applyPromoCode(promoId, cartTotal);
      if (res.status === 200 && res.result?.[0]) {
        const disc = (res.result[0] as { discount_amount?: number }).discount_amount ?? 0;
        toast.success(`${promoCode} applied! You saved ${settings.currencyCode}${disc}`);
        onApply(promoCode, promoId, disc);
        onClose();
      } else {
        toast.error(res.message || TEXT.carts.couponNotApplicable);
      }
    } catch {
      toast.error(TEXT.common.error);
    } finally {
      setApplying(null);
    }
  };

  const handleManual = async () => {
    const trimmed = input.trim().toUpperCase();
    if (!trimmed) return;
    const found = promos.find((p) => p.promo_code.toUpperCase() === trimmed);
    if (found) {
      await applyPromo(found.id, found.promo_code);
    } else {
      toast.error(TEXT.carts.invalidCoupon);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 animate-fade-in "
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dm-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-bounce-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dm-border">
          <h3 className="text-base font-bold text-gray-900 dark:text-dm-text">{TEXT.carts.applyCoupons}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-dm-surface2 flex items-center justify-center">
            <FiX size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Manual input */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center border-2 border-gray-200 dark:border-dm-border rounded-xl overflow-hidden focus-within:border-primary-400 transition-colors dark:bg-dm-surface2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleManual()}
              placeholder={TEXT.carts.enterCouponCode}
              className="flex-1 px-4 py-3 text-sm font-medium tracking-widest focus:outline-none placeholder-gray-300 placeholder:tracking-normal bg-transparent dark:text-dm-text"
            />
            <button
              onClick={handleManual}
              className="px-4 py-3 text-sm font-bold text-primary-700 hover:text-primary-800 transition-colors border-l border-gray-200 dark:border-dm-border"
            >
              {TEXT.carts.apply}
            </button>
          </div>
        </div>

        {/* Promo list — matches Flutter Promocode card design */}
        <div className="px-5 pb-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm font-bold text-gray-800 dark:text-dm-text mb-3">{TEXT.carts.availableCoupons}</p>

          {isLoading ? (
            /* Shimmer — matches Flutter promocodeShimmer */
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-dm-surface2 rounded-xl overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded animate-pulse w-28" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                    </div>
                    <div className="h-7 w-14 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="px-4 py-2.5">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : promos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{TEXT.carts.noCoupons}</p>
          ) : (
            <div className="space-y-3">
              {promos.map((promo) => (
                <div key={promo.id} className="bg-gray-50 dark:bg-dm-surface2 rounded-xl overflow-hidden border border-gray-100 dark:border-dm-border">
                  {/* Card top — image, name, code, apply button */}
                  <div className="flex items-start gap-3 px-4 py-4">
                    {/* Promo image */}
                    <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {promo.image ? (
                        <Image src={promo.image} alt={promo.name} width={36} height={36} className="object-contain" unoptimized />
                      ) : (
                        <span className="text-lg">🎟</span>
                      )}
                    </div>

                    {/* Name + "use code" */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">{promo.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 dark:text-white">
                        {TEXT.carts.useCode}{" "}
                        <span className="font-bold text-gray-700 tracking-wide dark:text-white">{promo.promo_code}</span>
                      </p>
                    </div>

                    {/* Apply button */}
                    <button
                      onClick={() => applyPromo(promo.id, promo.promo_code)}
                      disabled={applying === promo.id}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-800 hover:border-primary-500 hover:text-primary-700 disabled:opacity-50 transition-colors dark:text-white"
                    >
                      {applying === promo.id
                        ? <span className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin inline-block" />
                        : TEXT.carts.apply}
                    </button>
                  </div>

                  {/* Divider + valid until */}
                  <div className="h-px bg-gray-200" />
                  {promo.valid_until && (
                    <div className="px-4 py-2.5 flex items-center gap-1.5">
                      <span className="text-primary-600 font-black text-base leading-none">•</span>
                      <p className="text-xs text-primary-600">
                        {TEXT.carts.validTill}{" "}
                        {new Date(promo.valid_until).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ADDRESS MODAL  (Image 3)
══════════════════════════════════════════════════════════════════════════════ */
function AddressModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (addr: Address) => void;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAddresses();
  const addresses: Address[] = data?.result ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const emptyForm = {
    address: "",
    area: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    type: 1,
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const typeIcon = (t: number) =>
    t === 1 ? (
      <FiHome size={16} className="text-gray-500" />
    ) : t === 2 ? (
      <FiBriefcase size={16} className="text-gray-500" />
    ) : (
      <FiMapPin size={16} className="text-gray-500" />
    );

  const typeName = (t: number) =>
    ({ 1: TEXT.carts.addressHome, 2: TEXT.carts.addressOffice, 3: TEXT.carts.addressOther } as Record<number, string>)[t] ?? TEXT.carts.addressOther;

  const handleSave = async () => {
    if (!form.address || !form.city || !form.pincode) {
      toast.error(TEXT.carts.fillRequired);
      return;
    }
    setSaving(true);
    try {
      const r = await profileService.addAddress({
        ...form,
        mode: "add",
        latitude: "0",
        longitude: "0",
      });
      if (r.status === 200) {
        toast.success(TEXT.account.addressAdded);
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADDRESSES] });
        setForm(emptyForm);
        setShowAdd(false);
      } else toast.error(r.message || TEXT.common.error);
    } catch {
      toast.error(TEXT.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = () => {
    const addr = addresses.find((a) => a.id === selectedId);
    if (!addr) {
      toast.error(TEXT.carts.selectAddressFirst);
      return;
    }
    onSelect(addr);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dm-surface rounded-2xl w-full max-w-lg shadow-2xl animate-bounce-in overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Add new address button */}
        <div className="border-b border-gray-100 dark:border-dm-border">
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="w-full flex items-center gap-2 px-5 py-4 text-sm font-semibold text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors"
          >
            <FiPlus size={16} className="text-gray-500" />
            {TEXT.carts.addNewAddress}
            <FiChevronRight size={14} className="text-gray-400 ml-auto" />
          </button>

          {/* Inline add form */}
          {showAdd && (
            <div className="px-5 pb-4 space-y-2.5 bg-gray-50 dark:bg-dm-surface2 border-t border-gray-100 dark:border-dm-border">
              <div className="flex gap-2 pt-3">
                {[
                  { t: 1, l: TEXT.carts.addressHome },
                  { t: 2, l: TEXT.carts.addressOffice },
                  { t: 3, l: TEXT.carts.addressOther },
                ].map(({ t, l }) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors",
                      form.type === t
                        ? "bg-primary-700 text-white border-primary-700"
                        : "border-gray-200 text-gray-600",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {[
                ["address", TEXT.carts.fieldFullAddress],
                ["area", TEXT.carts.fieldArea],
                ["city", TEXT.carts.fieldCity],
                ["state", TEXT.common.state],
                ["pincode", TEXT.carts.fieldPincode],
              ].map(([k, l]) => (
                <input
                  key={k}
                  placeholder={l}
                  value={form[k as keyof typeof form] as string}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [k]: e.target.value }))
                  }
                  className="w-full border border-gray-200 dark:border-dm-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-400 dark:bg-dm-surface dark:text-dm-text"
                />
              ))}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50
                bg-primary "
              >
                {saving ? TEXT.account.saving : TEXT.carts.saveAddress}
              </button>
            </div>
          )}
        </div>

        {/* Saved addresses */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-sm font-bold text-gray-800 dark:text-dm-text mb-3">
            {TEXT.carts.savedAddresses}
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {TEXT.carts.noAddresses}
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedId(addr.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all",
                    selectedId === addr.id
                      ? "border-primary-600 bg-primary-50 dark:bg-dm-surface2"
                      : "border-gray-100 dark:border-dm-border hover:border-gray-200 bg-white dark:bg-dm-surface",
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-dm-surface2 flex items-center justify-center flex-shrink-0 mt-0.5 dark:text-white">
                    {typeIcon(addr.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 mb-0.5 dark:text-white  ">
                      {typeName(addr.type)}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug dark:text-white">
                      {[
                        addr.address,
                        addr.area,
                        addr.city,
                        addr.state,
                        addr.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  {selectedId === addr.id && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Confirm button */}
        {addresses.length > 0 && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-dm-border">
            <button
              onClick={handleConfirm}
              disabled={!selectedId}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-colors
  ${selectedId ? "bg-primary-700 hover:bg-primary-800" : "bg-gray-400 cursor-not-allowed"}
`}
            >
              {TEXT.carts.proceedAddress}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   CART DRAWER  (Image 1)
══════════════════════════════════════════════════════════════════════════════ */
export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCartStore();
  const { isAuthenticated, openModal } = useAuthStore();
  const { settings } = useAppSettings();
  const [showPayment, setShowPayment] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponPromoId, setCouponPromoId] = useState<number | null>(null);
  const [couponDisc, setCouponDisc] = useState(0);
  const [instrOpen, setInstrOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [selectedAddr, setSelectedAddr] = useState<Address | null>(null);
  const [deliveryInstructorId] = useState<number>(0);

  /* Prevent body scroll when open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Bill calculations */
  const itemTotal = cart.subtotal;
  const handlingFee = settings.handlingCharges;
  const deliveryFee = itemTotal >= CONFIG.freeDeliveryThreshold ? 0 : settings.deliveryCharges;
  const discountMRP = 0; // demo
  const discountHndl = 0; // demo
  const totalSavings = discountMRP + discountHndl + couponDisc;
  const toPay = Math.max(0, itemTotal - couponDisc + deliveryFee + selectedTip);
  const addMoreAmt = Math.max(0, 599 - itemTotal); // based on lowest promo threshold

  const handleCheckout = () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setShowAddress(true);
  };
  const itemDetails = JSON.stringify(
    cart.items.map((item) => ({
      item_id: item.product_id,
      quantity: item.quantity,
      delivery_charges: item.product.regular_delivery_charges ?? 0,
      handling_charges: 0,
      total_price: item.subtotal,
      variation: item.variation ?? {},
    })),
  );
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — blurred */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Coupon modal */}
      {showCoupons && (
        <CouponModal
          onClose={() => setShowCoupons(false)}
          cartTotal={itemTotal}
          onApply={(code, promoId, disc) => {
            setCouponCode(code);
            setCouponPromoId(promoId);
            setCouponDisc(disc);
          }}
        />
      )}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          toPay={toPay}
          orderPayload={{
            item_details: itemDetails,
            customer_address_id: selectedAddr?.id ?? 0,
            promo_code_id: couponPromoId ?? 0,
            item_total: itemTotal,
            total_payable_amount: toPay,
            handling_charges: handlingFee,
            donation_amount: selectedTip,
            discount_amount: couponDisc,
            delivery_charges: deliveryFee,
            delivery_instructor_id: deliveryInstructorId ?? 0,
          }}
        />
      )}
      {/* Address modal */}
      {showAddress && (
        <AddressModal
          onClose={() => setShowAddress(false)}
          onSelect={(addr) => {
            setSelectedAddr(addr);
            toast.success(`Delivering to ${addr.city}`);
          }}
        />
      )}

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white dark:bg-dm-background z-[60] shadow-2xl flex flex-col animate-slide-left">
        {/* ── HEADER ── */}
        <div className="flex-shrink-0">
          {/* Title row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-dm-border">
            <button
              onClick={closeCart}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors dark:bg-white"
            >
              <FiChevronLeft size={20} className="text-gray-700" />
            </button>
            <h2 className="text-base font-bold text-gray-900 dark:text-white ">{TEXT.carts.title}</h2>
          </div>

          {/* Savings banner */}
          {totalSavings > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border-b border-green-100 dark:bg-dm-surface dark:border-dm-surface2">
              <p className="text-xs text-green-700 font-medium">
                {TEXT.carts.saving}{" "}
                <span className="font-black ">{TEXT.carts.youSaved} {settings.currencyCode}{totalSavings}</span> {TEXT.carts.onThisOrder} 🎉
              </p>
              <FiChevronRight size={14} className="text-green-600" />
            </div>
          )}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Add items warning */}
          <div className="mx-4 mt-3 flex items-center justify-between gap-2 bg-amber-50 dark:bg-dm-surface2 border border-amber-200 dark:border-dm-border rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-2">
              <FiAlertTriangle
                size={14}
                className="text-amber-500 flex-shrink-0"
              />
              <p className="text-xs text-amber-800 font-medium">
                {TEXT.carts.addItemsWorth} {settings.currencyCode}{addMoreAmt} {TEXT.carts.moreToApply}
              </p>
            </div>
            <button className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 text-xs font-black">i</span>
            </button>
          </div>

          {/* Coupon card */}
          <div className="mx-4 mt-2 border border-gray-100 dark:border-dm-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🎟</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 dark:text-white">
                  {couponCode
                    ? `${couponCode} ${TEXT.carts.apply}! -${settings.currencyCode}${couponDisc}`
                    : TEXT.carts.getExtraOff}
                </p>
                {!couponCode && (
                  <p className="text-[10px] text-gray-500">{TEXT.carts.viewAllCoupons}</p>
                )}
              </div>
              {couponCode ? (
                <button
                  onClick={() => {
                    setCouponCode(null);
                    setCouponPromoId(null);
                    setCouponDisc(0);
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  {TEXT.common.remove}
                </button>
              ) : (
                <button
                  onClick={() => setShowCoupons(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dm-border text-gray-700 dark:text-dm-text hover:border-primary-400 transition-colors"
                >
                  {TEXT.common.apply}
                </button>
              )}
            </div>
            <button
              onClick={() => setShowCoupons(true)}
              className="w-full text-center text-xs font-semibold py-2.5 border-t border-gray-100 dark:border-dm-border hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors text-primary-700"
            >
              {TEXT.carts.viewAllCoupons}
            </button>
          </div>

          {/* Delivery time */}
          <div className="flex items-center gap-2 px-4 py-3 mt-2 border-t border-gray-50 dark:border-dm-border">
            <FiZap size={14} className="text-primary-600 flex-shrink-0" />
            <p className="text-xs font-bold text-gray-800 dark:text-white">
              {TEXT.carts.deliveryIn}
            </p>
          </div>

          {/* Cart items */}
          {cart.items.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">{TEXT.carts.emptyTitle}</p>
              <button
                onClick={closeCart}
                className="mt-3 text-xs font-bold text-primary-700"
              >
                {TEXT.carts.continueShopping}
              </button>
            </div>
          ) : (
            <div className="px-4 space-y-0 divide-y divide-gray-50 dark:divide-dm-border">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 dark:bg-dm-surface2 border border-gray-100 dark:border-dm-border flex-shrink-0">
                    <Image
                      src={item.product.portrait_img || IMAGES.placeholder}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="48px"
                    />
                  </div>

                  {/* Name + unit */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug dark:text-white">
                      {item.product.name}
                    </p>
                    {item.product.unit && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {TEXT.product.onePack} ({item.product.unit})
                      </p>
                    )}
                  </div>

                  {/* Stepper + price */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {/* Stepper */}
                    <div className="flex flex-row items-end">
                      <div className="flex items-center rounded-lg overflow-hidden border border-primary-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors text-base font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-black text-gray-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors text-base font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="w-7 h-7 flex items-center justify-center text-primary-700 hover:bg-primary-50 transition-colors text-base font-bold"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-900 dark:text-white">
                        {settings.currencyCode}{item.subtotal}
                      </p>
                      {item.price !== item.product.price && (
                        <p className="text-[10px] text-gray-400 line-through dark:text-white">
                          {settings.currencyCode}{Math.round(item.product.price * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Missed something */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dm-border mt-1">
            <p className="text-xs text-gray-600 font-medium dark:text-white">
              {TEXT.carts.missedSomething}
            </p>
            <button
              onClick={closeCart}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-colors bg-black"
            >
              <FiPlus size={12} /> {TEXT.carts.addMoreItems}
            </button>
          </div>

          {/* Bill summary */}
          {cart.items.length != 0 && (<div className="mx-4 mt-2 border border-gray-100 dark:border-dm-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-dm-border bg-gray-50 dark:bg-dm-surface2">
              <span className="text-sm">📋</span>
              <p className="text-sm font-bold text-gray-800 dark:text-white">{TEXT.carts.billSummary}</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {/* Item total */}
              <div className="flex justify-between text-xs text-gray-600 dark:text-dm-muted">
                <span>{TEXT.carts.itemTotal}</span>
                <span className="font-semibold text-gray-800 dark:text-dm-text">
                  {settings.currencyCode}{itemTotal}
                </span>
              </div>
              {/* Coupon discount */}
              {couponDisc > 0 && (
                <div className="flex justify-between text-xs text-gray-600 dark:text-dm-muted">
                  <span className="flex items-center gap-1">
                    🎟 {TEXT.carts.promoCode}
                    {couponCode && (
                      <span className="font-bold text-primary-700 tracking-wide">({couponCode})</span>
                    )}
                  </span>
                  <span className="font-bold text-green-600">
                    -{settings.currencyCode}{couponDisc}
                  </span>
                </div>
              )}
              {/* Handling fee */}
              <div className="flex justify-between text-xs text-gray-600 dark:text-dm-muted">
                <span>{TEXT.carts.handlingFee}</span>
                <span className="font-bold text-primary-700">{TEXT.carts.freeDelivery}</span>
              </div>
              {/* Delivery */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-dm-muted">
                  <span>{TEXT.carts.deliveryFee}</span>
                  <span
                    className={
                      deliveryFee === 0
                        ? "font-bold text-primary-700"
                        : "font-semibold text-gray-800 dark:text-dm-text"
                    }
                  >
                    {deliveryFee === 0 ? TEXT.carts.freeDelivery : `${settings.currencyCode}${deliveryFee}`}
                  </span>
                </div>
              </div>
              {/* Tip */}
              {selectedTip > 0 && (
                <div className="flex justify-between text-xs text-gray-600 dark:text-dm-muted">
                  <span className="flex items-center gap-1">💰 {TEXT.carts.deliveryPartnerTip}</span>
                  <span className="font-semibold text-gray-800 dark:text-dm-text">
                    {settings.currencyCode}{selectedTip}
                  </span>
                </div>
              )}
            </div>
            {/* To Pay */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dm-border">
              <span className="text-sm font-bold text-gray-800 dark:text-white">{TEXT.carts.toPay}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400 line-through dark:text-white">
                  {settings.currencyCode}{toPay + totalSavings}
                </span>
                <span className="text-base font-black text-gray-900 dark:text-white">
                  {settings.currencyCode}{toPay}
                </span>
              </div>
            </div>
          </div>)}

          {/* Savings card */}
          {totalSavings > 0 && cart.items.length != 0 && (
            <div className="mx-4 mt-2 rounded-xl overflow-hidden border border-green-100 bg-green-50 dark:bg-dm-surface dark:border-dm-surface2">
              <div className="flex items-center justify-between px-4 py-3 border-b border-green-100">
                <p className="text-xs font-bold text-gray-800 dark:text-white">
                  {TEXT.carts.savingsTitle}
                </p>
                <span className="bg-primary-700 text-white text-xs font-black px-2.5 py-1 rounded-full dark:text-white">
                  {settings.currencyCode}{totalSavings}
                </span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-[8px]">₹</span>
                    </span>
                    <span className="text-gray-700 dark:text-white">{TEXT.carts.discountMRP}</span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {settings.currencyCode}{discountMRP}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-white text-[8px] dark:text-white">{settings.currencyCode}</span>
                    </span>
                    <span className="text-gray-700 dark:text-white">
                      {TEXT.carts.savingsHandling}
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {settings.currencyCode}{discountHndl}
                  </span>
                </div>
                {couponDisc > 0 && (
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white text-[8px] dark:text-white">{settings.currencyCode}</span>
                      </span>
                      <span className="text-gray-700 dark:text-white">
                        {TEXT.carts.promoCode} ({couponCode})
                      </span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {settings.currencyCode}{couponDisc}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Instructions */}
          <div className="mx-4 mt-2 border border-gray-100 dark:border-dm-border rounded-xl overflow-hidden">
            <button
              onClick={() => setInstrOpen((s) => !s)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FiMessageSquare size={15} className="text-gray-500 dark:text-dm-muted" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white ">
                    {TEXT.carts.deliveryInstructions}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {TEXT.carts.deliveryNotified}
                  </p>
                </div>
              </div>
              <FiChevronLeft
                size={14}
                className={cn(
                  "text-gray-400 transition-transform",
                  instrOpen ? "rotate-90" : "-rotate-90",
                )}
              />
            </button>
            {instrOpen && (
              <div className="px-4 pb-3 border-t border-gray-100 dark:border-dm-border">
                <textarea
                  rows={2}
                  placeholder="Add delivery instructions…"
                  className="w-full text-xs border border-gray-200 dark:border-dm-border rounded-lg px-3 py-2 mt-2 focus:outline-none focus:border-primary-300 resize-none dark:bg-dm-surface2 dark:text-dm-text"
                />
              </div>
            )}
          </div>

          {/* Delivery Partner Tip */}
          <div className="mx-4 mt-2 mb-4 border border-gray-100 dark:border-dm-border rounded-xl overflow-hidden">
            <button
              onClick={() => setTipOpen((s) => !s)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">💰</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">
                    {TEXT.carts.deliveryPartnerTip}
                    {selectedTip > 0 && (
                      <span className="ml-1.5 text-primary-700">+{settings.currencyCode}{selectedTip}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {TEXT.carts.tipGoesTo}
                  </p>
                </div>
              </div>
              <FiChevronLeft
                size={14}
                className={cn(
                  "text-gray-400 transition-transform",
                  tipOpen ? "rotate-90" : "-rotate-90",
                )}
              />
            </button>
            {tipOpen && (
              <div className="px-4 pb-3 border-t border-gray-100 dark:border-dm-border">
                <div className="flex gap-2 mt-2">
                  {[10, 20, 30, 50].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSelectedTip(selectedTip === amt ? 0 : amt)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors focus:outline-none focus:ring-2",
                        selectedTip === amt
                          ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-dm-surface2"
                          : "border-gray-200 dark:border-dm-border text-gray-700 dark:text-dm-text hover:border-primary-400",
                      )}
                    >
                      {settings.currencyCode}{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FOOTER CHECKOUT BUTTON ── */}
        <div className="flex-shrink-0 border-t border-gray-100 dark:border-dm-border bg-white dark:bg-dm-surface">
          {/* Selected address strip */}
          {selectedAddr && (
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100 dark:border-dm-border bg-gray-50 dark:bg-dm-surface2">
              <div className="flex items-center gap-2 min-w-0">
                <FiMapPin size={13} className="text-primary-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 dark:text-dm-muted leading-none mb-0.5">{TEXT.carts.deliveringTo}</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-dm-text truncate">
                    {[selectedAddr.address, selectedAddr.area, selectedAddr.city].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddress(true)}
                className="text-[10px] font-bold text-primary-700 hover:text-primary-800 flex-shrink-0"
              >
                {TEXT.common.change}
              </button>
            </div>
          )}

          <div className="p-4">
            {cart.items.length === 0 ? (
              <button
                onClick={closeCart}
                className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 bg-primary"
              >
                {TEXT.common.startShopping}
              </button>
            ) : selectedAddr ? (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 bg-primary"
              >
                {TEXT.carts.payNow(toPay)}
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 bg-primary"
              >
                {TEXT.carts.addAddressToProceed}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
