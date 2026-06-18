"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RequestBox() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Request a{" "}
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              Feature
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            We&apos;re building the future of SEO + GEO. Tell us what you need and help shape RankFlow.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-10 max-w-lg"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                  <Lightbulb className="size-5" />
                </div>
                <div>
                  <CardTitle>Suggest a Feature</CardTitle>
                  <CardDescription>Your idea could be our next big thing.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-lg bg-emerald-50 p-6 text-center dark:bg-emerald-950">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Thanks for your suggestion!
                  </p>
                  <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                    We&apos;ll review it and get back to you.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Feature Idea</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what feature you'd love to see..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
                  >
                    <Send className="size-4" />
                    Submit
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
