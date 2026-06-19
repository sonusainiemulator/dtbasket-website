import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import ShopClient from "@/components/home/ShopClient";
export const metadata: Metadata = { title: "Shop – DTBasket" };
export default function ShopPage() {
  return (
    <MainLayout>
      <div className="container-custom py-6 page-enter"><ShopClient /></div>
    </MainLayout>
  );
}
