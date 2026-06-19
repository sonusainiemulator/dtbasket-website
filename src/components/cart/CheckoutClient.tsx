"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMapPin, FiPlus, FiCheck, FiCreditCard } from "react-icons/fi";
import { useAddresses } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { profileService } from "@/services/profileService";
import { Address } from "@/types";
import { CONFIG, TEXT } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import toast from "react-hot-toast";

export default function CheckoutClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { cart, clearCart, closeCart } = useCartStore();
  const { isAuthenticated, openModal } = useAuthStore();

  const { settings } = useAppSettings();
  const { data: addrData } = useAddresses();
  const addresses: Address[] = addrData?.result ?? [];

  const [selectedAddr, setSelectedAddr] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(1); // 1=COD 2=Online 3=Wallet
  const [placing, setPlacing] = useState(false);

  // New address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ address: "", area: "", city: "", state: "", country: "India", pincode: "", type: 1 });

  const deliveryFee = cart.subtotal >= CONFIG.freeDeliveryThreshold ? 0 : settings.deliveryCharges;
  const total = cart.subtotal + deliveryFee;

  const handleAddAddress = async () => {
    if (!addrForm.address || !addrForm.city || !addrForm.pincode) { toast.error(TEXT.checkout.fillAddress); return; }
    try {
      const res = await profileService.addAddress({ ...addrForm, mode: "add", latitude: "0", longitude: "0" });
      if (res.status === 200) { toast.success(TEXT.account.addressAdded); setShowAddrForm(false); }
      else toast.error(res.message || TEXT.common.error);
    } catch { toast.error(TEXT.common.error); }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) { openModal(); return; }
    if (cart.items.length === 0) { toast.error(TEXT.checkout.cartEmpty); return; }
    if (!selectedAddr) { toast.error(TEXT.checkout.selectAddress); return; }
    setPlacing(true);
    try {
      const itemDetails = JSON.stringify(cart.items.map((i) => ({
        item_id: i.product_id,
        quantity: i.quantity,
        delivery_charges: i.product.regular_delivery_charges ?? 0,
        handling_charges: settings.handlingCharges,
        total_price: i.subtotal,
        variation: i.variation ?? {},
      })));
      const res = await orderService.buyOrders({
        item_details: itemDetails,
        customer_address_id: selectedAddr,
        promo_code_id: 0,
        item_total: cart.subtotal,
        total_payable_amount: total,
        handling_charges: settings.handlingCharges,
        donation_amount: 0,
        discount_amount: 0,
        delivery_charges: deliveryFee,
        delivery_instructor_id: 0,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 1 ? 0 : 1,
      });
      if (res.status === 200) {
        clearCart();
        closeCart();
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
        toast.success(TEXT.checkout.orderPlacedSuccess);
        router.push("/account/orders");
      } else {
        toast.error(res.message || TEXT.common.error);
      }
    } catch { toast.error(TEXT.common.error); }
    finally { setPlacing(false); }
  };

  const addrTypes: Record<number, string> = { 1: TEXT.carts.addressHome, 2: TEXT.carts.addressWork, 3: TEXT.carts.addressOther };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-700 mb-3">{TEXT.checkout.cartEmpty}</h2>
        <button onClick={() => router.push("/")} className="btn-primary">{TEXT.carts.continueShopping}</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Address + Payment */}
      <div className="lg:col-span-2 space-y-5">

        {/* Delivery Address */}
        <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-dm-text flex items-center gap-2"><FiMapPin size={18} className="text-primary-600" /> {TEXT.checkout.deliveryAddress}</h2>
            <button onClick={() => setShowAddrForm(!showAddrForm)} className="text-sm text-primary-700 font-semibold flex items-center gap-1 hover:text-primary-800">
              <FiPlus size={15} /> {TEXT.checkout.addNew}
            </button>
          </div>

          {/* Add Address Form */}
          {showAddrForm && (
            <div className="bg-gray-50 dark:bg-dm-surface2 rounded-xl p-4 mb-4 space-y-3 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-dm-text mb-2">{TEXT.checkout.newAddressHeadline}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "address", label: TEXT.carts.fieldFullAddress, full: true },
                  { key: "area", label: TEXT.carts.fieldArea },
                  { key: "city", label: TEXT.carts.fieldCity },
                  { key: "state", label: TEXT.common.state },
                  { key: "pincode", label: TEXT.carts.fieldPincode },
                ].map(({ key, label, full }) => (
                  <input key={key} placeholder={label} value={addrForm[key as keyof typeof addrForm] as string}
                    onChange={(e) => setAddrForm((f) => ({ ...f, [key]: e.target.value }))}
                    className={`px-3 py-2.5 border-2 border-gray-200 dark:border-dm-border rounded-xl text-sm focus:outline-none focus:border-primary-300 dark:bg-dm-surface2 dark:text-dm-text ${full ? "sm:col-span-2" : ""}`}
                  />
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map((t) => (
                  <button key={t} onClick={() => setAddrForm((f) => ({ ...f, type: t }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-colors ${addrForm.type === t ? "bg-primary-700 text-white border-primary-700" : "border-gray-200 text-gray-600"}`}>
                    {addrTypes[t]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddAddress} className="btn-primary text-sm py-2">{TEXT.carts.saveAddress}</button>
                <button onClick={() => setShowAddrForm(false)} className="btn-outline text-sm py-2">{TEXT.common.cancel}</button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{TEXT.checkout.noSavedAddresses}</p>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddr === addr.id ? "border-primary-600 bg-primary-50 dark:bg-dm-surface2" : "border-gray-100 dark:border-dm-border hover:border-gray-200"}`}>
                  <input type="radio" name="address" checked={selectedAddr === addr.id} onChange={() => setSelectedAddr(addr.id)} className="mt-0.5 accent-primary-700 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">{addrTypes[addr.type] ?? "Other"}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{addr.address}</p>
                    <p className="text-xs text-gray-500">{[addr.area, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5">
          <h2 className="font-bold text-gray-800 dark:text-dm-text flex items-center gap-2 mb-4"><FiCreditCard size={18} className="text-primary-600" /> {TEXT.checkout.paymentMethod}</h2>
          <div className="space-y-2">
            {[
              { value: 1, label: TEXT.checkout.paymentCod, icon: "💵" },
              { value: 2, label: TEXT.checkout.paymentOnline, icon: "💳" },
              { value: 3, label: TEXT.checkout.paymentWallet, icon: "👛" },
            ].map(({ value, label, icon }) => (
              <label key={value} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === value ? "border-primary-600 bg-primary-50 dark:bg-dm-surface2" : "border-gray-100 dark:border-dm-border hover:border-gray-200"}`}>
                <input type="radio" name="payment" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="accent-primary-700" />
                <span className="text-base">{icon}</span>
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {value === 1 && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{TEXT.checkout.available}</span>}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div>
        <div className="bg-white dark:bg-dm-surface rounded-xl shadow-card p-5 sticky top-24">
          <h2 className="font-bold text-gray-800 dark:text-dm-text mb-4">{TEXT.carts.orderSummary}</h2>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin mb-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="line-clamp-1 flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                <span className="font-medium flex-shrink-0">{settings.currencyCode}{item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-dm-border pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-dm-muted">
              <span>{TEXT.carts.subtotal}</span><span>{settings.currencyCode}{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-dm-muted">
              <span>{TEXT.checkout.deliveryLabel}</span>
              {deliveryFee === 0 ? <span className="text-green-600 font-medium">{TEXT.carts.freeDelivery}</span> : <span>{settings.currencyCode}{deliveryFee}</span>}
            </div>
            <div className="flex justify-between font-bold text-gray-800 dark:text-dm-text text-lg pt-2 border-t border-gray-100 dark:border-dm-border">
              <span>{TEXT.carts.total}</span>
              <span className="text-primary-700">{settings.currencyCode}{total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={handlePlaceOrder} disabled={placing}
            className="btn-primary w-full justify-center mt-5 py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
            {placing
              ? <span className="flex items-center gap-2"><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{TEXT.checkout.placingOrder}</span>
              : <span className="flex items-center gap-2"><FiCheck size={18} />{TEXT.checkout.placeOrder}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
