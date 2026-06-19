export const API_ENDPOINTS = {
  // ── Auth (matches Flutter apiservice.dart exactly) ────────────────────────
  AUTH: {
    LOGIN: "/login",           // POST type:1(OTP) 2(Google) 3(Apple) 4(Normal)
    REGISTER: "/registration",    // POST full_name email mobile_number password
    FORGOT_PASSWORD: "/forgot_password", // POST email
    ME: "/get_profile",     // POST customer_id
    LOGOUT: "/logout",
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  BANNERS: {
    GET: "/get_banner",                  // POST is_home_screen type_id customer_id
  },

  // ── Home / Sections ───────────────────────────────────────────────────────
  HOME: {
    GENERAL_SETTING: "/general_setting",
    GET_SECTION: "/get_section",          // POST is_home_screen type_id page_no customer_id
    GET_SECTION_DETAILS: "/get_section_details", // POST section_id page_no customer_id
    GET_TYPE: "/get_type",
    GET_OFFERS: "/get_offers",
  },

  // ── Categories ────────────────────────────────────────────────────────────
  CATEGORIES: {
    GET_WITH_SUBCAT: "/get_cat_with_subcat",    // POST category_id page_no
    GET_ITEMS_BY_CAT: "/get_items_by_category",  // POST category_id sub_category_id page_no customer_id
  },

  // ── Products ──────────────────────────────────────────────────────────────
  PRODUCTS: {
    ITEM_DETAILS: "/item_details",         // POST item_id customer_id
    SIMILAR_ITEMS: "/get_similar_items",    // POST item_id customer_id
    TOP_RATING: "/get_top_rating_items", // POST page_no customer_id
    SEARCH: "/search_items",         // POST query page_no customer_id
    TRACK_INTEREST: "/track_intrest",        // POST item_id customer_id
  },

  // ── Cart ──────────────────────────────────────────────────────────────────
  CART: {
    GET: "/get_cart_items",  // POST customer_id
    ADD: "/add_to_cart",     // POST item_id customer_id quantity price variation
    UPDATE: "/update_quantity", // POST item_id customer_id quantity
    REMOVE: "/remove_cart",     // POST item_id customer_id
  },

  // ── Wishlist ──────────────────────────────────────────────────────────────
  WISHLIST: {
    TOGGLE: "/add_remove_wishlist", // POST item_id customer_id
    GET: "/get_wishlist",        // POST customer_id page_no
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  ORDERS: {
    BUY: "/buy_orders",          // POST customer_id item_details ...
    LIST: "/get_customer_orders", // POST customer_id order_status page_no
    STATUSES: "/get_orders_status",
    INVOICE: "/download_invoice",    // POST group_order_id
    SEARCH: "/search_orders",       // POST customer_id query page_no
  },

  // ── Promo Codes ───────────────────────────────────────────────────────────
  PROMO: {
    GET: "/get_promocode",    // POST customer_id page_no
    APPLY: "/apply_promo_code", // POST promo_code_id total_price
  },

  // ── Reviews ───────────────────────────────────────────────────────────────
  REVIEWS: {
    GET: "/get_items_review", // POST item_id
    ADD: "/add_review",       // POST type customer_id content_id rating review image
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  PROFILE: {
    UPDATE: "/update_profile",        // POST customer_id full_name email mobile_number ...
    ADD_ADDRESS: "/add_new_address",       // POST customer_id mode type address ...
    GET_ADDRESS: "/get_customer_address",  // POST customer_id
    EDIT_ADDRESS: "/edit_address",          // POST customer_id address_id ...
    DEL_ADDRESS: "/delete_address",        // POST customer_id address_id
  },

  // ── Wallet / Transactions ─────────────────────────────────────────────────
  WALLET: {
    ADD: "/add_wallet_amount",    // POST customer_id amount transaction_id
    HISTORY: "/get_transaction_list", // POST customer_id page_no
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    GET: "/get_notification",  // POST customer_id page_no
    READ: "/read_notification", // POST customer_id notification_id
  },

  // ── Misc ──────────────────────────────────────────────────────────────────
  MISC: {
    PAGES: "/get_pages",
    SOCIAL_LINKS: "/get_social_link",
    ONBOARDING: "/get_onboarding_screen",
    PAYMENT_OPT: "/get_payment_option",
    DELIVERY_INST: "/get_delivery_instructor",
    IMAGE_UPLOAD: "/image_upload",         // POST type image (multipart)
  },

  PAYMENT: {
    BUY_ORDER: "/buy_order"
  }
} as const;

export const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCT_DETAIL: "product-detail",
  CATEGORIES: "categories",
  FEATURED_CATEGORIES: "featured-categories",
  HERO_BANNERS: "hero-banners",
  PROMO_BANNERS: "promo-banners",
  SECTIONS: "sections",
  CART: "cart",
  WISHLIST: "wishlist",
  ORDERS: "orders",
  USER: "user",
  SEARCH: "search",
  NOTIFICATIONS: "notifications",
  TRANSACTIONS: "transactions",
  ADDRESSES: "addresses",
} as const;
