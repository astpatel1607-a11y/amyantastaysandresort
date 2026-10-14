import React from "react";
import { Outlet } from "react-router-dom";
import { EnquiryProvider } from "@/lib/enquiryContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MobileConcierge from "@/components/MobileConcierge";
import ConciergeWidget from "@/components/ConciergeWidget";
import EnquiryModal from "@/components/EnquiryModal";

export default function SiteLayout() {
  return (
    <EnquiryProvider>
      <div className="min-h-screen flex flex-col bg-sand">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <MobileConcierge />
        <ConciergeWidget />
        <EnquiryModal />
      </div>
    </EnquiryProvider>
  );
}