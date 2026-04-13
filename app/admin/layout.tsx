import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "KoreaCosmetics' Hub - Admin Dashboard",
    description: "KoreaCosmetics' Hub - Admin Dashboard",
};

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
