'use client'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StoresLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
