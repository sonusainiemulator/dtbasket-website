import Header from "./Header";
import Footer from "./Footer";
import TopBar from "./TopBar";
import CartDrawer from "@/components/cart/CartDrawer";
import { COLORS, IMAGES } from "@/branding";

interface Props {
  children: React.ReactNode;
  bgImage?: string;   // override per-page, defaults to global bg
}



export default function MainLayout({ children, bgImage }: Props) {
  const bg = bgImage ?? IMAGES.bgPattern;   // use branding value — easy to change per client

  return (
    <div

      className="flex flex-col min-h-screen dark:bg-dm-background"
    >
      <div
        className="absolute inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: bg ? `url('${bg}')` : undefined,
          backgroundRepeat: "repeat",
          backgroundSize: "1200px 800px",
          backgroundColor: COLORS.background, // ✅ light mode only
        }}
      />

      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}