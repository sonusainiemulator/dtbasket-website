"use client";
import { useState } from "react";
import Image from "next/image";
import {
  FiUser, FiPackage, FiMapPin, FiHelpCircle, FiGift,
  FiSettings, FiEdit2, FiChevronRight,
  FiPlus, FiX, FiZap, FiRefreshCw, FiTag,
  FiMoon, FiShare2,
  FiFileText, FiTrash2, FiHome, FiBriefcase,

} from "react-icons/fi";
import { useProfile, useTransactions, useAddresses } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useAppSettings } from "@/lib/settingsContext";
import { useDarkModeContext } from "@/lib/darkModeContext";
import { profileService } from "@/services/profileService";
import { COLORS, TEXT } from "@/branding";
import toast from "react-hot-toast";
import { Address } from "@/types";
import { cn } from "@/lib/utils";
import OrdersClient from "./OrdersClient";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Panel = "orders" | "wallet" | "help" | "referrals" | "addresses" | "settings" | "profile";




/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE 2 – SETTINGS PANEL
══════════════════════════════════════════════════════════════════════════════ */
function SettingsPanel() {
  const { isDark, toggle: toggleDark } = useDarkModeContext();
  const { pages, isLoading } = useAppSettings();

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({ title: TEXT.appName, text: TEXT.tagline, url: window.location.origin })
        .catch(() => null);
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success("App link copied!");
    }
  };

  return (
    <div className="bg-white dark:bg-dm-surface rounded-2xl border border-gray-100 dark:border-dm-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-dm-border">
        <h2 className="text-base font-bold text-gray-800 dark:text-dm-text">{TEXT.account.settings}</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-dm-border">

        {/* Dark Mode */}
        <div className="w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <FiMoon size={18} className="text-gray-400 dark:text-dm-muted" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
          </div>
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className={cn(
              "relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400",
              isDark ? "bg-primary-700" : "bg-gray-300"
            )}>
            <span className={cn(
              "absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200",
              isDark ? "translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Share App */}
        <button onClick={handleShareApp}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group hover:dark:bg-dm-surface2">
          <div className="flex items-center gap-3">
            <FiShare2 size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-dm-muted">Share App</span>
          </div>
          <FiChevronRight size={16} className="text-gray-400 dark:text-dm-muted group-hover:text-gray-600 dark:group-hover:text-dm-text" />
        </button>

        {/* Pages from API — same pattern as footer policies */}
        {isLoading
          ? [1, 2, 3].map((i) => <div key={i} className="px-6 py-4"><div className="skeleton h-4 w-40 rounded" /></div>)
          : pages.map((p) => (
            <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group hover:dark:bg-dm-surface2 ">
              <div className="flex items-center gap-3">
                <FiFileText size={18} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-dm-muted">{p.title}</span>
              </div>
              <FiChevronRight size={16} className="text-gray-400 dark:text-dm-muted group-hover:text-gray-600 dark:group-hover:text-dm-text" />
            </a>
          ))
        }
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE 3 – FAQ / HELP PANEL
══════════════════════════════════════════════════════════════════════════════ */
function HelpPanel() {
  const faqs = TEXT.account.faqItems;
  return (
    <div className="bg-white dark:bg-dm-surface rounded-2xl border border-gray-100 dark:border-dm-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-dm-border">
        <h2 className="text-base font-bold text-gray-800 dark:text-dm-text">{TEXT.account.faqs}</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-dm-border">
        {faqs.map(item => (
          <button key={item}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50  hover:dark:bg-dm-surface2 transition-colors group">
            <span className="text-sm font-medium text-gray-700 dark:text-dm-muted">{item}</span>
            <FiChevronRight size={16} className="text-gray-400 dark:text-dm-muted group-hover:text-gray-600 dark:group-hover:text-dm-text" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE 5 – WALLET PANEL
══════════════════════════════════════════════════════════════════════════════ */
function WalletPanel({ balance }: { balance: number }) {
  const [amount, setAmount] = useState("1000");
  const [selected, setSelected] = useState(1000);
  const [loading, setLoading] = useState(false);
  const { data: txData } = useTransactions(1);
  const txs = txData?.result ?? [];
  const queryClient = useQueryClient();
  const { settings } = useAppSettings();
  const cs = settings.currencyCode;

  const qamts = [
    { v: 500, l: `${cs}500`, popular: false },
    { v: 1000, l: `${cs}1000`, popular: true },
    { v: 2000, l: `${cs}2000`, popular: false },
    { v: 5000, l: `${cs}5000`, popular: false },
  ];
  const features = [
    { Icon: FiZap, label: "Easy & Fast\nPayments" },
    { Icon: FiRefreshCw, label: "Instant\nRefunds" },
    { Icon: FiTag, label: "Exclusive\nOffers" },
  ];

  const handleAdd = async () => {
    const n = Number(amount);
    if (!n || n < 1) { toast.error(TEXT.common.enterValidAmount); return; }
    setLoading(true);
    try {
      const r = await profileService.addWalletAmount(n, `TXN-${Date.now()}`);
      if (r.status === 200) {
        toast.success(`${cs}${n} added!`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      } else toast.error(r.message || TEXT.common.error);
    } catch { toast.error(TEXT.common.error); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Balance card – gradient */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{
        background: `linear-gradient(
  135deg,
  ${COLORS.primary[700]} 0%,
  ${COLORS.primary[600]} 50%,
  ${COLORS.secondary[600]} 100%
)`
      }}>
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs text-white/70 font-medium mb-1">{TEXT.account.availableBalance}</p>
            <p className="text-4xl font-black text-white">{cs}{balance.toFixed(0)}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">🪙</div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5   dark:bg-dm-surface dark:border-dm-surface2">
        <div className="grid grid-cols-3 gap-4 text-center">
          {features.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <Icon size={18} className="text-primary-700" />
              </div>
              <p className="text-xs text-gray-500 leading-tight whitespace-pre-line">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add money */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 dark:bg-dm-surface dark:border-dm-surface2">
        <h3 className="text-sm font-bold text-gray-800 mb-3 dark:text-white">{TEXT.carts.walletTitle}</h3>
        <label className="block text-xs text-gray-400 mb-1.5">{TEXT.carts.enterAmount}</label>
        <input type="number" value={amount}
          onChange={e => { setAmount(e.target.value); setSelected(0); }}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 mb-4 dark:bg-dm-surface2  dark:border-dm-surface2" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {qamts.map(({ v, l, popular }) => (
            <div key={v} className="relative">
              <button onClick={() => { setSelected(v); setAmount(String(v)); }}
                className={cn("w-full py-3 rounded-xl text-sm font-bold border-2 transition-all",
                  selected === v ? "border-primary-700 text-primary-700 bg-green-50 dark:bg-dm-surface2 " : "border-gray-200 text-gray-700 hover:border-primary-300 dark:border-dm-surface2 dark:bg-dm-surface2 dark:text-white")}>
                {l}
              </button>
              {popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase dark:text-white">
                  {TEXT.account.popular}
                </span>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleAdd} disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60
          bg-primary ">
          {loading ? TEXT.carts.proceeding : TEXT.carts.addBalance}
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-dm-surface rounded-2xl border border-gray-100 dark:border-dm-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 text-center">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">{TEXT.carts.recentTransactions}</h3>
        </div>
        {txs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">{TEXT.account.noTransactions}</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50 dark:divide-dm-surface2">
              {txs.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {tx.type === 1 ? TEXT.carts.addedToWallet : TEXT.carts.placedOrder}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tx.transaction_id}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} at{" "}
                      {new Date(tx.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toLowerCase()}
                    </p>
                  </div>
                  <span className={cn("text-sm font-black", tx.type === 1 ? "text-green-600" : "text-red-500")}>
                    {tx.type === 1 ? "+" : "-"}{cs}{tx.price}
                  </span>
                </div>
              ))}
            </div>
            {txs.length > 5 && (
              <div className="px-5 py-3 border-t border-gray-100 text-center dark:border-dm-surface2">
                <button className="text-sm font-semibold text-primary-700">See All →</button>
              </div>
            )}
          </>
        )}
        <div className="border-t border-gray-100 divide-y divide-gray-100 dark:divide-dm-surface2 dark:border-dm-surface2">
          {[{ label: TEXT.account.howItWorks, Icon: FiFileText }, { label: TEXT.account.faqs, Icon: FiHelpCircle }].map(({ label, Icon }) => (
            <button key={label}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group hover:dark:bg-dm-surface2">
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-dm-muted">{label}</span>
              </div>
              <FiChevronRight size={16} className="text-gray-400 dark:text-dm-muted group-hover:text-gray-600 dark:group-hover:text-dm-text" />
            </button>
          ))}
        </div>
      </div>
    </div >
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE 6 – ADDRESSES PANEL  (from Address.png)
   Top: "+ Add New Address" row
   Body: "Saved Addresses" title + cards with Home icon / Office icon + edit + delete
══════════════════════════════════════════════════════════════════════════════ */
function AddNewAddressModal({ onClose, onSaved, data }: {
  onClose: () => void; onSaved: () => void; data: Address | null
}) {
  const [form, setForm] = useState({
    address: data?.address ?? "",
    area: data?.area ?? "",
    city: data?.city ?? "",
    state: data?.state ?? "",
    country: data?.country ?? "India",
    pincode: data?.pincode ?? "",
    type: data?.type ?? 1
  });
  const [loading, setL] = useState(false);
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.address || !form.city || !form.pincode) {
      toast.error(TEXT.carts.fillRequired);
      return;
    }

    setL(true);

    try {
      let r;

      if (data?.id) {
        // EDIT ADDRESS
        r = await profileService.editAddress(data.id, {
          ...form,
          latitude: "0",
          longitude: "0",
        });

      } else {
        // ADD ADDRESS
        r = await profileService.addAddress({
          ...form,
          latitude: "0",
          longitude: "0",
          mode: "add"
        });
      }

      if (r.status === 200) {

        toast.success(
          data?.id
            ? TEXT.account.addressUpdated
            : TEXT.account.addressAdded
        );

        onSaved();
        onClose();

      } else {
        toast.error(r.message || TEXT.common.error);
      }

    } catch {
      toast.error(TEXT.common.error);
    } finally {
      setL(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in " onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-bounce-in dark:bg-dm-surface" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 dark:text-dm-text">{TEXT.account.addNewAddress}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><FiX size={18} /></button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-4">
          {[{ t: 1, l: TEXT.carts.addressHome }, { t: 2, l: TEXT.carts.addressOffice }, { t: 3, l: TEXT.carts.addressOther }].map(({ t, l }) => (
            <button key={t} onClick={() => set("type", t)}
              className={cn("flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors dark:border-dm-surface ",
                form.type === t ? "bg-primary-700 text-white border-primary-700 " : "border-gray-200 text-gray-600 dark:bg-dm-surface2")}>
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {[
            ["address", "Full Address *", "text"],
            ["area", "Area / Locality", "text"],
            ["city", "City *", "text"],
            ["state", "State", "text"],
            ["pincode", "Pincode *", "text"],
          ].map(([k, l]) => (
            <div key={k}>
              <label className="block text-xs font-semibold text-gray-400 mb-1">{l}</label>
              <input value={form[k as keyof typeof form] as string}
                onChange={e => set(k, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400 dark:bg-dm-surface2 dark:border-dm-surface" />
            </div>
          ))}
        </div>
        <button onClick={save} disabled={loading}
          className="w-full mt-5 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50
          bg-primary ">
          {loading ? TEXT.account.saving : data != null ? TEXT.carts.editAddress : TEXT.carts.saveAddress}
        </button>
      </div>
    </div >
  );
}

function AddressesPanel() {
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Address | null>(null);

  const { data, isLoading, refetch } = useAddresses() as unknown as { data: { result: Address[] } | undefined; isLoading: boolean; refetch?: () => void };
  const addresses: Address[] = data?.result ?? [];

  const typeIcon: Record<number, React.ReactNode> = {
    1: <FiHome size={16} className="text-gray-500" />,
    2: <FiBriefcase size={16} className="text-gray-500" />,
    3: <FiMapPin size={16} className="text-gray-500" />,
  };
  const typeName: Record<number, string> = { 1: TEXT.carts.addressHome, 2: TEXT.carts.addressOffice, 3: TEXT.carts.addressOther };

  return (
    <>
      {(showAdd) && <AddNewAddressModal onClose={() => setShowAdd(false)} onSaved={() => refetch?.()} data={addData} />}

      <div className="bg-white dark:bg-dm-surface rounded-2xl border border-gray-100 dark:border-dm-border shadow-sm overflow-hidden">
        {/* Add New Address row */}
        <button onClick={() => { setShowAdd(true); setAddData(null) }}
          className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group hover:dark:bg-dm-surface2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white">
            <FiPlus size={16} className="text-gray-500 dark:text-white" />
            {TEXT.account.addNewAddress}
          </div>
          <FiChevronRight size={16} className="text-gray-400 dark:text-dm-muted group-hover:text-gray-600 dark:group-hover:text-dm-text" />
        </button>

        {/* Saved Addresses */}
        <div className="px-5 py-3">
          <h3 className="text-sm font-bold text-gray-800 mb-3 dark:text-white">{TEXT.account.savedAddresses}</h3>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">{TEXT.account.noAddresses}</p>
          ) : (
            <div className="space-y-2">
              {addresses.map(addr => (
                <div key={addr.id}
                  className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-200 dark:border-dm-border transition-colors dark:bg-dm-surface">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-dm-surface2 flex items-center justify-center flex-shrink-0">
                    {typeIcon[addr.type] ?? typeIcon[3]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 mb-0.5 dark:text-white">{typeName[addr.type] ?? "Other"}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 dark:text-white">
                      {[addr.address, addr.area, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                      onClick={() => { setShowAdd(true); setAddData(addr); }}>
                      <FiEdit2 size={14} className="text-gray-400 hover:text-gray-600" />
                    </button>
                    <button
                      onClick={async () => {
                        const r = await profileService.deleteAddress(addr.id);
                        if (r.status === 200) { toast.success(TEXT.account.addressRemoved); refetch?.(); }
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors">
                      <FiTrash2 size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   IMAGE 7 – PROFILE EDIT PANEL  (from Profile_Edit.png)
   "Profile" title with back arrow
   Name field + Email field + "We promise not to spam you"
   Green Submit button (right-aligned)
   "Delete Account" link + warning text
══════════════════════════════════════════════════════════════════════════════ */
function ProfilePanel({ onBack }: { onBack: () => void }) {
  const { user } = useAuthStore();
  const { data } = useProfile();
  const profile = data?.result?.[0];
  const [loading, setL] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || user?.name || "",
    email: profile?.email || user?.email || "",
    mobile_number: profile?.mobile_number || user?.phone || "",
    country_code: profile?.country_code || "+91",
    country_name: profile?.country_name || "India",
  });

  const save = async () => {
    setL(true);
    try {
      const r = await profileService.updateProfile(form);
      if (r.status === 200) toast.success(TEXT.account.profileUpdated);
      else toast.error(r.message || TEXT.common.error);
    } catch { toast.error(TEXT.common.error); }
    finally { setL(false); }
  };

  return (
    <div className="bg-white dark:bg-dm-surface rounded-2xl border border-gray-100 dark:border-dm-border shadow-sm overflow-hidden">
      {/* Title */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-dm-surface2">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-dm-surface2 rounded-full">
          <FiChevronRight size={16} className="text-gray-500 rotate-180" />
        </button>
        <h2 className="text-base font-bold text-gray-800 dark:text-dm-text">{TEXT.account.profile}</h2>
      </div>

      <div className="p-6">
        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 transition-colors dark:bg-dm-surface2 dark:border-dm-surface"
          />
        </div>

        {/* Email */}
        <div className="mb-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            {TEXT.auth.emailAddress} <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 transition-colors dark:bg-dm-surface2 dark:border-dm-surface"
          />
        </div>
        <p className="text-xs text-gray-400 mb-5">{TEXT.account.noSpam}</p>

        {/* Submit — right aligned */}
        <div className="flex justify-end mb-8">
          <button onClick={save} disabled={loading}
            className="px-10 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60 transition-colors
            bg-primary ">
            {loading ? TEXT.account.saving : TEXT.common.submit}
          </button>
        </div>

        {/* Delete account */}
        <div className="text-center">
          <button className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors mb-2">
            {TEXT.account.deleteAccount}
          </button>
          <p className="text-xs text-gray-400 leading-relaxed">
            {TEXT.account.deleteAccountWarn}
          </p>
        </div>
      </div>
    </div >
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   REFERRALS PANEL
══════════════════════════════════════════════════════════════════════════════ */
function ReferralsPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center dark:bg-dm-surface dark:border-dm-surface2">
      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiGift size={28} className="text-primary-600" />
      </div>
      <p className="text-base font-bold text-gray-700 mb-1 dark:text-white">{TEXT.account.manageReferrals}</p>
      <p className="text-sm text-gray-400">{TEXT.account.referralDesc}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   LEFT SIDEBAR
══════════════════════════════════════════════════════════════════════════════ */
const NAV: { id: Panel; label: string; Icon: React.ElementType }[] = [
  { id: "orders", label: "Orders", Icon: FiPackage },
  { id: "help", label: "Need Help?", Icon: FiHelpCircle },
  { id: "referrals", label: "Manage Referrals", Icon: FiGift },
  { id: "addresses", label: "Addresses", Icon: FiMapPin },
  { id: "settings", label: "Settings", Icon: FiSettings },
];

function Sidebar({ active, onNav, walletBal, onLogout }: {
  active: Panel; onNav: (p: Panel) => void; walletBal: number; onLogout: () => void;
}) {
  const { user } = useAuthStore();
  const { data } = useProfile();
  const { settings } = useAppSettings();
  const cs = settings.currencyCode;
  const profile = data?.result?.[0];

  return (
    <aside className="w-full md:w-80 flex-shrink-0">
      <div className="bg-white dark:bg-dm-surface rounded-2xl border border-gray-100 dark:border-dm-border shadow-sm overflow-hidden">

        {/* User row */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-dm-surface2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profile?.image
                ? <Image src={profile.image} alt="" width={44} height={44} className="object-cover" />
                : <FiUser size={22} className="text-primary-600" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight dark:text-white ">{user?.name ?? "User"}</p>
              <p className="text-xs text-gray-500 mt-0.5 dark:text-white">{profile?.country_code ?? "+91"} {profile?.mobile_number ?? user?.phone ?? ""}</p>
            </div>
          </div>
          <button onClick={() => onNav("profile")} className="p-2 hover:bg-gray-100 dark:hover:bg-dm-surface2 rounded-full transition-colors" aria-label="Edit profile">
            <FiEdit2 size={15} className="text-gray-400" />
          </button>
        </div>

        {/* Wallet card */}
        <div className="mx-4 my-3 rounded-xl overflow-hidden border border-gray-100 dark:border-dm-surface">
          <button onClick={() => onNav("wallet")}
            className="w-full flex items-center justify-between px-3.5 py-2.5
            bg-primary ">
            <div className="flex items-center gap-2">
              <span className="text-sm">💳</span>
              <span className="text-sm font-bold text-white">{TEXT.account.walletCard}</span>
            </div>
            <FiChevronRight size={15} className="text-white/70" />
          </button>
          <div className="bg-gray-50 px-3.5 py-2.5 flex items-center justify-between dark:bg-dm-surface2">
            <p className="text-xs text-gray-600 dark:text-white">{TEXT.account.availableBalance}: <span className="font-bold text-gray-800 dark:text-white">{cs}{walletBal.toFixed(0)}</span></p>
            <button onClick={() => onNav("wallet")}
              className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-black" >
              {TEXT.account.addBalance}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 pb-2">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => onNav(id)}
              className={cn("w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all",
                active === id ? "bg-green-50 text-primary-700 font-semibold dark:bg-dm-surface2" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-white hover:dark:bg-dm-surface2 ")}>
              <Icon size={17} className={active === id ? "text-primary-700" : "text-gray-400"} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button onClick={onLogout}
            className="w-full py-2.5 rounded-xl border-2 border-primary-700 text-primary-700 text-sm font-bold hover:bg-primary-50 transition-colors">
            {TEXT.account.signOut}
          </button>
        </div>

        {/* App version */}
        <div className="border-t border-gray-100 py-3 text-center dark:border-dm-surface2">
          <p className="text-[24px] font-bold text-gray-400 mt-1">{TEXT.appName}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{TEXT.version}</p>
        </div>
      </div>
    </aside >
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
export default function AccountClient() {
  const { isAuthenticated, logout, openModal } = useAuthStore();
  const [active, setActive] = useState<Panel>("orders");
  const [mobileView, setMobileView] = useState<"sidebar" | "panel">("sidebar");

  const handleNav = (p: Panel) => { setActive(p); setMobileView("panel"); };

  const { data: profileData } = useProfile();
  const walletBal = profileData?.result?.[0]?.wallet_amount ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-5">
          <FiUser size={36} className="text-primary-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{TEXT.account.signInToView}</h2>
        <p className="text-sm text-gray-400 mb-6">{TEXT.account.signInSub}</p>
        <button onClick={openModal}
          className="px-8 py-3 rounded-xl font-bold text-white text-sm bg-primary " >
          {TEXT.auth.signInTitle}
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative flex flex-col md:flex-row gap-5 items-start">
        {/* Sidebar: always visible on md+, toggles on mobile */}
        <div className={cn(" md:block flex-shrink-0", mobileView === "sidebar" ? "block" : "hidden")}>
          <Sidebar
            active={active}
            onNav={handleNav}
            walletBal={walletBal}
            onLogout={() => { logout(); toast.success(TEXT.auth.signedOut); }}
          />
        </div>

        {/* Panel: always visible on md+, toggles on mobile */}
        <main className={cn("flex-1 min-w-0 w-full", mobileView === "panel" ? "block" : "hidden md:block")}>
          <button
            onClick={() => setMobileView("sidebar")}
            className="md:hidden flex items-center gap-1.5 text-sm font-semibold text-primary-700 mb-4 hover:text-primary-800 transition-colors">
            <FiChevronRight size={16} className="rotate-180" />
            {TEXT.common.back}
          </button>
          {active === "orders" && <OrdersClient />}
          {active === "wallet" && <WalletPanel balance={walletBal} />}
          {active === "settings" && <SettingsPanel />}
          {active === "help" && <HelpPanel />}
          {active === "referrals" && <ReferralsPanel />}
          {active === "addresses" && <AddressesPanel />}
          {active === "profile" && <ProfilePanel onBack={() => { setActive("orders"); setMobileView("sidebar"); }} />}
        </main>
      </div>
    </div>
  );
}
