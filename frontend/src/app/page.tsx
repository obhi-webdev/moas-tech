import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";
import Footer from "@/components/home/Footer";
import RevealSection from "@/components/home/RevealSection";

export default function Home() {
  return (
    <>
      <Header
        phone="01737092358"
        whatsapp="01737092358"
      />

      <main>
        <Hero />

        <CategorySection />

        <RevealSection>
          <ProductSection
            title="Featured Products"
            subtitle="Our selected technology products"
            query="featured=true&sort=newest"
            viewAllHref="/shop?featured=true"
          />
        </RevealSection>

        <RevealSection>
          <ProductSection
            title="Special Offers"
            subtitle="Grab our latest deals and offers"
            query="offer=true&sort=newest"
            viewAllHref="/shop?offer=true"
          />
        </RevealSection>

        <RevealSection>
          <ProductSection
            title="Latest Products"
            subtitle="Explore the latest products at VC Tech"
            query="sort=newest"
            viewAllHref="/shop?sort=newest"
          />
        </RevealSection>
      </main>

      <Footer />
    </>
  );
}
