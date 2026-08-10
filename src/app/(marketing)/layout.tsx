import { Navbar } from "../../components/marketing/Navbar";
import { Footer } from "../../components/marketing/Footer";
import { agentsData } from "../../content/agents";

const agentNavigationItems = agentsData.map(({ name, slug }) => ({ name, slug }));

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar agents={agentNavigationItems} />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col pt-16 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
