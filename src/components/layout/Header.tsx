"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SafeImage from "@/components/ui/SafeImage";
import {
  FiMapPin, FiChevronDown, FiUser, FiHeart,
  FiShoppingCart, FiX, FiGrid, FiMenu, FiPackage,
} from "react-icons/fi";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import { useAppDispatch } from "@/store/hooks";
import { syncFromServer as syncCartFromServer } from "@/store/cartSlice";
import { syncWishlist } from "@/store/wishlistSlice";
import { useServerCart, useWishlist, useCategories, useGetType } from "@/hooks/useApi";
import AuthModal from "@/components/auth/AuthModal";
import SearchBar from "./SearchBar";
import { TEXT, IMAGES } from "@/branding";
import toast from "react-hot-toast";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";
import { useAppSettings } from "@/lib/settingsContext";

/* ── Category icon mapping (emoji fallback per name) ──────────────────────── */
const getCatEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("fruit")) return "🍎";
  if (n.includes("vegetable") || n.includes("veggie")) return "🥦";
  if (n.includes("dairy") || n.includes("milk")) return "🥛";
  if (n.includes("bread") || n.includes("bakery")) return "🍞";
  if (n.includes("atta") || n.includes("grain") || n.includes("rice")) return "🌾";
  if (n.includes("spice") || n.includes("masala")) return "🌶";
  if (n.includes("oil") || n.includes("ghee")) return "🫙";
  if (n.includes("dal") || n.includes("pulse") || n.includes("lentil")) return "🫘";
  if (n.includes("drink") || n.includes("juice") || n.includes("beverage")) return "🧃";
  if (n.includes("snack") || n.includes("chip") || n.includes("namkeen")) return "🍟";
  if (n.includes("sweet") || n.includes("chocolate") || n.includes("biscuit")) return "🍫";
  if (n.includes("ice cream") || n.includes("frozen")) return "🍦";
  if (n.includes("household") || n.includes("cleaning")) return "🧹";
  if (n.includes("personal") || n.includes("beauty")) return "💄";
  return "🛒";
};

/* ══════════════════════════════════════════════════════════════════════════════
   ALL CATEGORIES DROPDOWN  (Image 2)
══════════════════════════════════════════════════════════════════════════════ */
/* ── Single category row — sub-cats in right flyout ────────────────────── */
function CategoryRow({ cat, isActive, onToggle, onClose }: {
  cat: Category;
  isActive: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  return (
    <Link
      href={`/categories/${cat.id}/0`}
      onClick={onClose}
      className={`flex items-center justify-between px-5 py-3.5 transition-colors group border-b border-gray-50 dark:border-dm-border ${isActive ? "bg-green-50 dark:bg-dm-surface2" : "hover:bg-green-50 dark:hover:bg-dm-surface2"}`}>

      {/* Icon + name */}
      <div className="flex items-center gap-4 min-w-0">
        {cat.image ? (
          <div className="w-7 h-7 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-50">
            <Image src={cat.image} alt={cat.name} fill className="object-contain p-0.5" sizes="28px" />
          </div>
        ) : (
          <span className="text-xl w-7 text-center flex-shrink-0 opacity-70 group-hover:opacity-100">
            {getCatEmoji(cat.name)}
          </span>
        )}
        <span className={`text-[15px] font-bold transition-colors truncate ${isActive ? "text-green-800 dark:text-dm-text" : "text-gray-800 dark:text-dm-text group-hover:text-green-800"}`}>
          {cat.name}
        </span>
      </div>

      {/* + button */}
      <button
        onClick={handleToggle}
        className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ml-3 ${isActive ? "bg-green-100 border-green-300" : "bg-green-50 border-green-200 hover:bg-green-100"}`}
        aria-label={isActive ? "Collapse" : "Expand subcategories"}>
        <span className="text-green-700 font-bold text-base leading-none select-none">
          {isActive ? "−" : "+"}
        </span>
      </button>
    </Link>
  );
}

/* Sub-cat panel that appears to the RIGHT of the main dropdown */
function SubCatPanel({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const { data, isFetching } = useCategories(cat.id, 1);
  const subCats: Category[] = data?.result ?? [];

  return (
    <div className="ml-1 w-64 bg-white dark:bg-dm-surface rounded-2xl shadow-2xl border border-green-200 dark:border-dm-border overflow-hidden animate-slide-down flex-shrink-0 self-start"
      style={{ maxHeight: "72vh", overflowY: "auto" }}>

      {/* Panel header */}
      <div className="px-4 py-3 bg-green-50 dark:bg-dm-surface2 border-b border-green-100 dark:border-dm-border flex items-center gap-3 sticky top-0">
        {cat.image ? (
          <div className="w-6 h-6 relative rounded overflow-hidden flex-shrink-0">
            <Image src={cat.image} alt={cat.name} fill className="object-contain" sizes="24px" />
          </div>
        ) : (
          <span className="text-base">{getCatEmoji(cat.name)}</span>
        )}
        <span className="text-sm font-bold text-green-900 truncate">{cat.name}</span>
      </div>

      {/* Sub-cat list */}
      {isFetching ? (
        <div className="flex justify-center py-8">
          <span className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : subCats.length === 0 ? (
        <p className="text-sm text-gray-400 px-5 py-4">No sub-categories</p>
      ) : (
        subCats.map(sub => (
          <Link
            key={sub.id}
            href={`/categories/${cat.id}/${sub.id}`}
            onClick={onClose}
            className="flex items-center gap-3 px-5 py-3 hover:bg-green-50 dark:hover:bg-dm-surface2 transition-colors group/sub border-b border-gray-50 dark:border-dm-border">
            {sub.image ? (
              <div className="w-7 h-7 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-50 dark:bg-dm-surface2 border border-green-100 dark:border-dm-border">
                <Image src={sub.image} alt={sub.name} fill className="object-contain p-0.5" sizes="28px" />
              </div>
            ) : (
              <span className="w-7 flex justify-center flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1" />
              </span>
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-dm-text group-hover/sub:text-green-800 transition-colors">
              {sub.name}
            </span>
          </Link>
        ))
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LOCATION MODAL
══════════════════════════════════════════════════════════════════════════════ */
function LocationModal({
  onClose,
  onDetect,
  onManual,
  detecting,
  current,
}: {
  onClose: () => void;
  onDetect: () => void;
  onManual: (city: string, area: string) => void;
  detecting: boolean;
  current: { city?: string; area?: string } | null;
}) {
  const [city, setCity] = useState(current?.city ?? "");
  const [area, setArea] = useState(current?.area ?? "");

  const handleManual = () => {
    if (!city.trim()) return;
    onManual(city.trim(), area.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/40 animate-fade-in px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-bounce-in dark:bg-dm-surface"
        onClick={e => e.stopPropagation()}>

        {/* Header — primary green */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary-700">
          <div className="flex items-center gap-2">
            <FiMapPin size={16} className="text-secondary" />
            <h3 className="font-bold text-white">{TEXT.carts.selectLocation}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-primary-800 rounded-full transition-colors">
            <FiX size={16} className="text-white/80" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current location badge — secondary yellow */}
          {current?.city && (
            <div className="flex items-center gap-2 bg-secondary-100 border border-secondary-300 rounded-xl px-3 py-2.5 dark:bg-dm-surface2 dark:border-dm-surface2 ">
              <FiMapPin size={13} className="text-primary-700 flex-shrink-0 " />
              <p className="text-sm text-gray-800 font-semibold dark:text-white">
                {[current.area, current.city].filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          {/* Detect button — solid primary */}
          <button
            onClick={onDetect}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-sm transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-400">
            {detecting
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FiMapPin size={15} />
            }
            {detecting ? "Detecting…" : TEXT.carts.yourLocation}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Manual entry */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="City *"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleManual()}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors dark:bg-dm-surface2 dark:border-dm-border dark:text-dm-text"
            />
            <input
              type="text"
              placeholder="Area / Locality (optional)"
              value={area}
              onChange={e => setArea(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleManual()}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors dark:bg-dm-surface2 dark:border-dm-border dark:text-dm-text"
            />
            {/* Confirm — secondary yellow */}
            <button
              onClick={handleManual}
              disabled={!city.trim()}
              className="w-full py-2.5 rounded-xl bg-secondary font-bold text-gray-900 text-sm hover:bg-secondary-400 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-secondary-400">
              {TEXT.common.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AllCategoriesDropdown({ onClose }: { onClose: () => void }) {
  const { data } = useCategories(0, 1);
  const categories: Category[] = data?.result ?? [];
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeCat = categories.find(c => c.id === activeId) ?? null;

  return (
    /* Outer wrapper — position:relative so the right panel can anchor to it */
    <div className="absolute left-0 top-full mt-0 z-50 flex items-start">

      {/* ── Left: category list ── */}
      <div
        className="w-72 bg-white dark:bg-dm-surface rounded-2xl shadow-2xl border border-green-200 dark:border-dm-border overflow-hidden animate-slide-down"
        style={{ maxHeight: "72vh", overflowY: "auto" }}>
        {categories.map(cat => (
          <CategoryRow
            key={cat.id}
            cat={cat}
            isActive={activeId === cat.id}
            onToggle={() => setActiveId(prev => prev === cat.id ? null : cat.id)}
            onClose={onClose}
          />
        ))}
      </div>

      {/* ── Right: sub-category flyout — sits next to left panel ── */}
      {activeCat && (
        <SubCatPanel cat={activeCat} onClose={onClose} />
      )}

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN HEADER
══════════════════════════════════════════════════════════════════════════════ */
export default function Header() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, openModal, user } = useAuthStore();
  const { cart, toggleCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const { data } = useGetType();
  const { data: serverCart } = useServerCart();
  const { data: serverWishlist } = useWishlist(1);
  const pathname = usePathname();
  const isHome = pathname === "/" || /^\/\d+$/.test(pathname);
  const { location, loading: locLoading, detectLocation, setManualLocation } = useLocation();
  const { settings } = useAppSettings();
  const [showLocModal, setShowLocModal] = useState(false);
  /* Auto-open location modal on first visit if no location stored */
  useEffect(() => {
    const saved = localStorage.getItem("user_location");
    if (!saved) {
      setShowLocModal(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && serverCart?.result) dispatch(syncCartFromServer(serverCart.result));
  }, [isAuthenticated, serverCart, dispatch]);
  useEffect(() => {
    if (isAuthenticated && serverWishlist?.result) dispatch(syncWishlist(serverWishlist.result));
  }, [isAuthenticated, serverWishlist, dispatch]);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setShowCatMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {/* ── Row 1: Logo + Location + Search + Actions ─────────────────────── */}
      <header className="bg-white dark:bg-dm-background border-b border-gray-100 dark:border-dm-border sticky top-0 z-40">
        <div className="container-custom py-2 md:py-3 flex flex-wrap md:flex-nowrap items-center gap-x-2 md:gap-x-4 gap-y-2">

          {/* Hamburger — mobile only, order 0 (appears before Logo) */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dm-surface2 transition-colors"
            aria-label="Open menu">
            <FiMenu size={22} className="text-gray-700 dark:text-gray-200" />
          </button>

          {/* Logo — order 1 always */}
          <div className="order-1 flex-shrink-0 dark:bg-secondary dark:rounded-lg dark:pl-2 dark:pr-2 dark:pt-1 dark:pb-1">
            <Link href="/" className="flex-shrink-0">
              <SafeImage
                src={IMAGES.appLogo}
                alt="DTBasket logo"
                width={724}
                height={188}
                className="h-8 md:h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Location — lg+ only, order 2 on desktop */}
          <button
            onClick={() => setShowLocModal(true)}
            className="hidden lg:flex lg:order-2 items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-dm-border hover:border-primary-300 transition-colors flex-shrink-0 dark:hover:border-primary-500">
            <FiMapPin size={14} className={location ? "text-primary-600" : "text-gray-400"} />
            <div className="text-left">
              <p className="text-[9px] text-gray-400 leading-none">{TEXT.nav.home}</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-0.5 mt-0.5">
                {location?.city
                  ? [location.area, location.city].filter(Boolean).join(", ")
                  : TEXT.carts.selectLocation}
                <FiChevronDown size={10} className="text-gray-400" />
              </p>
            </div>
          </button>

          {/* Actions — order 2 mobile (ml-auto → right), order 4 desktop */}
          <div className="order-2 md:order-4 ml-auto md:ml-0 flex items-center gap-1 md:gap-2 flex-shrink-0">

            {/* Account */}
            {isAuthenticated ? (
              <Link href="/account"
                className="flex items-center gap-1.5 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors group">
                <FiUser size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-primary-700" />
                <div className="hidden md:block text-left">
                  <p className="text-[10px] text-gray-400 leading-none">Hello,</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">{user?.name?.split(" ")[0] ?? TEXT.nav.account}</p>
                </div>
              </Link>
            ) : (
              <button onClick={openModal}
                className="flex items-center gap-1.5 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors group">
                <FiUser size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-primary-700" />
                <div className="hidden md:block text-left">
                  <p className="text-[10px] text-gray-400 leading-none">Hello,</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">Account</p>
                </div>
              </button>
            )}

            {/* Wishlist */}
            <Link href="/wishlist"
              className="flex items-center gap-1.5 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors group relative">
              <div className="relative">
                <FiHeart size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-primary-700" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary-700 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] text-gray-400 leading-none">Saved</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">Wishlist</p>
              </div>
            </Link>

            {/* Cart */}
            <button onClick={() => isAuthenticated ? toggleCart() : openModal()}
              className="flex items-center gap-1.5 pl-2 md:pl-3 pr-3 md:pr-4 py-2 rounded-lg transition-all bg-secondary">
              <div className="relative">
                <FiShoppingCart size={20} className="text-gray-800" />
                {cart.total_items > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-primary-700 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                    {cart.total_items > 99 ? "99+" : cart.total_items}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[10px] text-gray-700 leading-none">{cart.total_items} item{cart.total_items !== 1 ? "s" : ""}</p>
                <p className="text-xs font-black text-gray-900 leading-tight">{TEXT.cart.title}</p>
              </div>
            </button>
          </div>

          {/* Search — order 3 always: full-width row 2 on mobile, flex-1 inline on desktop */}
          <div className="order-3 w-full md:w-auto md:flex-1 min-w-0">
            <SearchBar />
          </div>

        </div>

        {/* ── Row 2: All Categories + Nav links (scrollable on mobile) ── */}
        {isHome && (
          <div className="hidden md:block border-t border-gray-100 dark:border-dm-border bg-primary dark:bg-dm-primary">
            <div className="flex items-center h-10 max-w-screen-2xl mx-auto">

              {/* All Categories — outside overflow container so dropdown is not clipped */}
              <div ref={catRef} className="relative h-full flex-shrink-0 flex items-center">
                <button
                  onClick={() => setShowCatMenu(s => !s)}
                  className="flex items-center gap-1.5 h-full px-3 md:px-4 font-bold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors">
                  <FiGrid size={15} className="text-white flex-shrink-0" />
                  <span className="whitespace-nowrap hidden sm:inline">{TEXT.nav.allCategories}</span>
                  <FiChevronDown
                    size={13}
                    className={cn("text-white transition-transform duration-200 flex-shrink-0", showCatMenu && "rotate-180")}
                  />
                </button>
                {showCatMenu && (
                  <AllCategoriesDropdown onClose={() => setShowCatMenu(false)} />
                )}
              </div>

              {/* Nav links — scrollable strip; overflow-x-auto is scoped here so dropdown above is unclipped */}
              <div className="flex-1 overflow-x-auto scrollbar-none">
                <nav className="flex items-center h-10">
                  {[
                    { label: TEXT.nav.home, href: "/" },
                    ...(data?.result?.map((a) => ({ label: a.name, href: `/${a.id}` })) || []),
                  ].map(({ label, href }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={label}
                        href={href}
                        className={cn(
                          "px-3 md:px-4 h-10 flex items-center text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
                          isActive ? "bg-secondary text-black" : "text-white/90 hover:text-white hover:bg-green-700"
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

            </div>
          </div>
        )}
      </header>

      {showLocModal && (
        <LocationModal
          current={location}
          detecting={locLoading}
          onClose={() => setShowLocModal(false)}
          onDetect={async () => {
            const result = await detectLocation(settings.googleMapApiKey || undefined);
            if (result.ok) {
              setShowLocModal(false);
              toast.success("Location detected!");
            } else if (result.errorCode === 1) {
              toast.error("Location permission denied. Please allow it in your browser settings, then try again.");
            } else if (result.errorCode === 0) {
              toast.error("Geolocation is not supported by your browser.");
            } else {
              toast.error("Could not get location. Please enter your city manually.");
            }
          }}
          onManual={(city, area) => setManualLocation(city, area)}
        />
      )}
      <AuthModal />

      {/* ── Mobile nav drawer ─────────────────────────────────────────────── */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-dm-surface shadow-2xl flex flex-col animate-slide-right">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary-700 flex-shrink-0">
              <span className="text-white font-bold text-base">{TEXT.appName}</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1.5 rounded-full hover:bg-primary-800 transition-colors"
                aria-label="Close menu">
                <FiX size={18} className="text-white" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto">

              {/* Page nav links */}
              <div className="px-3 pt-3 pb-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">{TEXT.nav.shop}</p>
                {[
                  { label: TEXT.nav.home, href: "/" },
                  ...(data?.result?.map((a) => ({ label: a.name, href: `/${a.id}` })) || []),
                ].map(({ label, href }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setShowMobileMenu(false)}
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-primary-700 font-semibold dark:bg-dm-surface2"
                          : "text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-surface2"
                      )}>
                      {label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 dark:border-dm-border mx-3" />

              {/* Quick links */}
              <div className="px-3 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">{TEXT.nav.account}</p>
                {[
                  { label: TEXT.nav.allCategories, href: "/categories", Icon: FiGrid },
                  { label: TEXT.nav.myAccount,     href: "/account",    Icon: FiUser },
                  { label: TEXT.nav.wishlist,       href: "/wishlist",   Icon: FiHeart },
                  { label: TEXT.nav.orderTracking,  href: "/account/orders", Icon: FiPackage },
                ].map(({ label, href, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-surface2 transition-colors">
                    <Icon size={16} className="text-gray-400 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}