"use client"

import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CtaSection() {
  const router = useRouter()
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-emerald-600 p-10 text-center sm:p-16 lg:p-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Boost Your Rankings?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100">
              Start your free scan today. No credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={() => router.push("/scan")}
              >
                Scan Your Website
                <ArrowRight className="size-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => {
                  const el = document.getElementById("request-box"); if (el) el.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <MessageCircle className="size-4" />
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}