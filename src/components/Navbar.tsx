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
        <nav className="fixed top-0 z-101 w-full bg-[#0b0b0d]/90 backdrop-blur-sm">
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
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
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

                    {/* Desktop Social Links */}
                    <div className="ml-auto hidden items-center space-x-4 md:flex">
                        <Link to="https://discord.gg/wGKncuKFAw" className="text-muted-foreground transition-colors" target="_blank">
                            <img src="/images/icons/discord.svg" alt="discord" className="w-5 h-5 transition-all duration-200 hover:brightness-125" id="discord-logo" />
                            <span className="sr-only">Discord</span>
                        </Link>
                        <Link to="https://github.com/PluginWizard/PluginWizard" className="text-muted-foreground transition-colors hover:text-foreground" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                            </svg>
                            <span className="sr-only">GitHub</span>
                        </Link>
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
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive
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
