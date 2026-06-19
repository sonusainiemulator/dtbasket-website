export const API_ENDPOINTS = {
  // ── Auth (matches Flutter apiservice.dart exactly) ────────────────────────
  AUTH: {
    LOGIN: "/customer/login",           // POST type:1(OTP) 2(Google) 3(Apple) 4(Normal)
    REGISTER: "/customer/registration",    // POST full_name email mobile_number password
    FORGOT_PASSWORD: "/customer/forgot_password", // POST email
    ME: "/customer/get_profile",     // POST customer_id
    LOGOUT: "/logout",
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  BANNERS: {
    GET: "/customer/get_banner",                  // POST is_home_screen type_id customer_id
  },

  // ── Home / Sections ───────────────────────────────────────────────────────────────
  HOME: {
    GENERAL_SETTING: "/customer/general_setting",
    GET_SECTION: "/customer/get_section",          // POST is_home_screen type_id page_no customer_id
    GET_SECTION_DETAILS: "/customer/get_section_details", // POST section_id page_no customer_id
    GET_TYPE: "/customer/get_type",
    GET_OFFERS: "/customer/get_offers",
  },

  // ── Categories ────────────────────────────────────────────────────────────
  CATEGORIES: {
    GET_WITH_SUBCAT: "/customer/get_cat_with_subcat",    // POST category_id page_no
    GET_ITEMS_BY_CAT: "/customer/get_items_by_category",  // POST category_id sub_category_id page_no customer_id
  },

  // ── Products ──────────────────────────────────────────────────────────────
  PRODUCTS: {
    ITEM_DETAILS: "/customer/item_details",         // POST item_id customer_id
    SIMILAR_ITEMS: "/customer/get_similar_items",    // POST item_id customer_id
    TOP_RATING: "/customer/get_top_rating_items", // POST page_no customer_id
    SEARCH: "/customer/search_items",         // POST query page_no customer_id
    TRACK_INTEREST: "/customer/track_intrest",        // POST item_id customer_id
  },

  // ── Cart ──────────────────────────────────────────────────────────────────
  CART: {
    GET: "/customer/get_cart_items",  // POST customer_id
    ADD: "/customer/add_to_cart",     // POST item_id customer_id quantity price variation
    UPDATE: "/customer/update_quantity", // POST item_id customer_id quantity
    REMOVE: "/customer/remove_cart",     // POST item_id customer_id
  },

  // ── Wishlist ──────────────────────────────────────────────────────────────
  WISHLIST: {
    TOGGLE: "/customer/add_remove_wishlist", // POST item_id customer_id
    GET: "/customer/get_wishlist",        // POST customer_id page_no
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  ORDERS: {
    BUY: "/customer/buy_orders",          // POST customer_id item_details ...
    LIST: "/customer/get_customer_orders", // POST customer_id order_status page_no
    STATUSES: "/customer/get_orders_status",
    INVOICE: "/customer/download_invoice",    // POST group_order_id
    SEARCH: "/customer/search_orders",       // POST customer_id query page_no
  },

  // ── Promo Codes ───────────────────────────────────────────────────────────
  PROMO: {
    GET: "/customer/get_promocode",    // POST customer_id page_no
    APPLY: "/customer/apply_promo_code", // POST promo_code_id total_price
  },

  // ── Reviews ───────────────────────────────────────────────────────────────
  REVIEWS: {
    GET: "/customer/get_items_review", // POST item_id
    ADD: "/customer/add_review",       // POST type customer_id content_id rating review image
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  PROFILE: {
    UPDATE: "/customer/update_profile",        // POST customer_id full_name email mobile_number ...
    ADD_ADDRESS: "/customer/add_new_address",       // POST customer_id mode type address ...
    GET_ADDRESS: "/customer/get_customer_address",  // POST customer_id
    EDIT_ADDRESS: "/customer/edit_address",          // POST customer_id address_id ...
    DEL_ADDRESS: "/customer/delete_address",        // POST customer_id address_id
  },

  // ── Wallet / Transactions ─────────────────────────────────────────────────
  WALLET: {
    ADD: "/customer/add_wallet_amount",    // POST customer_id amount transaction_id
    HISTORY: "/customer/get_transaction_list", // POST customer_id page_no
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    GET: "/customer/get_notification",  // POST customer_id page_no
    READ: "/customer/read_notification", // POST customer_id notification_id
  },

  // ── Misc ──────────────────────────────────────────────────────────────────
  MISC: {
    PAGES: "/customer/get_pages",
    SOCIAL_LINKS: "/customer/get_social_link",
    ONBOARDING: "/customer/get_onboarding_screen",
    PAYMENT_OPT: "/customer/get_payment_option",
    DELIVERY_INST: "/customer/get_delivery_instructor",
    IMAGE_UPLOAD: "/customer/image_upload",         // POST type image (multipart)
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
