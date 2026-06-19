"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { TEXT } from "@/branding";

export default function LoginClient() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { toast.error("Enter your email"); return; }
    if (!password.trim()) { toast.error("Enter your password"); return; }
    setLoading(true);
    try {
      const res = await authService.normalLogin(email.trim(), password);
      if (res.status === 200 && res.result?.[0]) {
        const user = authService.persistUser(res.result[0]);
        login(user, String(res.result[0].id));
        toast.success(TEXT.auth.loginSuccess);
        router.push("/");
      } else {
        toast.error(res.message || "Invalid email or password");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-dm-surface rounded-2xl shadow-card p-8 animate-fade-in">
      <h1 className="text-2xl font-black text-gray-800 dark:text-dm-text font-display mb-1">{TEXT.auth.welcomeBack}</h1>
      <p className="text-gray-400 dark:text-dm-muted text-sm mb-6">{TEXT.auth.loginSubtitle}</p>

      <div className="space-y-4">
        <div className="relative">
          <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="email" placeholder={TEXT.auth.emailFieldPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" autoFocus />
        </div>

        <div className="relative">
          <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type={showPass ? "text" : "password"} placeholder={TEXT.auth.passwordFieldPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-dm-border dark:bg-dm-surface2 dark:text-dm-text rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>


        <button onClick={handleLogin} disabled={loading}
          className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? TEXT.auth.signingIn : TEXT.auth.signInBtn}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-dm-muted mt-5">
        {TEXT.auth.noAccount}{" "}
        <Link href="/auth/register" className="text-primary-700 font-semibold hover:text-primary-800">{TEXT.auth.registerNow}</Link>
      </p>
    </div>
  );
}
