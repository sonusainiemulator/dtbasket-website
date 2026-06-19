export const API_ENDPOINTS = {
  // ── Auth (matches Flutter apiservice.dart exactly) ────────────────────────
  AUTH: {
    LOGIN: "/api/customer/login",           // POST type:1(OTP) 2(Google) 3(Apple) 4(Normal)
    REGISTER: "/api/customer/registration",    // POST full_name email mobile_number password
    FORGOT_PASSWORD: "/api/customer/forgot_password", // POST email
    ME: "/api/customer/get_profile",     // POST customer_id
    LOGOUT: "/logout",
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  BANNERS: {
    GET: "/api/customer/get_banner",                  // POST is_home_screen type_id customer_id
  },

  // ── Home / Sections ───────────────────────────────────────────────────────────────
  HOME: {
    GENERAL_SETTING: "/api/customer/general_setting",
    GET_SECTION: "/api/customer/get_section",          // POST is_home_screen type_id page_no customer_id
    GET_SECTION_DETAILS: "/api/customer/get_section_details", // POST section_id page_no customer_id
    GET_TYPE: "/api/customer/get_type",
    GET_OFFERS: "/api/customer/get_offers",
  },

  // ── Categories ────────────────────────────────────────────────────────────
  CATEGORIES: {
    GET_WITH_SUBCAT: "/api/customer/get_cat_with_subcat",    // POST category_id page_no
    GET_ITEMS_BY_CAT: "/api/customer/get_items_by_category",  // POST category_id sub_category_id page_no customer_id
  },

  // ── Products ──────────────────────────────────────────────────────────────
  PRODUCTS: {
    ITEM_DETAILS: "/api/customer/item_details",         // POST item_id customer_id
    SIMILAR_ITEMS: "/api/customer/get_similar_items",    // POST item_id customer_id
    TOP_RATING: "/api/customer/get_top_rating_items", // POST page_no customer_id
    SEARCH: "/api/customer/search_items",         // POST query page_no customer_id
    TRACK_INTEREST: "/api/customer/track_intrest",        // POST item_id customer_id
  },

  // ── Cart ──────────────────────────────────────────────────────────────────
  CART: {
    GET: "/api/customer/get_cart_items",  // POST customer_id
    ADD: "/api/customer/add_to_cart",     // POST item_id customer_id quantity price variation
    UPDATE: "/api/customer/update_quantity", // POST item_id customer_id quantity
    REMOVE: "/api/customer/remove_cart",     // POST item_id customer_id
  },

  // ── Wishlist ──────────────────────────────────────────────────────────────
  WISHLIST: {
    TOGGLE: "/api/customer/add_remove_wishlist", // POST item_id customer_id
    GET: "/api/customer/get_wishlist",        // POST customer_id page_no
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  ORDERS: {
    BUY: "/api/customer/buy_orders",          // POST customer_id item_details ...
    LIST: "/api/customer/get_customer_orders", // POST customer_id order_status page_no
    STATUSES: "/api/customer/get_orders_status",
    INVOICE: "/api/customer/download_invoice",    // POST group_order_id
    SEARCH: "/api/customer/search_orders",       // POST customer_id query page_no
  },

  // ── Promo Codes ───────────────────────────────────────────────────────────
  PROMO: {
    GET: "/api/customer/get_promocode",    // POST customer_id page_no
    APPLY: "/api/customer/apply_promo_code", // POST promo_code_id total_price
  },

  // ── Reviews ───────────────────────────────────────────────────────────────
  REVIEWS: {
    GET: "/api/customer/get_items_review", // POST item_id
    ADD: "/api/customer/add_review",       // POST type customer_id content_id rating review image
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  PROFILE: {
    UPDATE: "/api/customer/update_profile",        // POST customer_id full_name email mobile_number ...
    ADD_ADDRESS: "/api/customer/add_new_address",       // POST customer_id mode type address ...
    GET_ADDRESS: "/api/customer/get_customer_address",  // POST customer_id
    EDIT_ADDRESS: "/api/customer/edit_address",          // POST customer_id address_id ...
    DEL_ADDRESS: "/api/customer/delete_address",        // POST customer_id address_id
  },

  // ── Wallet / Transactions ─────────────────────────────────────────────────
  WALLET: {
    ADD: "/api/customer/add_wallet_amount",    // POST customer_id amount transaction_id
    HISTORY: "/api/customer/get_transaction_list", // POST customer_id page_no
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    GET: "/api/customer/get_notification",  // POST customer_id page_no
    READ: "/api/customer/read_notification", // POST customer_id notification_id
  },

  // ── Misc ──────────────────────────────────────────────────────────────────
  MISC: {
    PAGES: "/api/customer/get_pages",
    SOCIAL_LINKS: "/api/customer/get_social_link",
    ONBOARDING: "/api/customer/get_onboarding_screen",
    PAYMENT_OPT: "/api/customer/get_payment_option",
    DELIVERY_INST: "/api/customer/get_delivery_instructor",
    IMAGE_UPLOAD: "/api/customer/image_upload",         // POST type image (multipart)
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
