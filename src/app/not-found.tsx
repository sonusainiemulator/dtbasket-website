import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { TEXT } from "@/branding";

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container-custom py-20 text-center">
        <h1 className="text-8xl font-black text-primary-700 font-display mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{TEXT.notFound.title}</h2>
        <p className="text-gray-500 mb-8">{TEXT.notFound.message}</p>
        <Link href="/" className="btn-primary">{TEXT.notFound.cta}</Link>
      </div>
    </MainLayout>
  );
}
