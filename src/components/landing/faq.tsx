"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is GEO?",
    answer:
      "GEO stands for Generative Engine Optimization. It's the practice of optimizing your content to be cited by AI-powered search engines like ChatGPT, Google Gemini, Claude, and Perplexity. Unlike traditional SEO that targets Google rankings, GEO ensures your brand appears in AI-generated answers when users ask questions.",
  },
  {
    question: "How does the AI analysis work?",
    answer:
      "RankFlow crawls your website and runs it through multiple AI models that evaluate your content from different perspectives. Each model analyzes technical SEO, content quality, AI discoverability, and semantic relevance. The results are aggregated into a comprehensive score with actionable recommendations.",
  },
  {
    question: "Which AI models are available?",
    answer:
      "We currently integrate with three leading AI models: ChatGPT (OpenAI), Gemini (Google), and Claude (Anthropic). This multi-model approach ensures your content is optimized across all major AI platforms. Each model evaluates your site independently for unbiased results.",
  },
  {
    question: "Can I integrate with my CMS?",
    answer:
      "Yes! On our Agency plan, RankFlow can directly connect to WordPress and Webflow CMS. Our AI can automatically fix schema markup, meta tags, hreflang attributes, and other technical SEO elements directly on your site. More CMS integrations are coming soon.",
  },
  {
    question: "What languages are supported?",
    answer:
      "RankFlow supports 10 languages including Turkish, English, German, French, Spanish, Italian, Portuguese, Dutch, Russian, and Arabic. Both the analysis interface and generated reports are available in all supported languages.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We take security seriously. All data is encrypted in transit and at rest. We use enterprise-grade cloud infrastructure with SOC 2 compliance. Your website data is only used for generating your reports and is never shared with third parties or used to train AI models.",
  },
]

export default function Faq() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Everything you need to know about RankFlow and GEO optimization.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-14 max-w-2xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
