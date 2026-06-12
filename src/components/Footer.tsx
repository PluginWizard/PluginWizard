"use client"

import { Separator } from "../components/ui/separator"
import { Link } from "react-router-dom"

export function Footer() {

  return (
    <footer className="border-t border-border bg-[#0b0b0d]">
      <div className="container mx-auto px-4 py-12 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={"/images/icons/pluginwizard.png"} alt="Logo" width={"46px"} height={"46px"}></img>
              <span className="text-xl font-bold">PluginWizard</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create powerful Minecraft plugins without writing code. Visual programming made simple.
            </p>
            <div className="flex space-x-4 flex-row items-center">
              <Link to="https://discord.gg/tJ67vmyW7f" className="text-muted-foreground transition-colors" target="_blank">
                <img src="/images/icons/discord.svg" alt="discord" className="w-5 h-5" id="discord-logo" />
                <span className="sr-only">Discord</span>
              </Link>
              <Link to="https://github.com/PluginWizard/PluginWizard" className="text-muted-foreground transition-colors" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                </svg>
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/documentation" className="text-muted-foreground hover:text-green-400 transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal/privacy" className="text-muted-foreground hover:text-green-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-muted-foreground hover:text-green-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-sm text-muted-foreground flex justify-between">
          <>This Website is not an official Minecraft product. Not approved or associated with Mojang Studios or Microsoft.</>
          <div>© {new Date().getFullYear()} PluginWizard and contributors.</div>
        </div>
      </div>
    </footer>
  )
}
