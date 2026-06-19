"use client";
import { useEffect, useRef, useState } from "react";
import { FiX, FiArrowLeft, FiCheck, FiPhone, FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authService, FlutterLoginResult } from "@/services/authService";
import { sendOtp, verifyOtp, resendOtp } from "@/lib/firebase";
import { TEXT, CONFIG, COLORS, IMAGES } from "@/branding";
import toast from "react-hot-toast";
import SafeImage from "@/components/ui/SafeImage";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Step = "choose" | "phone" | "otp" | "email" | "forgot" | "register";

/* ─── OTP Input ──────────────────────────────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const length = CONFIG.otpLength;
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/, "").slice(-1);
    const arr = value.split("").concat(Array(length).fill("")).slice(0, length);
    arr[i] = digit;
    onChange(arr.join(""));
    if (digit && i < length - 1) inputs.current[i + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (paste) {
      onChange(paste.padEnd(length, ""));
      inputs.current[Math.min(paste.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex gap-3" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-11 h-11 rounded-full text-center text-lg font-bold focus:outline-none transition-all disabled:opacity-50"
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            border: value[i] ? "2px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.4)",
            color: "#fff",
            caretColor: "#fff",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Countdown ──────────────────────────────────────────────────────────────── */
function Countdown({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const iv = setInterval(() => setLeft((s) => { if (s <= 1) { clearInterval(iv); onEnd(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(iv);
  }, [seconds, onEnd]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return <span className="font-mono font-bold text-white">{mm}:{ss}</span>;
}

/* ─── Right Panel ────────────────────────────────────────────────────────────── */
function RightPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-5 p-8 bg-white dark:bg-dm-surface rounded-r-2xl relative min-w-[240px]">
      <button onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dm-surface2 text-gray-500 dark:text-dm-muted transition-colors"
        aria-label="Close">
        <FiX size={18} />
      </button>

      {/* DTBasket icon */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ backgroundColor: COLORS.splash }}>
        <SafeImage
          src={IMAGES.appLogo}
          alt="DTBasket logo"
          width={724}
          height={188}
          className="w-full h-auto object-contain"
          priority
        />
      </div >

      <div className="text-center">
        <p className="font-bold text-primary-700 leading-snug">{TEXT.auth.rightPanel.headline}</p>
        <p className="text-sm text-gray-400 dark:text-dm-muted mt-1">{TEXT.auth.rightPanel.subline}</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <a href={TEXT.appStore.googlePlay} target="_blank"
          className="">
          <SafeImage
            src={IMAGES.playStore}
            alt="Get it on Google Play"
            width={720}
            height={211}
            className="w-full h-auto object-contain"
            priority
          />
        </a>
        <a href={TEXT.appStore.appStore} target="_blank"
          className="">
          <SafeImage
            src={IMAGES.appStore}
            alt="Download on the App Store"
            width={720}
            height={211}
            className="w-full h-auto object-contain"
            priority
          />
        </a>
      </div>
    </div >
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────────── */
export default function AuthModal() {
  const { isModalOpen, closeModal, login } = useAuthStore();

  // Steps: choose → phone → otp  {TEXT.auth.or}  choose → email
  const [step, setStep] = useState<Step>("choose");
  const [phone, setPhone] = useState("");
  const [countryCode] = useState(CONFIG.countryCode);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [regForm, setRegForm] = useState({ full_name: "", email: "", mobile_number: "", password: "", confirm_password: "" });
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regAgreed, setRegAgreed] = useState(false);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    if (!isModalOpen) setTimeout(() => { setStep("choose"); setPhone(""); setOtp(""); setEmail(""); setPassword(""); setForgotEmail(""); setForgotSent(false); setRegForm({ full_name: "", email: "", mobile_number: "", password: "", confirm_password: "" }); setRegAgreed(false); }, 300);
    return () => { document.body.style.overflow = ""; };
  }, [isModalOpen]);

  // Auto-verify OTP when all digits filled
  useEffect(() => {
    if (otp.replace(/\s/g, "").length === CONFIG.otpLength && step === "otp") {
      handleVerifyAndLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  /* ── Persist login result ── */
  const persistLogin = (result: FlutterLoginResult) => {
    const user = authService.persistUser(result);
    login(user, String(result.id)); // use customer_id as token for API calls
    toast.success(`Welcome${result.full_name ? `, ${result.full_name.split(" ")[0]}` : ""}! 🎉`);
    closeModal();
  };

  /* ── Step 1: Send OTP via Firebase ── */
  const handleSendOtp = async () => {
    if (phone.length < 10) { toast.error(TEXT.auth.enterValidPhone); return; }
    if (!agreedTerms) { toast.error(TEXT.auth.agreeTerms); return; }
    setLoading(true);
    try {
      const e164 = `${countryCode}${phone}`;
      const result = await sendOtp(e164, "recaptcha-container");
      if (result.success) {
        setStep("otp");
        setCanResend(false);
        setCountdownKey((k) => k + 1);
        toast.success(`OTP sent to ${countryCode} ${phone}`);
      } else {
        toast.error(result.message || TEXT.auth.otpSendFailed);
      }
    } catch {
      toast.error(TEXT.auth.otpSendFailed);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP via Firebase, then login to backend ── */
  const handleVerifyAndLogin = async () => {
    if (otp.replace(/\s/g, "").length < CONFIG.otpLength) return;
    setLoading(true);
    try {
      // Step 2a: Verify OTP with Firebase
      const firebaseResult = await verifyOtp(otp);
      if (!firebaseResult.success) {
        toast.error(firebaseResult.message || TEXT.auth.verifyFailed);
        setOtp("");
        return;
      }
      // Step 2b: Register / login with backend using type=1
      const res = await authService.loginWithOTP(phone, countryCode, "India");
      if (res.status === 200 && res.result?.[0]) {
        persistLogin(res.result[0]);
      } else {
        toast.error(res.message || TEXT.auth.verifyFailed);
        setOtp("");
      }
    } catch {
      toast.error(TEXT.auth.verifyFailed);
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  /* ── Email/password login (type=4) ── */
  const handleEmailLogin = async () => {
    if (!email.trim()) { toast.error(TEXT.auth.enterEmail); return; }
    const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(email);
    if (!emailValid) { toast.error(TEXT.auth.enterValidEmail); return; }
    if (password.length < 6) { toast.error(TEXT.auth.passwordMin); return; }
    if (!agreedTerms) { toast.error(TEXT.auth.agreeTerms); return; }
    setLoading(true);
    try {
      const res = await authService.normalLogin(email.trim(), password);
      if (res.status === 200 && res.result?.[0]) {
        persistLogin(res.result[0]);
      } else {
        toast.error(res.message || TEXT.auth.invalidCredentials);
      }
    } catch {
      toast.error(TEXT.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  /* ── Forgot password ── */
  const handleForgotPassword = async () => {
    const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(forgotEmail.trim());
    if (!forgotEmail.trim() || !emailValid) { toast.error(TEXT.auth.enterValidEmail); return; }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail.trim());
      if (res.status === 200) {
        setForgotSent(true);
      } else {
        toast.error(res.message || TEXT.auth.loginFailed);
      }
    } catch {
      toast.error(TEXT.auth.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP via Firebase ── */
  const handleResend = async () => {
    setOtp(""); setCanResend(false); setCountdownKey((k) => k + 1);
    try {
      const e164 = `${countryCode}${phone}`;
      const result = await resendOtp(e164, "recaptcha-container");
      if (result.success) {
        toast.success(TEXT.auth.otpResent);
      } else {
        toast.error(result.message || TEXT.auth.otpResendFailed);
      }
    } catch { toast.error(TEXT.auth.otpResendFailed); }
  };

  /* ── Register ── */
  const handleRegister = async () => {
    if (!regForm.full_name.trim()) { toast.error(TEXT.auth.enterFullName); return; }
    if (!regForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) { toast.error(TEXT.auth.enterValidEmail); return; }
    if (regForm.mobile_number.length < 10) { toast.error(TEXT.auth.enterValidMobile); return; }
    if (regForm.password.length < 6) { toast.error(TEXT.auth.passwordMin); return; }
    if (regForm.password !== regForm.confirm_password) { toast.error(TEXT.auth.passwordsMismatch); return; }
    if (!regAgreed) { toast.error(TEXT.auth.agreeTerms); return; }
    setLoading(true);
    try {
      const res = await authService.register({
        full_name: regForm.full_name.trim(),
        email: regForm.email.trim(),
        mobile_number: regForm.mobile_number.trim(),
        password: regForm.password,
      });
      if (res.status === 200 && res.result?.[0]) {
        persistLogin(res.result[0]);
      } else {
        toast.error(res.message || TEXT.auth.registrationFailed);
      }
    } catch {
      toast.error(TEXT.auth.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  if (!isModalOpen) return null;

  const primaryBg = COLORS.primary.DEFAULT;
  const splashYellow = COLORS.splash;

  return (
    <>
      {/* Hidden reCAPTCHA container — required by Firebase invisible reCAPTCHA */}
      <div id="recaptcha-container" />

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={closeModal} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-[680px] rounded-2xl overflow-hidden shadow-2xl animate-bounce-in flex"
          style={{ minHeight: 380 }}
          onClick={(e) => e.stopPropagation()}>

          {/* ── LEFT PANEL ── */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-10" style={{ backgroundColor: primaryBg }}>

            {/* ───── CHOOSE STEP ───── */}
            {step === "choose" && (
              <div className="space-y-5">
                {/* Logo badge */}
                <div className="inline-flex px-3 py-1.5 rounded-lg" style={{ backgroundColor: splashYellow }}>
                  <SafeImage
                    src={IMAGES.appLogo}
                    alt="DTBasket logo"
                    width={724}
                    height={188}
                    className="w-32 h-auto object-contain"
                    priority
                  />
                </div>
                <h2 className="text-2xl font-bold text-white leading-snug">
                  {TEXT.auth.phoneStep.headline}
                </h2>

                {/* Phone login button */}
                <button
                  onClick={() => setStep("phone")}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-900 flex items-center justify-center gap-3 transition-all hover:opacity-90"
                  style={{ backgroundColor: splashYellow }}>
                  <FiPhone size={18} />
                  {TEXT.auth.continueWithPhone}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/20" />
                  <span className="text-white/50 text-xs font-medium">{TEXT.auth.or}</span>
                  <div className="flex-1 h-px bg-white/20" />
                </div>

                {/* Email login button */}
                <button
                  onClick={() => setStep("email")}
                  className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-3 border-2 border-white/30 hover:border-white/60 transition-all">
                  <FiMail size={18} />
                  {TEXT.auth.continueWithEmail}
                </button>

                <p className="text-xs text-white/50 text-center leading-relaxed">
                  {TEXT.auth.byContinuing}{" "}
                  <Link href="/terms" className="text-white/80 underline hover:text-white">Terms</Link>{" "}&amp;{" "}
                  <Link href="/privacy-policy" className="text-white/80 underline hover:text-white">Privacy Policy</Link>
                </p>
              </div>
            )}

            {/* ───── PHONE STEP ───── */}
            {step === "phone" && (
              <div className="space-y-5">
                <button onClick={() => setStep("choose")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <FiArrowLeft size={16} />{TEXT.auth.back}
                </button>
                <h2 className="text-2xl font-bold text-white">{TEXT.auth.enterPhone}</h2>
                <p className="text-white/60 text-sm">{TEXT.auth.sendVerificationCode}</p>

                {/* Phone input */}
                <div className="flex items-center rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.95)" }}>
                  <div className="flex items-center gap-1 pl-4 pr-3 py-3.5 border-r border-gray-200 flex-shrink-0">
                    <span className="text-lg">{CONFIG.countryFlag}</span>
                    <span className="text-sm font-semibold text-gray-700">{countryCode}</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={TEXT.auth.phoneStep.placeholder}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                    autoFocus
                  />
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-white/70 leading-relaxed">
                    {TEXT.auth.iAgreeTo}{" "}
                    <Link href="/terms" className="text-white underline">{TEXT.auth.termsOfService}</Link>{" "}&amp;{" "}
                    <Link href="/privacy-policy" className="text-white underline">Privacy Policy</Link>
                  </span>
                </label>

                <button
                  onClick={handleSendOtp}
                  disabled={loading || phone.length < 10}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: splashYellow }}>
                  {loading ? TEXT.auth.sendingOtp : TEXT.auth.continue}
                </button>
              </div>
            )}

            {/* ───── OTP STEP ───── */}
            {step === "otp" && (
              <div className="space-y-6">
                <button onClick={() => { setStep("phone"); setOtp(""); }}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <FiArrowLeft size={16} />{TEXT.auth.back}
                </button>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{TEXT.auth.otpVerification}</h2>
                  <p className="text-white/70 text-sm">
                    {TEXT.auth.otpSentTo2}{" "}
                    <span className="text-white font-semibold">{countryCode} {phone}</span>
                  </p>
                </div>

                {/* 6-box OTP input */}
                <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                {/* Countdown */}
                <div className="flex items-center gap-2 text-sm">
                  {!canResend ? (
                    <span className="text-white/60">
                      {TEXT.auth.resendIn}{" "}
                      <Countdown key={countdownKey} seconds={CONFIG.otpExpirySeconds} onEnd={() => setCanResend(true)} />
                    </span>
                  ) : null}
                </div>

                {/* Verify button */}
                <button
                  onClick={handleVerifyAndLogin}
                  disabled={loading || otp.replace(/\s/g, "").length < CONFIG.otpLength}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-900 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: splashYellow }}>
                  {loading
                    ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    : <FiCheck size={18} />}
                  {loading ? TEXT.auth.verifying : TEXT.auth.verifyOtp}
                </button>

                {/* Resend link */}
                <p className="text-sm text-white/60 text-center">
                  {TEXT.auth.didntGetIt}{" "}
                  {canResend
                    ? <button onClick={handleResend} className="text-white font-semibold underline hover:text-yellow-200">{TEXT.auth.resendOtp}</button>
                    : <span className="text-white/30">{TEXT.auth.resendOtp}</span>}
                </p>
              </div>
            )}

            {/* ───── EMAIL STEP ───── */}
            {step === "email" && (
              <div className="space-y-4">
                <button onClick={() => setStep("choose")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <FiArrowLeft size={16} />{TEXT.auth.back}
                </button>

                <h2 className="text-2xl font-bold text-white">{TEXT.auth.signInWithEmail}</h2>

                {/* Email */}
                <div className="relative">
                  <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input
                    type="email"
                    placeholder={TEXT.auth.emailAddress}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
                    autoFocus
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={TEXT.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                    className="w-full pl-10 pr-10 py-3.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
                  />
                  <button onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted hover:text-gray-600">
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Forgot password */}
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setForgotSent(false); setStep("forgot"); }}
                  className="block w-full text-right text-xs text-yellow-200 hover:text-white transition-colors">
                  {TEXT.auth.forgotPassword}
                </button>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-white/70 leading-relaxed">
                    {TEXT.auth.iAgreeTo} <Link href="/terms" className="text-white underline">Terms</Link> &amp; <Link href="/privacy-policy" className="text-white underline">Privacy Policy</Link>
                  </span>
                </label>

                {/* Login button */}
                <button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: splashYellow }}>
                  {loading ? TEXT.auth.signingIn : TEXT.auth.signInTitle}
                </button>

                {/* Register link */}
                <p className="text-center text-xs text-white/60">
                  {TEXT.auth.noAccount}{" "}
                  <button onClick={() => setStep("register")} className="text-white font-semibold underline hover:text-yellow-200">
                    {TEXT.auth.registerNow}
                  </button>
                </p>
              </div>
            )}
            {/* ───── REGISTER STEP ───── */}
            {step === "register" && (
              <div className="space-y-3">
                <button onClick={() => setStep("email")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <FiArrowLeft size={16} />{TEXT.auth.back}
                </button>
                <h2 className="text-xl font-bold text-white">{TEXT.auth.createAccountHeadline}</h2>

                {/* Full Name */}
                <div className="relative">
                  <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input type="text" placeholder={TEXT.auth.fullNamePlaceholder} value={regForm.full_name}
                    onChange={(e) => setRegForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }} autoFocus />
                </div>

                {/* Email */}
                <div className="relative">
                  <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input type="email" placeholder={TEXT.auth.emailRequiredPlaceholder} value={regForm.email}
                    onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }} />
                </div>

                {/* Mobile */}
                <div className="relative">
                  <FiPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input type="tel" placeholder={TEXT.auth.mobileRequiredPlaceholder} value={regForm.mobile_number}
                    onChange={(e) => setRegForm((f) => ({ ...f, mobile_number: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }} />
                </div>

                {/* Password */}
                <div className="relative">
                  <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input type={showRegPass ? "text" : "password"} placeholder={TEXT.auth.passwordMinPlaceholder} value={regForm.password}
                    onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }} />
                  <button type="button" onClick={() => setShowRegPass((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted hover:text-gray-600">
                    {showRegPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                  <input type={showRegConfirm ? "text" : "password"} placeholder={TEXT.auth.confirmPasswordPlaceholder} value={regForm.confirm_password}
                    onChange={(e) => setRegForm((f) => ({ ...f, confirm_password: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.95)" }} />
                  <button type="button" onClick={() => setShowRegConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted hover:text-gray-600">
                    {showRegConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={regAgreed} onChange={(e) => setRegAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded accent-yellow-400 flex-shrink-0" />
                  <span className="text-xs text-white/70 leading-relaxed">
                    {TEXT.auth.iAgreeTo}{" "}
                    <Link href="/terms" className="text-white underline">{TEXT.auth.termsOfService}</Link> &amp; <Link href="/privacy-policy" className="text-white underline">Privacy Policy</Link>
                  </span>
                </label>

                <button onClick={handleRegister} disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: splashYellow }}>
                  {loading ? TEXT.auth.creatingAccount : TEXT.auth.createAccountBtn}
                </button>

                <p className="text-center text-xs text-white/60">
                  {TEXT.auth.alreadyHaveAccount}{" "}
                  <button onClick={() => setStep("email")} className="text-white font-semibold underline hover:text-yellow-200">
                    {TEXT.auth.signInLink}
                  </button>
                </p>
              </div>
            )}
            {/* ───── FORGOT PASSWORD STEP ───── */}
            {step === "forgot" && (
              <div className="space-y-5">
                <button onClick={() => setStep("email")} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                  <FiArrowLeft size={16} />{TEXT.auth.back}
                </button>

                {!forgotSent ? (
                  <>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{TEXT.auth.forgotPassword}</h2>
                      <p className="text-white/60 text-sm mt-1">{TEXT.auth.forgotPasswordSubtitle}</p>
                    </div>

                    <div className="relative">
                      <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dm-muted" />
                      <input
                        type="email"
                        placeholder={TEXT.auth.emailAddress}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
                        autoFocus
                      />
                    </div>

                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: splashYellow }}>
                      {loading ? TEXT.auth.signingIn : TEXT.auth.sendResetLink}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: splashYellow }}>
                        <FiMail size={26} className="text-gray-900" />
                      </div>
                      <h2 className="text-xl font-bold text-white text-center">{TEXT.auth.emailSentTitle}</h2>
                      <p className="text-white/70 text-sm text-center leading-relaxed">
                        {TEXT.auth.emailSentDesc(forgotEmail)}
                      </p>
                    </div>

                    <button
                      onClick={() => { setForgotSent(false); setForgotEmail(""); }}
                      className="w-full py-3 rounded-xl font-semibold text-white/80 border border-white/30 hover:border-white/60 text-sm transition-all">
                      {TEXT.auth.tryDifferentEmail}
                    </button>

                    <button
                      onClick={() => setStep("email")}
                      className="w-full py-3.5 rounded-xl font-bold text-gray-900 transition-all hover:opacity-90"
                      style={{ backgroundColor: splashYellow }}>
                      {TEXT.auth.backToSignIn}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <RightPanel onClose={closeModal} />
        </div>
      </div>
    </>
  );
}