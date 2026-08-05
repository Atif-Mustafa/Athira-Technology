import { Navbar } from "../../components/marketing/Navbar";
import { Footer } from "../../components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col pt-16 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
