import HomePageContent from "@/components/home/HomePageContent";

export default async function TypePage({
    params,
}: {
    params: Promise<{ typeId: string }>;
}) {
    const { typeId } = await params;

    return <HomePageContent typeId={typeId} />;
}