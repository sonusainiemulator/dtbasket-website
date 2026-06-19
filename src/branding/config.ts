export const CONFIG = {
  // Pagination
  paginationLimit: 10,
  searchSuggestLimit: 6,

  // Date / locale
  dateFormat: "DD/MM/YYYY",
  currency: "INR",
  currencySymbol: "₹",

  // Delivery (matches Flutter Constant.deliveryCharges)
  freeDeliveryThreshold: 499,
  deliveryFee: 49,

  // Auth / OTP
  otpLength: 6,
  otpExpirySeconds: 60,    // 1 min for web (Flutter uses 2 min but Firebase limits)

  // Splash
  splashDurationMs: 2400,

  // API
  apiTimeout: 15000,
  queryStaleTime: 5 * 60 * 1000, // 5 min

  // Branding
  themeColor: "#F0C832",       // splash yellow
  countryCode: "+91",
  countryFlag: "🇮🇳",

  // Demo mode (matches Flutter Constant.isDemo)
  isDemo: true,
  demoEmail: "user@user.com",
  demoPassword: "123456",
  demoPhone: "9898989898",
} as const;
