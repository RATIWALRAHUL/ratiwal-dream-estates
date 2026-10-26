import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingWhatsAppButton from "@/components/layout/FloatingWhatsAppButton";
import { ChatWidgetLazy } from "@/components/chat/ChatWidgetLazy";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-grow outline-none">
        {children}
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <ChatWidgetLazy />
    </div>
  );
}
