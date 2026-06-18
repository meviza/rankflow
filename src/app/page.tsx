import Navbar from "@/components/landing/navbar"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import DemoReport from "@/components/landing/demo-report"
import Pricing from "@/components/landing/pricing"
import CtaSection from "@/components/landing/cta-section"
import RequestBox from "@/components/landing/request-box"
import Faq from "@/components/landing/faq"
import Footer from "@/components/landing/footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DemoReport />
        <Pricing />
        <CtaSection />
        <RequestBox />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
