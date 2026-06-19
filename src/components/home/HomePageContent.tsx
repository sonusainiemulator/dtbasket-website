import MainLayout from "@/components/layout/MainLayout";
import HeroSlider from "@/components/home/HeroSlider";
import CategoryGrid from "@/components/home/CategoryGrid";
import PromoBannerCards from "@/components/home/PromoCards";
import HomeSectionsClient from "@/components/home/HomeSectionsClient";
import AppDownloadBanner from "@/components/home/AppDownloadBanner";

export default function HomePageContent({ typeId }: { typeId?: string }) {
    return (
        <MainLayout>
            <div className="py-4 space-y-5 page-enter">
                <div className="container-custom space-y-5">
                    <HeroSlider typeId={typeId} />

                    {typeId == null && <CategoryGrid />}
                    {typeId == null && <PromoBannerCards />}
                </div>

                <HomeSectionsClient typeId={typeId} />

                <div className="container-custom space-y-5">
                    {typeId == null && <AppDownloadBanner />}
                </div>
            </div>
        </MainLayout>
    );
}
