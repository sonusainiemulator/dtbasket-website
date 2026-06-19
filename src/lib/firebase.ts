/**
 * firebase.ts
 * Firebase Phone Authentication — Web SDK v9 (modular)
 * Lazy initialization — Firebase is only created when sendOtp() is first called,
 * so missing env vars do NOT crash the app on page load.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
    Auth,
} from "firebase/auth";

/* ── Module-level state ─────────────────────────────────────────────────────── */
let _auth: Auth | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/* ── Lazy init — only runs when OTP is first requested ─────────────────────── */
function getFirebaseAuth(): Auth {
    if (_auth) return _auth;

    const app: FirebaseApp = getApps().length
        ? getApp()
        : initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
        });

    _auth = getAuth(app);
    _auth.languageCode = "en";
    return _auth;
}

/* ── Send OTP ───────────────────────────────────────────────────────────────── */
export interface SendOtpResult {
    success: boolean;
    message: string;
}

function initRecaptcha(auth: Auth, containerId: string): void {
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
    }
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
        "expired-callback": () => {
            recaptchaVerifier?.clear();
            recaptchaVerifier = null;
        },
    });
}

export async function sendOtp(
    phoneNumber: string,
    containerId = "recaptcha-container",
): Promise<SendOtpResult> {
    try {
        if (!phoneNumber.startsWith("+")) {
            return { success: false, message: "Phone number must be in E.164 format (e.g. +919876543210)" };
        }
        const auth = getFirebaseAuth();
        initRecaptcha(auth, containerId);
        confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier!);
        return { success: true, message: "OTP sent successfully." };
    } catch (error: unknown) {
        recaptchaVerifier?.clear();
        recaptchaVerifier = null;
        const code = (error as { code?: string }).code ?? "";
        return { success: false, message: firebaseErrorMessage(code) };
    }
}

/* ── Verify OTP ─────────────────────────────────────────────────────────────── */
export interface VerifyOtpResult {
    success: boolean;
    message: string;
    uid?: string;
    token?: string;
}

export async function verifyOtp(otp: string): Promise<VerifyOtpResult> {
    try {
        if (!confirmationResult) {
            return { success: false, message: "No OTP request found. Please request OTP again." };
        }
        if (!/^\d{6}$/.test(otp)) {
            return { success: false, message: "OTP must be a 6-digit number." };
        }
        const result = await confirmationResult.confirm(otp);
        const uid = result.user.uid;
        const token = await result.user.getIdToken();
        confirmationResult = null;
        return { success: true, message: "OTP verified successfully.", uid, token };
    } catch (error: unknown) {
        const code = (error as { code?: string }).code ?? "";
        return { success: false, message: firebaseErrorMessage(code) };
    }
}

/* ── Resend OTP ─────────────────────────────────────────────────────────────── */
export async function resendOtp(
    phoneNumber: string,
    containerId = "recaptcha-container",
): Promise<SendOtpResult> {
    return sendOtp(phoneNumber, containerId);
}

/* ── Error message mapping ──────────────────────────────────────────────────── */
function firebaseErrorMessage(code: string): string {
    const map: Record<string, string> = {
        "auth/invalid-phone-number": "Invalid phone number. Use format +91XXXXXXXXXX.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-verification-code": "Invalid OTP. Please check and try again.",
        "auth/code-expired": "OTP has expired. Please request a new one.",
        "auth/quota-exceeded": "SMS quota exceeded. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your connection.",
        "auth/captcha-check-failed": "reCAPTCHA verification failed. Please try again.",
        "auth/missing-phone-number": "Phone number is required.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/invalid-api-key": "Firebase is not configured. Please check your environment variables.",
    };
    return map[code] ?? `Authentication error (${code}). Please try again.`;
}
