# DTBasket — Next.js Frontend

Production-grade Next.js 15 grocery e-commerce frontend, 100% integrated with the Flutter backend API.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
src/
├── app/                  # Next.js pages
├── branding/             # ⭐ CLIENT-EDITABLE — colors, text, images, config
├── components/
│   ├── auth/             # Login, Register, AuthModal, Account, Orders
│   ├── cart/             # Cart drawer, Cart page, Checkout
│   ├── home/             # HeroSlider, CategoryGrid, Sections, Promo
│   ├── layout/           # Header, Footer, TopBar, SearchBar
│   ├── product/          # ProductCard, ProductDetail, Wishlist
│   └── ui/               # SplashScreen
├── hooks/useApi.ts       # All TanStack Query hooks
├── lib/
│   ├── axios.ts          # Axios with auto customer_id injection
│   ├── constants.ts      # All Flutter API endpoints
│   └── queryClient.ts    # React Query client
├── services/             # API service layer (1:1 with Flutter apiservice.dart)
│   ├── authService.ts
│   ├── bannerService.ts
│   ├── cartService.ts
│   ├── categoryService.ts
│   ├── generalService.ts
│   ├── orderService.ts
│   ├── productService.ts
│   ├── profileService.ts
│   ├── promoService.ts
│   ├── reviewService.ts
│   └── wishlistService.ts
├── store/                # Zustand stores
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── wishlistStore.ts
└── types/index.ts        # All Flutter model types
```

---

## Flutter API Mapping

| Flutter Method | Web Endpoint | Description |
|---|---|---|
| `loginWithOTP()` | POST `/login` type=1 | Phone + OTP login |
| `normalLogin()` | POST `/login` type=4 | Email + password |
| `loginWithGoogle()` | POST `/login` type=2 | Google OAuth |
| `ragister()` | POST `/registration` | New user registration |
| `forgotpassword()` | POST `/forgot_password` | Password reset |
| `getSection()` | POST `/get_section` | Home sections |
| `loadBanner()` | POST `/get_banner` | Hero + promo banners |
| `getcatwithsubcat()` | POST `/get_cat_with_subcat` | Categories |
| `getitemsbycategory()` | POST `/get_items_by_category` | Products by category |
| `loadProductdetails()` | POST `/item_details` | Product detail |
| `loadsimilarProduct()` | POST `/get_similar_items` | Similar products |
| `getTopRatingItems()` | POST `/get_top_rating_items` | Top rated |
| `getsearchdata()` | POST `/search_items` | Search |
| `addToCart()` | POST `/add_to_cart` | Add to cart |
| `loadCardData()` | POST `/get_cart_items` | Get cart |
| `updateToCart()` | POST `/update_quantity` | Update qty |
| `removeFromCart()` | POST `/remove_cart` | Remove from cart |
| `addremovewishlist()` | POST `/add_remove_wishlist` | Toggle wishlist |
| `getWishllist()` | POST `/get_wishlist` | Get wishlist |
| `buyorders()` | POST `/buy_orders` | Place order |
| `getCustomrOrder()` | POST `/get_customer_orders` | Order list |
| `getpromocode()` | POST `/get_promocode` | Promo codes |
| `applypromocode()` | POST `/apply_promo_code` | Apply promo |
| `loadReview()` | POST `/get_items_review` | Reviews |
| `addReview()` | POST `/add_review` | Add review |
| `getProfile()` | POST `/get_profile` | Profile |
| `updateprofile()` | POST `/update_profile` | Update profile |
| `addAddress()` | POST `/add_new_address` | Add address |
| `getAddress()` | POST `/get_customer_address` | Addresses |
| `editAddress()` | POST `/edit_address` | Edit address |
| `deletAddress()` | POST `/delete_address` | Delete address |
| `getnotification()` | POST `/get_notification` | Notifications |
| `readnotification()` | POST `/read_notification` | Mark read |
| `getTransactionList()` | POST `/get_transaction_list` | Transactions |
| `addWalletAmount()` | POST `/add_wallet_amount` | Add to wallet |
| `generalsetting()` | POST `/general_setting` | App config |
| `getpaymentoption()` | POST `/get_payment_option` | Payment options |
| `getDeliveryInstructor()` | POST `/get_delivery_instructor` | Delivery options |

---

## Client Customization

Clients only need to edit files in `src/branding/`:

| File | Contents |
|---|---|
| `colors.ts` | Brand colors |
| `fonts.ts` | Font families |
| `images.ts` | Logo, banners, placeholder |
| `text.ts` | All UI text strings |
| `config.ts` | App configuration (currency, fees, etc.) |

And replace assets in `public/images/` and `public/icons/`.

---

## Tech Stack

- **Next.js 15** — App router, SSR/SSG
- **TypeScript** — Full type safety
- **Tailwind CSS** — Utility-first styling
- **Zustand v5** — Auth, Cart, Wishlist stores with persistence
- **TanStack React Query v5** — API state management with caching
- **Axios** — HTTP client with `customer_id` auto-injection
- **Swiper.js** — Hero slider, product carousels
- **React Hot Toast** — Notifications
