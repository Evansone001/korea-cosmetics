import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "KoreaCosmetics' Hub - Store Dashboard",
    description: "KoreaCosmetics' Hub - Store Dashboard",
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
