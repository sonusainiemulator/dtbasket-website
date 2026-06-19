import SafeImage from "@/components/ui/SafeImage";
import { IMAGES } from "@/branding";

export default function DeliveryFeatures() {
    return (
        <div className="w-full rounded-2xl overflow-hidden">
            <SafeImage
                src={IMAGES.deliveryFeature}
                alt="Quality assurance, fast delivery, pay after receiving"
                width={7680}
                height={1752}
                className="w-full h-auto object-cover"
                priority
            />
        </div>
    );
}
