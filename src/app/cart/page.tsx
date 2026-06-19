import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import CartPageClient from "@/components/cart/CartPageClient";
export const metadata: Metadata = { title: "Cart – DTBasket" };
export default function CartPage() {
  return (
    <MainLayout>
      <div className="container-custom py-6 page-enter"><CartPageClient /></div>
    </MainLayout>
  );
}
