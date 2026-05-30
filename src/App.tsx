// App.tsx
import { Outlet, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { Navbar } from './components/Navbar'
import AboutPage from './pages/AboutPage'
import EditorPage from './pages/EditorPage'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Route>
    </Routes>
  )
}