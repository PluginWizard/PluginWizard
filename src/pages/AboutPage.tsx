"use client"

import { useRef, useState } from "react"
import {
  ArrowRight,
  Compass,
  Globe,
  Lightbulb,
  Quote,
  Wand2,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"

type SocialType = "github" | "youtube" | "discord" | "twitch" | "x" | "website"

interface Social {
  type: SocialType
  url: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  quote: string,
  pfp: string
  socials: Social[]
}

const team: TeamMember[] = [
  {
    id: "kalbskinder",
    name: "Kalbskinder",
    role: "Founder & Lead Developer",
    quote: "I wished a tool like this existed when I started developing plugins",
    pfp: "/images/team/kalbskinder.png",
    socials: [
      { type: "github", url: "https://github.com/Kalbskinder" },
      { type: "youtube", url: "https://youtube.com/@kalbskinder" },
      { type: "website", url: "https://kalbskinder.github.io" },
    ],
  },
  {
    id: "zetmine",
    name: "ZetMine",
    role: "Developer",
    quote: "Good tools should feel like play, not paperwork.",
    pfp: "/images/team/zetmine.png",
    socials: [
      { type: "github", url: "https://github.com/ZetMine" },
    ],
  },
  {
    id: "pjma",
    name: "pjma",
    role: "Designer & Developer",
    quote: "Every block you drag is a line of Java you didn't have to memorize.",
    pfp: "/images/team/pjma.png",
    socials: [
      { type: "youtube", url: "https://www.youtube.com/@wpjma" },
      { type: "discord", url: "https://discord.com/users/824685363653378068" },
    ],
  },
  {
    id: "flip",
    name: "flip",
    role: "Designer & Community Manager",
    quote: "The best part of this project is watching someone ship their first plugin.",
    pfp: "/images/team/flip.png",
    socials: [
      { type: "discord", url: "https://discord.gg/tJ67vmyW7f" },
      { type: "youtube", url: "https://youtube.com/" },
    ],
  },
]

/* The origin story, told as a short timeline. */
const story = [
  {
    icon: Lightbulb,
    title: "The wish",
    text: "It started with a simple frustration: wanting to build Minecraft plugins, but having no idea how to write Java or how PaperMC actually worked under the hood.",
  },
  {
    icon: Compass,
    title: "The gap",
    text: "Tutorials assumed too much, and the blank editor was intimidating. There was no friendly, visual way to learn the basics — the kind of tool we genuinely wished existed.",
  },
  {
    icon: Wand2,
    title: "The result",
    text: "So we made it ourselves. PluginWizard turns plugin development into drag-and-drop blocks that compile to real, readable Paper code — so the next person doesn't have to start from zero.",
  },
]

function SocialIcon({ type }: { type: SocialType }) {
  const common = "h-4.5 w-4.5"
  switch (type) {
    case "github":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      )
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case "discord":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      )
    case "twitch":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      )
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={common} aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    case "website":
      return <Globe className={common} aria-hidden />
  }
}

const socialLabels: Record<SocialType, string> = {
  github: "GitHub",
  youtube: "YouTube",
  discord: "Discord",
  twitch: "Twitch",
  x: "X (Twitter)",
  website: "Website",
}

/* -------------------------------------------------------------------------- */
/*  Avatar with graceful initials fallback                                    */
/* -------------------------------------------------------------------------- */
function Avatar({ member }: { member: TeamMember }) {
  const [failed, setFailed] = useState(false)
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()


  return (
    <div className={`rounded-2xl p-0.5 shadow-lg`}>
      <div className="size-20 overflow-hidden rounded-[14px] bg-[#0b0b0d]">
        {failed ? (
          <div
            className={`flex size-full items-center justify-center bg-linear-to-br text-2xl font-black text-white`}
          >
            {initials}
          </div>
        ) : (
          <img
            src={member.pfp}
            alt={member.name}
            className="size-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Interactive 3D tilt for the polaroid team photo                           */
/* -------------------------------------------------------------------------- */
function TiltPhoto() {
  const ref = useRef<HTMLDivElement>(null)
  const rest = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)"
  const [transform, setTransform] = useState(rest)
  const [active, setActive] = useState(false)

  function handleMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rotateY = (px - 0.5) * 22
    const rotateX = (0.5 - py) * 22
    setTransform(
      `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.05)`
    )
  }

  return (
    <div
      ref={ref}
      onMouseEnter={() => setActive(true)}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setActive(false)
        setTransform(rest)
      }}
      className="group relative isolate w-full max-w-xl transform-3d"
    >
      {/* Soft green glow that intensifies on hover */}
      <div
        className={`pointer-events-none absolute inset-6 -z-10 rounded-full bg-green-500/20 blur-3xl transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-40"
        }`}
      />
      <img
        src="/images/polarzoid_crumb.png"
        alt="The PluginWizard team's Minecraft characters hanging out"
        style={{ transform, transition: "transform 150ms ease-out" }}
        className="relative z-10 w-full select-none drop-shadow-2xl will-change-transform"
        draggable={false}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function AboutPage() {
  return (
    <main className="flex flex-col bg-[#0b0b0d] text-white">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-8 lg:px-16 xl:px-24">
        {/* dotted backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-size-[20px_20px] opacity-60" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-160 -translate-x-1/2 rounded-full bg-green-500/10 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl xl:text-6xl">
              Built by players who
              <span className="block text-green-400">couldn't code Java</span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-card-muted-foreground">
              PluginWizard is a visual editor that turns drag-and-drop blocks into
              real PaperMC plugins. It exists because we wanted to make Minecraft
              plugins ourselves and discovered there was no friendly way to learn.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-green-600 text-white transition-all duration-300 hover:bg-green-700"
              >
                <Link to="/editor">
                  Try the Editor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl border-muted-foreground/20! bg-card-lighter transition-all duration-300 hover:border-muted-foreground/80! hover:bg-card-lighter/80"
              >
                <Link to="https://discord.gg/tJ67vmyW7f" target="_blank">
                  Join the Community
                </Link>
              </Button>
            </div>
          </div>

          {/* Tilting polaroid */}
          <div className="flex justify-center lg:justify-end">
            <TiltPhoto />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Origin story timeline                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-white/5 px-4 py-20 sm:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-3xl font-black uppercase tracking-[0.28em] sm:text-4xl">
              How It Started
            </h2>
            <p className="mt-4 text-lg leading-8 text-card-muted-foreground">
              Every tool is born from a problem. Ours was the steep, lonely climb
              from "I have an idea for a plugin" to actually shipping one.
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute bottom-0 left-7 top-0 w-px bg-linear-to-b from-transparent via-green-400/45 to-transparent" />

            <div className="space-y-7 md:space-y-9">
              {story.map((step, i) => (
                <article
                  key={step.title}
                  className={`group relative rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-6 pl-20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-green-400/35 hover:shadow-[0_14px_38px_rgba(34,197,94,0.12)] md:p-8 md:pl-24 ${
                    i % 2 ? "md:ml-10" : "md:mr-10"
                  }`}
                >
                  <div className="absolute left-4 top-7 md:left-5 md:top-8">
                    <div className="relative size-7 rounded-full border border-green-400/35 bg-[#0f1712]">
                      <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-300" />
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <div className="inline-flex rounded-xl border border-green-500/20 bg-green-500/10 p-2.5">
                      <step.icon className="h-5 w-5 text-lime-300" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-white/95">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-4xl leading-7 text-[#d1d5db]">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Meet the team                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-t border-white/5 px-4 py-20 sm:px-8 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-3xl font-black uppercase tracking-[0.28em] sm:text-4xl">
              Meet The Team
            </h2>
            <p className="mt-4 text-lg leading-8 text-card-muted-foreground">
              Four people, one shared goal: make plugin development feel as
              approachable as building with blocks.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.id}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-[#161616] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-500/40 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
              >
                <div className="flex items-center gap-4">
                  <Avatar member={member} />
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">{member.name}</h3>
                    <p className="text-sm font-medium text-green-400">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 flex-1">
                  <Quote className="absolute -left-1 -top-1 h-5 w-5 text-white/10" />
                  <p className="pl-5 text-sm italic leading-6 text-[#d1d5db]">
                    {member.quote}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {member.socials.map((social) => (
                    <a
                      key={social.type}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={socialLabels[social.type]}
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-400"
                    >
                      <SocialIcon type={social.type} />
                      <span className="sr-only">{socialLabels[social.type]}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
