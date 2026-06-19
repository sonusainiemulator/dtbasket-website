import { Suspense } from "react";
import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import SearchPageClient from "@/components/home/SearchPageClient";
export const metadata: Metadata = { title: "Search – DTBasket" };
export default function SearchPage() {
  return (
    <MainLayout>
      <div className="container-custom py-6 page-enter">
        <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
          <SearchPageClient />
        </Suspense>
      </div>
    </MainLayout>
  );
}
