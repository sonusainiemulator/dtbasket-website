"use client";

import { useState } from "react";
import { useGetPaymentOptions } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { orderService } from "@/services/orderService";
import { FiChevronRight, FiX } from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { COLORS, TEXT } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import type { PaymentOption } from "@/types";

/* ── Payment gateway logos (matches Flutter paymentLogos map) ── */
const PAYMENT_LOGOS: Record<string, string> = {
  inapppurchage: "https://cdn.iconscout.com/icon/free/png-256/free-flutter-logo-icon-svg-download-png-2944876.png",
  paypal: "https://freepngimg.com/download/paypal/2-2-paypal-logo-transparent-png.png",
  razorpay: "https://razorpay.com/assets/razorpay-logo.svg",
  flutterwave: "https://flutterwave.com/images/logo/full.svg",
  payumoney: "https://upload.wikimedia.org/wikipedia/commons/c/cd/PayU.svg",
  paytm: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg",
  stripe: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
  sslcommerz: "https://apps.odoo.com/web/image/loempia.module/220321/icon_image?unique=b1ffa7d",
};

export default function PaymentModal({
  onClose,
  toPay,
  orderPayload,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
  toPay: number;
  orderPayload: {
    item_details: string;
    customer_address_id: number;
    promo_code_id: number;
    item_total: number;
    total_payable_amount: number;
    handling_charges: number;
    donation_amount: number;
    discount_amount: number;
    delivery_charges: number;
    delivery_instructor_id: number;
  };
}) {
  const { data, isLoading } = useGetPaymentOptions();
  const router = useRouter();
  const queryClient = useQueryClient();
  const cartStore = useCartStore();
  const { settings } = useAppSettings();
  const [placing, setPlacing] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  /* result is a keyed object — convert to array and filter visible ones */
  const methods: PaymentOption[] = Object.values(data?.result ?? {}).filter(
    (m) => m.visibility === 1
  );

  /* ── Place order API — mirrors Flutter getPaymentTran ── */
  const getPaymentTran = async (paymentMethod: number, paymentStatus: number) => {
    setPlacing(true);
    try {
      const res = await orderService.buyOrders({
        ...orderPayload,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
      });
      if (res.status === 200) {
        toast.success(res.message || TEXT.checkout.orderPlacedSuccess);
        cartStore.clearCart();
        cartStore.closeCart();
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
        onSuccess?.();
        router.push("/account/orders");
      } else {
        toast.error(res.message || TEXT.common.error);
        setActiveMethod(null);
      }
    } catch {
      toast.error(TEXT.common.error);
      setActiveMethod(null);
    } finally {
      setPlacing(false);
    }
  };

  /* ── Load Razorpay script dynamically, then open checkout ── */
  const openRazorpay = (method: PaymentOption) => {
    const key = method.key_1;
    if (!key) { toast.error(TEXT.payment.gatewayNotConfigured); setActiveMethod(null); return; }

    const launchRazorpay = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).Razorpay !== "function") {
        toast.error(TEXT.payment.gatewayNotConfigured);
        setActiveMethod(null);
        return;
      }
      const options = {
        key,
        amount: toPay * 100,
        currency: settings.currency,
        name: TEXT.appName,
        description: TEXT.payment.orderPayment,
        handler: async () => { await getPaymentTran(2, 1); },
        modal: { ondismiss: () => setActiveMethod(null) },
        theme: { color: COLORS.primary.DEFAULT },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };

    /* Already loaded */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).Razorpay === "function") {
      launchRazorpay();
      return;
    }

    /* Inject script and wait for load */
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = launchRazorpay;
    script.onerror = () => {
      toast.error(TEXT.payment.gatewayNotConfigured);
      setActiveMethod(null);
    };
    document.body.appendChild(script);
  };

  /* ── Route to correct gateway — mirrors Flutter openPayment ── */
  const openPayment = (method: PaymentOption) => {
    const pgName = method.name.toLowerCase();
    setActiveMethod(pgName);

    if (pgName === "razorpay") {
      openRazorpay(method);
    } else {
      /* Stripe, PayPal, Flutterwave etc. — show coming-soon toast */
      toast(`${method.name} coming soon`);
      setActiveMethod(null);
    }
  };

  /* ── COD — paymentMethod=1, paymentStatus=0 ── */
  const handleCOD = async () => {
    setActiveMethod("cod");
    await getPaymentTran(1, 0);
  };

  const Spinner = () => (
    <span className="w-5 h-5 border-2 border-primary-700 border-t-transparent rounded-full animate-spin flex-shrink-0" />
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[80]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dm-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-[420px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dm-border">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-dm-text">{TEXT.payment.selectMethod}</h3>
            <p className="text-xs text-gray-400 dark:text-dm-muted mt-0.5">
              {TEXT.payment.billTotal}: {settings.currencyCode}{toPay}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={placing}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dm-surface2 text-gray-400 dark:text-dm-muted disabled:opacity-40"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            /* Skeleton shimmer — matches Flutter paymentShimmer */
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-dm-surface2 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Online payment gateways */}
              {methods.length > 0 && (
                <div className="bg-gray-50 dark:bg-dm-surface2 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-dm-border">
                  {methods.map((method) => {
                    const pgKey = method.name.toLowerCase();
                    const logo = PAYMENT_LOGOS[pgKey];
                    const isActive = activeMethod === pgKey && placing;

                    return (
                      <button
                        key={method.id}
                        onClick={() => openPayment(method)}
                        disabled={placing}
                        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dm-surface disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* Gateway logo */}
                          <div className="w-12 h-8 bg-white dark:bg-dm-surface2 rounded-md border border-gray-200 dark:border-dm-border flex items-center justify-center p-1 flex-shrink-0">
                            {logo ? (
                              <Image
                                src={logo}
                                alt={method.name}
                                width={40}
                                height={24}
                                className="object-contain w-full h-full"
                                unoptimized
                              />
                            ) : (
                              <span className="text-xs text-gray-400">Pay</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-800 text-sm dark:text-dm-text">{method.name}</span>
                        </div>
                        {isActive ? <Spinner /> : <FiChevronRight size={16} className="text-gray-400" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* COD — always shown, separate card */}
              <div className="bg-gray-50 dark:bg-dm-surface2 rounded-xl overflow-hidden mt-2">
                <button
                  onClick={handleCOD}
                  disabled={placing}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dm-surface disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  <div className="flex items-center gap-3">

                    <span className="font-medium text-gray-800 text-sm dark:text-dm-text">{TEXT.payment.cashOnDelivery}</span>
                  </div>
                  {activeMethod === "cod" && placing
                    ? <Spinner />
                    : <FiChevronRight size={16} className="text-gray-400" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
