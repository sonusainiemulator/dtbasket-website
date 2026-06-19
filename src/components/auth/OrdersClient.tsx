"use client";
import { TEXT } from "@/branding";
import { useAppSettings } from "@/lib/settingsContext";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiPackage, FiChevronRight, FiCheck, FiChevronDown, FiMapPin, FiUser, FiNavigation, FiX, FiRefreshCw } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { orderService } from "@/services/orderService";
import { cartService } from "@/services/cartService";
import { Order } from "@/types";
import toast from "react-hot-toast";

const ORDER_STATUSES = TEXT.orders.statusLabels;

const statusColor = (v: number) => {
  if (v === 6) return "bg-green-500";
  if (v === 7 || v === 8) return "bg-gray-300";
  if (v === 5) return "bg-blue-500";
  return "bg-amber-400";
};

/* ── Track Order Modal ─────────────────────────────────────────────────────── */
function TrackModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const delivery = order.delivery_assignment?.[0];
  const address = order.address?.[0];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}>
      <div className="relative bg-white rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Map area */}
        <div className="relative h-64 overflow-hidden" style={{ background: "#e8e0d0" }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 680 256">
            <rect width="680" height="256" fill="#e8e0d0" />
            <rect x="200" y="60" width="140" height="80" rx="4" fill="#c8dfc0" />
            <rect x="0" y="120" width="680" height="10" fill="#fff" />
            <rect x="340" y="0" width="10" height="256" fill="#fff" />
            <rect x="460" y="0" width="8" height="256" fill="#f0ece4" />
            <rect x="0" y="50" width="680" height="7" fill="#f0ece4" />
            <rect x="0" y="180" width="680" height="7" fill="#f0ece4" />
            <rect x="160" y="0" width="7" height="256" fill="#f0ece4" />
            <text x="380" y="148" fontSize="13" fontWeight="bold" fill="#555" textAnchor="middle">KUDASAN</text>
            <path d="M575,40 L575,125 L440,125 L400,170 L400,220"
              fill="none" stroke="#1a73e8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="575" cy="40" r="10" fill="#e53935" />
            <text x="575" y="44" fontSize="10" fill="#fff" textAnchor="middle">📍</text>
            <text x="400" y="185" fontSize="22" textAnchor="middle">🛵</text>
          </svg>
          <div className="absolute right-3 bottom-14 flex flex-col gap-1">
            {["+", "−"].map(s => (
              <button key={s} className="w-8 h-8 bg-white dark:bg-dm-surface rounded-lg shadow-md font-bold text-gray-700 dark:text-dm-text flex items-center justify-center text-lg hover:bg-gray-50 dark:hover:bg-dm-surface2">{s}</button>
            ))}
          </div>
          <div className="absolute right-3 bottom-3">
            <button className="w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-primary " >
              <FiNavigation size={16} className="text-white" />
            </button>
          </div>
          <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center">
            <FiX size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Delivery info */}
        <div className="p-4 space-y-3">
          {delivery ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-dm-surface2 overflow-hidden flex-shrink-0">
                  {delivery.delivery_boy_image
                    ? <Image src={delivery.delivery_boy_image} alt="" width={44} height={44} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center"><FiUser size={18} className="text-gray-400 dark:text-dm-muted" /></div>
                  }
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{delivery.delivery_boy_full_name ?? "Delivery Partner"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {delivery.vehicle_name && <span className="text-xs text-gray-500">🛵 {delivery.vehicle_name}</span>}
                    {delivery.vehicle_number && <span className="text-xs text-gray-400 font-mono">{delivery.vehicle_number}</span>}
                  </div>
                </div>
              </div>
              {delivery.delivery_boy_number && (
                <a href={`tel:${delivery.delivery_boy_number}`}
                  className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors">
                  <span className="text-green-600 text-lg">📞</span>
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-dm-surface2 flex items-center justify-center flex-shrink-0">
                <FiUser size={18} className="text-gray-400 dark:text-dm-muted" />
              </div>
              <p className="text-sm text-gray-500">{TEXT.orders.deliveryPartnerUnassigned}</p>
            </div>
          )}

          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-green-800">{TEXT.orders.orderIdPrefix}:</span>
            <span className="text-xs text-green-700 font-mono">{order.group_order_id}</span>
          </div>

          {address && (
            <div className="flex items-start gap-2 bg-gray-50 dark:bg-dm-surface2 rounded-xl px-3 py-2.5">
              <FiMapPin size={13} className="text-primary-700 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600 leading-relaxed">
                {[address.address, address.area, address.city, address.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onTrack,
  onView,
  onReorder,
  isReordering,
}: {
  order: Order;
  onTrack?: (order: Order) => void;
  onView?: (order: Order) => void;
  onReorder?: (order: Order) => void;
  isReordering?: boolean;
}) {
  const { settings } = useAppSettings();
  const status = order.order_status ?? 1;
  const label = ORDER_STATUSES.find(s => s.value === status)?.label ?? "";
  const items = order.items ?? [];
  const isEnd = status === 6 || status === 7 || status === 8;

  return (
    <div className="bg-white dark:bg-dm-surface rounded-xl border border-gray-100  dark:border-dm-surface2 shadow-sm overflow-hidden">
      {/* Card header — tapping this opens details */}
      <div onClick={() => onView?.(order)} className="flex items-center justify-between px-4 pt-4 pb-3 cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
            {items[0]?.item_image
              ? <Image src={items[0].item_image} alt={items[0].item_name ?? "item"} fill className="object-contain p-1" sizes="56px" />
              : <div className="w-full h-full flex items-center justify-center"><FiPackage size={18} className="text-gray-300" /></div>
            }
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              {isEnd
                ? <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${statusColor(status)}`}>
                  <FiCheck size={9} className="text-white stroke-[3]" />
                </span>
                : <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor(status)}`} />
              }
              <p className="text-sm font-bold text-gray-800 dark:text-white">{label}</p>
            </div>
            <p className="text-[11px] text-gray-400">{order.order_date_time}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <span className="text-sm font-bold text-gray-800 dark:text-white">{settings.currencyCode}{order.total_payable_amount}</span>
          <FiChevronRight size={15} className="text-gray-400" />
        </div>
      </div>

      {items.length > 1 && (
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto" onClick={() => onView?.(order)}>
          {items.slice(0, 6).map((item, i) => (
            <div key={i} className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
              {item.item_image
                ? <Image src={item.item_image} alt={item.item_name ?? ""} fill className="object-contain p-0.5" sizes="40px" />
                : <div className="w-full h-full flex items-center justify-center"><FiPackage size={12} className="text-gray-300" /></div>
              }
            </div>
          ))}
          {items.length > 6 && (
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
              +{items.length - 6}
            </div>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="border-t border-gray-100  dark:border-dm-surface2 flex divide-x divide-gray-100 dark:divide-dm-surface2">
        {status === 5 && (
          <button onClick={() => onTrack?.(order)}
            className="flex-1 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 hover:dark:bg-dm-surface2">
            {TEXT.account.trackOrder}
          </button>
        )}
        {status === 6 && (
          <button className="flex-1 py-2.5 text-sm font-semibold text-gray-400 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 hover:dark:bg-dm-surface2">
            {TEXT.account.rateOrder}
          </button>
        )}
        {(status !== 5) && (status !== 6) && (
          <button onClick={() => onView?.(order)}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 hover:dark:bg-dm-surface2">
            {TEXT.orders.orderIdPrefix} #{order.group_order_id}
          </button>
        )}

        {/* Reorder — only for completed orders */}
        {status === 6 && (
          <button
            onClick={() => onReorder?.(order)}
            disabled={isReordering}
            className="flex-1 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 focus:outline-none focus:ring-2 hover:dark:bg-dm-surface2">
            {isReordering
              ? <span className="w-3.5 h-3.5 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
              : <FiRefreshCw size={13} />
            }
            {isReordering ? TEXT.orders.reordering : TEXT.orders.reorder}
          </button>
        )}
      </div>
    </div>
  );
}
function OrderDetails({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const { settings } = useAppSettings();
  const address = order.address?.[0];
  const items = order.items ?? [];
  const [downloading, setDownloading] = useState(false);
  const downloadInvoice = async () => {
    try {
      setDownloading(true);

      const res = await orderService.downloadInvoice(order.group_order_id);

      if (res?.result?.pdf_url) {
        window.open(res.result.pdf_url, "_blank");
      }

    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dm-surface rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-dm-border">
          <h2 className="font-bold text-lg">
            {TEXT.orders.orderIdPrefix} {order.group_order_id}
          </h2>

          <button onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-sm dark:text-dm-text">{TEXT.orders.itemsHeading}</h3>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border dark:border-dm-border rounded-lg p-2 dark:bg-dm-surface2"
            >
              <Image
                src={item.item_image ?? ""}
                alt={item.item_name ?? ""}
                width={60}
                height={60}
                className="object-contain"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold dark:text-dm-text">
                  {item.item_name}
                </p>

                <p className="text-xs text-gray-500 dark:text-dm-muted">
                  {TEXT.orders.qty}: {item.order_quantity}
                </p>
              </div>

              <p className="font-semibold">
                ₹{item.order_quantity_amount}
              </p>
            </div>
          ))}
        </div>

        {/* Address */}
        {address && (
          <div className="p-4 border-t dark:border-dm-border">
            <h3 className="font-semibold text-sm mb-2 dark:text-dm-text">
              {TEXT.orders.deliveryAddress}
            </h3>

            <div className="text-sm text-gray-600 dark:text-dm-muted flex gap-2">
              <FiMapPin className="mt-1" />

              <p>
                {[
                  address.address,
                  address.area,
                  address.city,
                  address.state,
                  address.pincode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="p-4 border-t dark:border-dm-border space-y-2 text-sm dark:text-dm-muted">
          <div className="flex justify-between">
            <span>{TEXT.orders.itemsTotal}</span>
            <span>{settings.currencyCode}{order.item_total}</span>
          </div>

          <div className="flex justify-between">
            <span>{TEXT.orders.deliveryCharges}</span>
            <span>{settings.currencyCode}{order.delivery_charges}</span>
          </div>

          <div className="flex justify-between">
            <span>{TEXT.common.discount}</span>
            <span>-{settings.currencyCode}{order.discount_amount}</span>
          </div>

          <div className="flex justify-between font-bold border-t dark:border-dm-border pt-2 dark:text-dm-text">
            <span>{TEXT.orders.totalPaid}</span>
            <span>{settings.currencyCode}{order.total_payable_amount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t dark:border-dm-border flex gap-3">
          {order.order_status === 6 && (
            <button
              onClick={downloadInvoice}
              disabled={downloading}
              className="flex-1 bg-primary-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                TEXT.orders.downloadInvoice
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg"
          >
            {TEXT.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersClient() {
  const { isAuthenticated, openModal } = useAuthStore();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  /* ── Core fetch — append=false replaces, append=true appends ── */
  const fetchOrders = useCallback(async (page: number, status: number, append: boolean) => {
    try {
      const res = await orderService.getCustomerOrders(status, page);
      const incoming: Order[] = res.result ?? [];
      setHasMore(!!res.more_page);
      setCurrentPage(page);

      if (append) {
        setAllOrders(prev => {
          const ids = new Set(prev.map(o => o.id));
          const newItems = incoming.filter(o => !ids.has(o.id));
          console.log(`Appending ${newItems.length} orders to ${prev.length} existing`);
          return [...prev, ...newItems];
        });
      } else {
        console.log(`Replacing with ${incoming.length} orders`);
        setAllOrders(incoming);
      }
    } catch (e) {
      console.error("fetchOrders error", e);
    } finally {
      setIsLoading(false);
      setIsAppending(false);
    }
  }, []);

  /* Initial load + on filter change */
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setAllOrders([]);
    setCurrentPage(1);
    setHasMore(false);
    fetchOrders(1, statusFilter, false);
  }, [statusFilter, isAuthenticated, fetchOrders]);

  /* Outside click closes dropdown */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLoadMore = () => {
    if (isAppending) return;
    const next = currentPage + 1;
    setIsAppending(true);
    fetchOrders(next, statusFilter, true);   // append=true
  };

  const handleSelect = (value: number) => {
    if (value === statusFilter) { setDropOpen(false); return; }
    setStatusFilter(value);
    setDropOpen(false);
  };

  const handleReorder = async (order: Order) => {
    const items = order.items ?? [];
    if (!items.length) return;

    setReorderingId(order.id);
    try {
      for (const item of items) {
        await cartService.addToCart(
          item.item_id ?? item.id,
          item.order_quantity ?? item.quantity ?? 1,
          item.item_price ?? item.price ?? 0,
          ""
        );
      }
      toast.success(TEXT.orders.reorderSuccess);
      router.push("/checkout");
    } catch {
      toast.error(TEXT.orders.reorderFailed);
    } finally {
      setReorderingId(null);
    }
  };

  const selectedLabel = ORDER_STATUSES.find(s => s.value === statusFilter)?.label ?? "All Orders";

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
          <FiPackage size={36} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{TEXT.account.viewOrders}</h2>
        <p className="text-gray-400 text-sm mb-6">{TEXT.account.ordersSignInSub}</p>
        <button onClick={openModal} className="px-8 py-3 rounded-xl font-bold text-white text-sm bg-primary " >
          {TEXT.auth.signInTitle}
        </button>
      </div>
    );
  }

  return (
    <>
      {trackingOrder && <TrackModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}
      <div className=" mx-auto">

        {/* Header + filter row */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Link href="/account" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <FiChevronRight size={18} className="text-gray-500 rotate-180" />
            </Link>
            <h1 className="text-lg font-bold text-gray-800 dark:text-white">{TEXT.account.myOrder}</h1>
          </div>

          {/* Status filter dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-green-400 transition-colors shadow-sm dark:bg-dm-surface2 dark:border-dm-surface dark:text-white ">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(statusFilter)}`} />
              {selectedLabel}
              <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} />
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden dark:bg-dm-surface2 dark:border-dm-surface" style={{ zIndex: 9999 }}>
                {ORDER_STATUSES.map(s => (
                  <button key={s.value} onClick={() => handleSelect(s.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                    ${statusFilter === s.value ? "bg-green-50 text-green-800 font-semibold" : "text-gray-700 hover:bg-gray-50 font-medium dark:text-white hover:dark:bg-dm-surface"}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(s.value)}`} />
                    {s.label}
                    {statusFilter === s.value && <FiCheck size={13} className="ml-auto text-green-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 dark:bg-dm-surface dark:border-dm-surface ">
                <div className="flex gap-3">
                  <div className="skeleton w-14 h-14 rounded-lg" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="skeleton h-3.5 w-36 rounded" />
                    <div className="skeleton h-3 w-44 rounded" />
                  </div>
                  <div className="skeleton h-4 w-12 rounded self-start" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && allOrders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center dark:bg-dm-surface dark:border-dm-surface">
            <FiPackage size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-base font-bold text-gray-700 mb-1 dark:text-white">{TEXT.account.noOrders}</p>
            <p className="text-sm text-gray-400 mb-6">{TEXT.account.noOrdersSub}</p>
            <Link href="/" className="inline-block px-7 py-2.5 rounded-xl font-bold text-sm text-white bg-primary " >
              {TEXT.common.startShopping}
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!isLoading && allOrders.length > 0 && (
          <>
            <div className="space-y-3">
              {allOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onTrack={setTrackingOrder}
                  onView={setSelectedOrder}
                  onReorder={handleReorder}
                  isReordering={reorderingId === order.id}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button onClick={handleLoadMore} disabled={isAppending}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-full border border-primary-700 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50">
                  {isAppending
                    ? <span className="w-4 h-4 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                    : TEXT.account.loadMore
                  }
                </button>
              </div>
            )}
          </>
        )}
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </>
  );
}