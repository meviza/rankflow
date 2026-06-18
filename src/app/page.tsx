"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import DemoReport from "@/components/landing/demo-report";
import Pricing from "@/components/landing/pricing";
import Faq from "@/components/landing/faq";
import RequestBox from "@/components/landing/request-box";
import CtaSection from "@/components/landing/cta-section";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Navbar />
      <main>
        <Hero />
        <Features />
        <DemoReport />
        <Pricing />
        <Faq />
        <RequestBox />
        <CtaSection />
      </main>
      <Footer />
    </motion.div>
  );
}
