import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhyBulldog from "./components/WhyBulldog";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";
import PricingCalculator from "./components/PricingCalculator";
import ItemTierGuide from "./components/ItemTierGuide";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WhyBulldog />
      <HowItWorks />
      <Pricing />
      <PricingCalculator />
      <ItemTierGuide />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
