import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "KoreaBeauty Hub - Admin Dashboard",
    description: "KoreaBeauty Hub - Admin Dashboard",
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
