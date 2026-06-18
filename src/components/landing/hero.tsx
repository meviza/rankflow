"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "AI Models", value: "3" },
  { label: "Languages", value: "10" },
  { label: "PDF Reports", value: "✓" },
  { label: "CMS Auto-Fix", value: "✓" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-500/20 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 text-center lg:px-8"
      >
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
            <Star className="size-3 fill-violet-500" />
            AI-Powered SEO + GEO Platform
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          Your Website Deserves to Be Found — On{" "}
          <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            Google & AI
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          SEO isn&apos;t enough anymore. ChatGPT, Gemini and Perplexity are changing how people search. RankFlow helps you optimize for both traditional search engines and AI-powered platforms — all in one dashboard.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
          >
            Start Free Scan
            <ArrowRight className="size-5" />
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base">
            <Play className="size-4" />
            See Demo Report
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-3 text-center"
            >
              <div className="text-2xl font-bold text-violet-600">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
