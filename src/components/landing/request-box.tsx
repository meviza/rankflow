"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Lightbulb, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RequestBox() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Request a{" "}
            <span className="text-gradient">
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
          <Card className="border-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
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
                    onClick={() => { setSubmitted(false); setName(""); setEmail(""); setMessage(""); }}
                  >
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required disabled={submitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={submitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Feature Idea</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what feature you'd love to see..."
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {submitting ? "Submitting..." : "Submit"}
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