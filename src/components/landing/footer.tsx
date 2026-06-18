import Link from "next/link"
import { Globe, MessageCircle, AtSign, Share2 } from "lucide-react"

const productLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#", label: "API" },
]

const companyLinks = [
  { href: "#", label: "About" },
  { href: "#", label: "Blog" },
  { href: "#", label: "Contact" },
]

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
]

const socialLinks = [
  { icon: Globe, href: "#", label: "Twitter" },
  { icon: AtSign, href: "#", label: "LinkedIn" },
  { icon: Share2, href: "#", label: "GitHub" },
  { icon: MessageCircle, href: "#", label: "YouTube" },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-gradient">RankFlow</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered SEO & GEO analytics platform. Optimize for Google and AI search engines in one place.
            </p>
            <div className="mt-5 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-white/[0.06] text-muted-foreground transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} RankFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}