"use client"

import { useState } from "react"
import { Blocks, Menu, X, Home, Info, Book } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Editor", href: "/editor", icon: Blocks },
  { name: "Documentation", href: "/docs", icon: Book },
  { name: "About", href: "/about", icon: Info },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0b0b0d]/90 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <img src="/images/icons/pluginwizard.png" width="42px" height="42px"></img>
                    <span className="text-xl font-bold">PluginWizard</span>
                </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-8 md:flex">
                {navigation.map((item) => {
              const isActive = location.pathname === item.href

                return (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                            ? "bg-green-500/10 text-green-400"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-500/10"
                        }`}
                        >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                    </Link>
                )
                })}
            </div>


            {/* Mobile menu button */}
      <div className="ml-auto flex items-center md:hidden">
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="rounded-lg">
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
            {navigation.map((item) => {
            const isActive = location.pathname === item.href
            
            return (
                <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive
                    ? "bg-green-500/10 text-green-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                </Link>
            )
            })}
        </div>
      </div>
      )}
    </nav>
  )
}
