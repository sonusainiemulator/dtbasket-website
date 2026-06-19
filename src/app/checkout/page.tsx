import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import CheckoutClient from "@/components/cart/CheckoutClient";
export const metadata: Metadata = { title: "Checkout – DTBasket" };
export default function CheckoutPage() {
  return (
    <MainLayout>
      <div className="container-custom py-6 page-enter"><CheckoutClient /></div>
    </MainLayout>
  );
}
