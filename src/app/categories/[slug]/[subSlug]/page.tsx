import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import CategoryProductsClient from "@/components/home/CategoryProductsClient";

interface Props { params: Promise<{ slug: string; subSlug: string }> }

export async function generateMetadata({ }: Props): Promise<Metadata> {
  return { title: `Category - DTBasket` };
}

export default async function SubCategoryPage({ params }: Props) {
  const { slug, subSlug } = await params;
  return (
    <MainLayout>
      <div className="container-custom py-6">
        <CategoryProductsClient
          categoryId={slug}
          initialSubCatId={Number(subSlug)}
        />
      </div>
    </MainLayout>
  );
}