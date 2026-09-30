import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Header
        phone="01614106550"
        whatsapp="01614106550"
      />

      <main>
        <Hero />

        <CategorySection />

        <ProductSection
          title="Featured Products"
          subtitle="Our selected technology products"
          query="featured=true&sort=newest"
          viewAllHref="/shop?featured=true"
        />

        <ProductSection
          title="Special Offers"
          subtitle="Grab our latest deals and offers"
          query="offer=true&sort=newest"
          viewAllHref="/shop?offer=true"
        />

        <ProductSection
          title="Latest Products"
          subtitle="Explore the latest products at MOAS Tech"
          query="sort=newest"
          viewAllHref="/shop?sort=newest"
        />
      </main>

      <Footer />
    </>
  );
}
