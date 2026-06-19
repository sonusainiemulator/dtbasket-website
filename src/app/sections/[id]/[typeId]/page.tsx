import type { Metadata } from "next";
import MainLayout from "@/components/layout/MainLayout";
import SectionDetailClient from "@/components/home/SectionDetailClient";

export const metadata: Metadata = { title: "Section – DTBasket" };

export default async function SectionPage({ params }: { params: Promise<{ id: string, typeId: string }> }) {
    const { id, typeId } = await params;
    return (
        <MainLayout>
            <div className="bg-gray-50 dark:bg-dm-background min-h-screen">
                <div className="container-custom py-6 page-enter">
                    <SectionDetailClient sectionId={id} typeId={typeId} />
                </div>
            </div>
        </MainLayout>
    );
}   