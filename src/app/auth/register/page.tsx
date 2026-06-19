import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import RegisterClient from "@/components/auth/RegisterClient";
export const metadata: Metadata = { title: "Create Account – DTBasket" };
export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="container-custom py-12 page-enter"><RegisterClient /></div>
    </MainLayout>
  );
}
