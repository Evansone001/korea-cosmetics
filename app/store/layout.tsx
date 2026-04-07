import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "KoreaBeauty Hub - Store Dashboard",
    description: "KoreaBeauty Hub - Store Dashboard",
};

export default function RootStoreLayout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
