import {
  ArrowRight,
  Leaf,
  MousePointer2,
  Settings2,
  Wrench,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"

const features = [
  {
    title: "Visual Block Editor",
    description:
      "Create plugin behavior with drag-and-drop blocks in a Blockly-based workspace, so you can design logic without writing Java by hand.",
    icon: Leaf,
  },
  {
    title: "Java Generation",
    description:
      "PluginWizard generates readable Paper plugin code from your blocks, making it easier to learn what your project is doing under the hood.",
    icon: MousePointer2,
  },
  {
    title: "Project Export Options",
    description:
      "Export your plugins code or package it as a .jar for free at any time, so you can test your plugin in Minecraft or share it with others.",
    icon: Settings2,
  },
  {
    title: "Paper Plugin Scaffolding",
    description:
      "Generated output includes core plugin structure and config files, helping you move from idea to a runnable Paper plugin faster.",
    icon: Wrench,
  },
]

const reviews = [
  {
    username: "Minikloon",
    role: "Ex Hypixel Developer",
    avatar: "/images/reviewers/minikloon.jpg",
    review:
      "I went from a blank workspace to a working prototype in one evening. The block workflow is fast and the generated output is easy to follow.",
    rating: 4.9,
  },
  {
    username: "KasaiSora",
    role: "Minecraft Content Creator",
    avatar: "/images/reviewers/kasaisora.webp",
    review:
      "Exporting to .jar directly saves a lot of setup time. For small server ideas, PluginWizard removes most of the friction.",
    rating: 4.7,
  },
  {
    username: "Moulberry",
    role: "Creator of Axiom and Flashback",
    avatar: "/images/reviewers/moulberry.png",
    review:
      "The visual editor keeps logic approachable, and being able to inspect the generated Java helped me understand Paper plugin structure much faster.",
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, rating))

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const fill = Math.max(0, Math.min(1, safeRating - index))
          const fillPercent = `${fill * 100}%`

          return (
            <span key={index} className="relative inline-block h-5 w-5">
              <svg
                viewBox="0 0 24 24"
                className="absolute inset-0 h-5 w-5 text-white/20"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 2.25l2.83 5.74 6.33.92-4.58 4.47 1.08 6.31L12 16.71l-5.66 2.98 1.08-6.31L2.84 8.91l6.33-.92L12 2.25z"
                />
              </svg>

              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: fillPercent }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-green-400"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M12 2.25l2.83 5.74 6.33.92-4.58 4.47 1.08 6.31L12 16.71l-5.66 2.98 1.08-6.31L2.84 8.91l6.33-.92L12 2.25z"
                  />
                </svg>
              </span>
            </span>
          )
        })}
      </div>

      <span className="text-sm font-semibold text-white/85">{safeRating.toFixed(1)} / 5</span>
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <section className="relative flex min-h-screen items-center overflow-hidden sm:px-28 lg:px-16 xl:px-56">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/banner.png')" }}
        />
        <div className="absolute inset-0 bg-[#0b0b0d]/80" />

        <div className="w-full flex flex-row items-center justify-between">
          {/* Left text */}
          <div className="relative w-full max-w-4xl">
            <div className="space-y-8 lg:space-y-10">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl xl:text-8xl">
                  Create Minecraft
                  <span className="block text-green-400">Plugins Visually</span>
                </h1>

                <p className="max-w-2xl text-lg text-card-muted-foreground sm:text-xl md:text-2xl">
                  Build Paper plugins using visual blocks, no programming knowledge needed.
                  Drag, drop, and create amazing plugins in minutes.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-green-600 text-white transition-all duration-300 hover:bg-green-700"
                >
                  <Link to="/editor">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-muted-foreground/20! bg-card-lighter transition-all duration-300 hover:border-muted-foreground/80! hover:bg-card-lighter/80"
                >
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative w-full max-w-4xl">
            <img
              src="/images/showcase.png"
              alt="PluginWizard showcase"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0b0b0d] px-4 py-16 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-500 px-6 py-10 sm:px-8 lg:px-10 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-[0.28em] text-white sm:text-4xl">
                What PluginWizard Does
              </h2>

              <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
                {features.map((feature) => (
                  <Card
                    key={feature.title}
                    className="min-h-64 border-white/10 bg-[#161616] py-0 shadow-none"
                  >
                    <CardHeader className="gap-4 px-6 pt-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-white">
                        <feature.icon className="h-5 w-5 text-green-400" />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 text-lg leading-8 text-[#d1d5db]">
                      {feature.description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mx-auto hidden xl:block">
              <img
                src="/images/icons/pluginwizard-banner.png"
                alt="PluginWizard character art"
                width={280}
                height={420}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-center xl:hidden">
            <img
              src="/images/icons/pluginwizard-banner.png"
              alt="PluginWizard character art"
              width={280}
              height={420}
              className="h-auto max-w-65 object-contain sm:max-w-70"
            />
          </div>
        </div>
      </section>

{/*
      <section className="relative overflow-hidden border-t border-white/5 bg-[#0b0b0d] px-4 py-16 sm:px-8 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-size-[20px_20px] opacity-60" />
        <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-120 -translate-x-1/2 rounded-full bg-green-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-emerald-400/12 blur-[100px]" />

        <div className="relative mx-auto max-w-500 px-6 py-10 sm:px-8 lg:px-10 xl:px-12">
          <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-[0.28em] text-white sm:text-4xl">
              Community Reviews
            </h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review) => (
                <Card
                  key={review.username}
                  className="group relative z-0 min-h-72 overflow-hidden border-white/10 bg-[#161616]/95 py-0 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_44px_-30px_rgba(255,255,255,0.16)]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-linear-to-r from-transparent via-white/55 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                  <CardHeader className="relative z-10 gap-4 px-6 pt-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={review.avatar}
                        alt={`${review.username} profile picture`}
                        className="h-12 w-12 rounded-full border border-white/15 object-cover"
                      />
                      <div className="space-y-0.5">
                        <CardTitle className="text-xl font-semibold text-white">
                          {review.username}
                        </CardTitle>
                        <p className="text-sm text-card-muted-foreground">{review.role}</p>
                      </div>
                    </div>

                    <StarRating rating={review.rating} />
                  </CardHeader>

                  <CardContent className="relative z-10 px-6 pb-6 text-base leading-7 text-[#d1d5db]">
                    {review.review}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
*/}
    </main>
  )
}