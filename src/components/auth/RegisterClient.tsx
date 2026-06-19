"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from "react-icons/fi";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { TEXT } from "@/branding";

export default function RegisterClient() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({
    full_name: "", email: "", mobile_number: "", password: "", confirm_password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { toast.error(TEXT.auth.enterFullName); return; }
    if (!form.email.trim()) { toast.error(TEXT.auth.enterEmail); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error(TEXT.auth.enterValidEmail); return; }
    if (form.mobile_number.length < 10) { toast.error(TEXT.auth.enterValidMobile); return; }
    if (form.password.length < 6) { toast.error(TEXT.auth.passwordMin); return; }
    if (form.password !== form.confirm_password) { toast.error(TEXT.auth.passwordsMismatch); return; }
    if (!agreed) { toast.error(TEXT.auth.agreeTerms); return; }
    setLoading(true);
    try {
      const res = await authService.register({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        mobile_number: form.mobile_number.trim(),
        password: form.password,
      });
      if (res.status === 200 && res.result?.[0]) {
        const user = authService.persistUser(res.result[0]);
        login(user, String(res.result[0].id));
        toast.success(TEXT.auth.registerSuccess);
        router.push("/");
      } else {
        toast.error(res.message || TEXT.auth.registrationFailed);
      }
    } catch {
      toast.error(TEXT.auth.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-dm-surface rounded-2xl shadow-card p-8 animate-fade-in">
      <h1 className="text-2xl font-black text-gray-800 dark:text-dm-text font-display mb-1">{TEXT.auth.createAccountHeadline}</h1>
      <p className="text-gray-400 dark:text-dm-muted text-sm mb-6">{TEXT.auth.registerSubtitle}</p>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={TEXT.auth.fullNamePlaceholder} value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Email */}
        <div className="relative">
          <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" placeholder={TEXT.auth.emailRequiredPlaceholder} value={form.email} onChange={(e) => update("email", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Mobile */}
        <div className="relative">
          <FiPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="tel" placeholder={TEXT.auth.mobileRequiredPlaceholder} value={form.mobile_number} onChange={(e) => update("mobile_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
        </div>

        {/* Password */}
        <div className="relative">
          <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type={showPass ? "text" : "password"} placeholder={TEXT.auth.passwordMinPlaceholder} value={form.password} onChange={(e) => update("password", e.target.value)}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type={showConfirm ? "text" : "password"} placeholder={TEXT.auth.confirmPasswordPlaceholder} value={form.confirm_password} onChange={(e) => update("confirm_password", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-primary-700 flex-shrink-0" />
          <span className="text-xs text-gray-500 dark:text-dm-muted leading-relaxed">
            {TEXT.auth.iAgreeTo} <Link href="/terms" className="text-primary-700 underline">{TEXT.auth.termsOfService}</Link> &amp; <Link href="/privacy-policy" className="text-primary-700 underline">Privacy Policy</Link>
          </span>
        </label>

        <button onClick={handleSubmit} disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed mt-2">
          {loading ? TEXT.auth.creatingAccount : TEXT.auth.createAccountBtn}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-dm-muted mt-5">
        {TEXT.auth.alreadyHaveAccount}{" "}
        <Link href="/auth/login" className="text-primary-700 font-semibold hover:text-primary-800">{TEXT.auth.signInLink}</Link>
      </p>
    </div>
  );
}
