import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import AccountClient from "@/components/auth/AccountClient";

export const metadata: Metadata = { title: "My Account – DTBasket" };

export default function AccountPage() {
  return (
    <MainLayout>
      <div className=" min-h-screen">
        <div className="container-custom py-6 page-enter">
          <AccountClient />
        </div>
      </div>
    </MainLayout>
  );
}
