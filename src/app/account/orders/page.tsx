import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import OrdersClient from "@/components/auth/OrdersClient";

export const metadata: Metadata = { title: "My Orders – DTBasket" };

export default function OrdersPage() {
  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen dark:bg-dm-background ">
        <div className="container-custom py-6 page-enter">
          <OrdersClient />
        </div>
      </div>
    </MainLayout>
  );
}
