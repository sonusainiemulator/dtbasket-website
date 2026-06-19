import SafeImage from "@/components/ui/SafeImage";
import { IMAGES } from "@/branding";

export default function AppDownloadBanner() {
  return (
    <div className="w-full mt-10 rounded-2xl overflow-hidden">
      <SafeImage
        src={IMAGES.appDownloadBanner}
        alt="Download the DTBasket app"
        width={6664}
        height={3480}
        className="w-full h-auto object-cover"
        priority
      />
    </div>
  );
}
