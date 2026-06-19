import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import ProductDetailClient from "@/components/product/ProductDetailClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ }: Props): Promise<Metadata> {

  return { title: `Product - DTBasket` };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return (
    <MainLayout>
      <div className="container-custom py-6">
        <ProductDetailClient itemId={slug} />
      </div>
    </MainLayout>
  );
}