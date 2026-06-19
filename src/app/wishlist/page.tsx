import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import WishlistClient from "@/components/product/WishlistClient";
export const metadata: Metadata = { title: "Wishlist – DTBasket" };
export default function WishlistPage() {
  return (
    <MainLayout>
      <div className="container-custom py-6 page-enter"><WishlistClient /></div>
    </MainLayout>
  );
}
