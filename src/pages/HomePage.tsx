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
    title: "Lightweight",
    description:
      "Build only what you need. PluginWizard keeps projects focused so your workflow stays fast and free of unnecessary clutter.",
    icon: Leaf,
  },
  {
    title: "Simple",
    description:
      "A familiar visual editor keeps the experience easy to learn, even if you have never written a plugin before.",
    icon: MousePointer2,
  },
  {
    title: "Customizable",
    description:
      "Tune blocks, settings, and behaviors to match your server idea instead of forcing your idea into a rigid template.",
    icon: Settings2,
  },
  {
    title: "Maintained",
    description:
      "The editor is designed to grow with your project, with room for iteration as new plugin features are added over time.",
    icon: Wrench,
  },
]

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
        <div className="mx-auto max-w-500 not-first:rounded-[28px] border border-white/8 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[18px_18px] px-6 py-10 sm:px-8 lg:px-10 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-[0.28em] text-white sm:text-4xl">
                In A Nutshell
              </h2>

              <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
                {features.map((feature) => (
                  <Card
                    key={feature.title}
                    className="min-h-64 border-white/10 bg-[#161616] py-0 shadow-none"
                  >
                    <CardHeader className="gap-4 px-6 pt-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-white">
                        <feature.icon className="h-5 w-5 text-lime-400" />
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
    </main>
  )
}