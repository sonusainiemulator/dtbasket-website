// ─── Flutter API Base Response ────────────────────────────────────────────────
export interface FlutterResponse<T> {
  status: number;   // 200 = success
  message: string;
  result: T[] | null;
}

export interface FlutterPagedResponse<T> extends FlutterResponse<T> {
  total_rows: number | null;
  total_page: number | null;
  current_page: number | null;
  more_page: boolean | null;
}

// ─── General Setting ──────────────────────────────────────────────────────────
export interface GeneralSettingItem {
  id: number;
  key: string;
  value: string;
}

// ─── Auth / User ──────────────────────────────────────────────────────────────
export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "customer" | "admin" | "vendor";
  wallet_amount?: number;
  country_code?: string;
  country_name?: string;
}

export interface FlutterUser {
  id: number;
  is_seller: number;
  user_name: string | null;
  full_name: string | null;
  email: string | null;
  country_code: string | null;
  mobile_number: string | null;
  country_name: string | null;
  image: string | null;
  device_type: number;
  device_token: string | null;
  wallet_amount: number;
  type: number;
  status: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Banner ───────────────────────────────────────────────────────────────────
export interface Banner {
  id: number;
  item_id: number;
  title: string;
  description: string;
  type: number;
  valid_from: string;
  valid_until: string;
  discount_amount: number;
  image: string;           // thumbnail
  banner_image: string;    // full hero image
  status: number;
}

// ─── Section / Home ───────────────────────────────────────────────────────────
export interface SectionResult {
  id: number;
  section_type: number;
  is_home_screen: number;
  content_type: number;
  title: string;
  short_title: string;
  screen_layout: string;
  type_id: number;
  no_of_content: number;
  no_of_row: number;
  background_type: string;
  background_value: string;
  view_all: number;
  load_more: number;
  status: number;
  data: ProductItem[];
}

export interface CategoryType {
  id: number;
  name: string;
  bg_color: string;
  icon: string;
  banner_image: string;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// ─── Product / Item ───────────────────────────────────────────────────────────
export interface ProductItem {
  id: number;
  name: string;

  unit: string;
  per_unit: number;

  price: number;
  final_price: number;
  tax_price: number;

  sort_description: string;
  long_description: string;
  url: string;
  portrait_img: string;
  landscape_img: string;
  image?: string;
  sub_cat: [{ id: number; name: string; image: string; }];
  category_id: number;
  sub_category_id: number;

  category_name: string;
  sub_category_name: string;
  brand_name: string;
  video_type: number;
  avg_rating: string;
  total_reviews: number;

  is_bookmark: number;
  is_cart: number;

  total_stock: number;
  enable_stock: number;

  stock_status_id: number;
  stock_name: string;

  is_cod: number;
  is_cancelable: number;
  is_returnable: number;

  fast_delivery: number;

  fast_delivery_charges?: number;
  regular_delivery_charges?: number;

  status: number;

  item_attribute?: ItemAttribute[];
  item_images?: ItemImage[];
}
export interface ItemAttribute {
  id: number;
  category_id: string;
  title: string;
  field_type: number;
  icon: string;
  is_required: number;
  status: number;

  created_at: string;
  updated_at: string;

  items_selected_value?: string;

  attributes_value: AttributeValue[];
}
export interface AttributeValue {
  id: number;
  attributes_id: number;
  option: string;
  status: number;

  created_at: string;
  updated_at: string;

  selected_value?: string;
}
export interface ItemImage {
  id: number;
  item_id: number;
  image: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  parent_category_id: number | null;
  name: string;
  image: string;
  sort_order: number;
  status: number;
  sub_cat?: SubCategory[];
  total_sub_cat?: number;
}

export interface SubCategory {
  id: number;
  name: string;
  image: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: number;
  customer_id: number;
  item_id: number;
  quantity: number;
  variation: string;
  item_price: number;
  total_price: number;
  item_title: string;
  item_image: string;
  item_unit: string;
  item_per_unit: number;
  item_total_stock: number;
  item_enable_stock: number;
  is_bookmark: number;
}

// ─── Cart Store Shape ─────────────────────────────────────────────────────────
export interface CartStoreItem {
  id: string | number;
  product_id: number;
  product: ProductItem;

  quantity: number;
  price: number;
  subtotal: number;

  delivery_charges?: number;
  handling_charges?: number;
  variation?: Record<string, unknown>;
}

export interface Cart {
  items: CartStoreItem[];
  total_items: number;
  subtotal: number;
  discount?: number;
  total: number;
  coupon?: Coupon;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface Order {
  id: number;
  group_order_id: string;
  customer_id: number;
  seller_id: number;
  item_total: number;
  delivery_charges: number;
  handling_charges: number;
  donation_amount: number;
  discount_amount: number;
  total_payable_amount: number;
  promo_codes_id?: number;
  customer_address_id?: number;
  payment_method: number | string;
  payment_status: number;
  is_assigned?: number;
  order_notes?: string;
  order_status: number;
  order_status_name?: string;
  order_date_time?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_mobile_number?: string;
  customer_image?: string;
  seller_name?: string;
  seller_image?: string;
  delivery_otp?: string;
  items?: OrderItem[];
  address?: OrderAddress[];
  delivery_assignment?: DeliveryAssignment[];
}

export interface OrderItem {
  id: number;
  order_number?: string;
  item_id?: number;
  item_name?: string;
  item_title?: string;
  item_image?: string;
  item_price?: number;
  item_avg_rating?: string;
  order_quantity?: number;
  order_quantity_amount?: number;
  quantity?: number;
  price?: number;
  total_price?: number;
}

export interface OrderAddress {
  id: number;
  type: number;
  address: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: string;
  longitude?: string;
}

export interface DeliveryAssignment {
  id: number;
  delivery_boy_full_name?: string;
  delivery_boy_number?: string;
  delivery_boy_image?: string;
  vehicle_name?: string;
  vehicle_number?: string;
  pickup_time?: string;
  estimated_delivery_time?: string;
  status?: number;
}

// ─── Address ──────────────────────────────────────────────────────────────────
export interface Address {
  id: number;
  customer_id: number;
  type: number;         // 1=Home 2=Work 3=Other
  address: string;
  latitude: string;
  longitude: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  status: number;
}

// ─── Promo Code ───────────────────────────────────────────────────────────────
export interface PromoCode {
  id: number;
  name: string;
  image: string;
  promo_code: string;           // the coupon code string
  discount_type: number;        // 1=percentage 2=fixed
  discount_amount: number;
  min_order_amount: number;
  max_discount_amount: number;
  valid_until: string;
  status: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: number;
  discount_value: number;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: number;
  customer_id: number;
  content_id: number;
  rating: number;
  review: string;
  image: string | null;
  customer_name: string;
  customer_image: string | null;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  customer_id: number;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
  id: number;
  type: number;             // 1=add money 2=debit/placed order
  customer_id: number;
  delivery_boy_id: number;
  group_order_id: string;
  transaction_id: string;
  price: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile extends FlutterUser {
  gst_number?: string;
  gst_firm_name?: string;
  wallet_amount: number;
}

// ─── Payment Option ───────────────────────────────────────────────────────────
export interface PaymentOption {
  id: number;
  name: string;
  visibility: number;  // 1 = visible
  is_live: string;     // "1" = live, "0" = test
  key_1: string;
  key_2: string;
  key_3: string;
  key_4: string;
  created_at: string;
  updated_at: string;
}

/** /get_payment_option returns result as a keyed object, not an array */
export interface PaymentOptionResponse {
  status: number;
  message: string;
  result: Record<string, PaymentOption> | null;
}

// ─── Delivery Instruction ─────────────────────────────────────────────────────
export interface DeliveryInstruction {
  id: number;
  title: string;
  image: string;
}

// ─── Product Filters (for UI) ─────────────────────────────────────────────────
export interface ProductFilters {
  category_id?: string | number;
  sub_category_id?: string | number;
  page_no?: number;
  query?: string;
}

// ─── Auth Response ────────────────────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface ApiResponse {
  status: number;
  message: string;
  result: User[];
}



