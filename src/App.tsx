import { useState, useEffect } from 'react'

const stack = [
  { label: 'Framework', value: 'React 19' },
  { label: 'Build Tool', value: 'Vite + SWC' },
  { label: 'Styling', value: 'Tailwind CSS v4' },
  { label: 'Language', value: 'TypeScript' },
]

export default function App() {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="flex flex-col items-center justify-center min-h-screen gap-10 p-8">

        <div className="text-center space-y-3">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Hello World
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            PluginWizard is up and running
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {stack.map(({ label, value }) => (
            <div
              key={label}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center"
            >
              <div className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                {label}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {value}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
        >
          {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          App is healthy
        </div>

      </div>
    </div>
  )
}
