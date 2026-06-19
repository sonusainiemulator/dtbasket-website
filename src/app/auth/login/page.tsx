import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import LoginClient from "@/components/auth/LoginClient";
export const metadata: Metadata = { title: "Sign In – DTBasket" };
export default function LoginPage() {
  return (
    <MainLayout>
      <div className="container-custom py-12 page-enter"><LoginClient /></div>
    </MainLayout>
  );
}
