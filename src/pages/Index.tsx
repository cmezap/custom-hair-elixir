import Nav from "@/components/lumiere/Nav";
import Hero from "@/components/lumiere/Hero";
import CremaBase from "@/components/lumiere/CremaBase";
import Boosters from "@/components/lumiere/Boosters";
import RitualDiagnostico from "@/components/lumiere/RitualDiagnostico";
import Footer from "@/components/lumiere/Footer";

const Index = () => (
  <main className="min-h-screen bg-background">
    <Nav />
    <Hero />
    <CremaBase />
    <Boosters />
    <RitualDiagnostico />
    <Footer />
  </main>
);

export default Index;
