const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const IMAGES = {
  logo: `${BASE_PATH}/images/logo.png`,
  appLogo: `${BASE_PATH}/images/appLogo2.png`,
  favicon: `${BASE_PATH}/icons/favicon.ico`,
  placeholder: `${BASE_PATH}/images/placeholder.png`,
  ogImage: `${BASE_PATH}/images/og-image.png`,
  bgPattern: `${BASE_PATH}/images/bghome.png`,
  playStore: `${BASE_PATH}/images/playStore.png`,
  appStore: `${BASE_PATH}/images/appStore.png`,
  codIcon: `${BASE_PATH}/images/ic_cod.png`,
  deliveryFeature: `${BASE_PATH}/images/image2.png`,
  promoCard: `${BASE_PATH}/images/image1.png`,
  appDownloadBanner: `${BASE_PATH}/images/appDownloadBanner.png`,

  heroBanners: [
    {
      image: `${BASE_PATH}/images/banner1.jpg`,
      title: `Fresh Vegetables Daily`,
      description: `Farm-fresh vegetables delivered to your door`,
      button_text: `Shop Now`,
      button_link: `${BASE_PATH}/categories`,
    },
    {
      image: `${BASE_PATH}/images/banner2.jpg`,
      title: `Seasonal Fruits`,
      description: `Best quality seasonal fruits at lowest prices`,
      button_text: `Explore`,
      button_link: `${BASE_PATH}/categories`,
    },
    {
      image: `${BASE_PATH}/images/banner3.jpg`,
      title: `Organic Groceries`,
      description: `100% organic certified products`,
      button_text: `Order Now`,
      button_link: `${BASE_PATH}/shop`,
    },
  ],
} as const;
