// App.tsx
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { Navbar } from './components/Navbar'
import AboutPage from './pages/AboutPage'
import EditorPage from './pages/EditorPage'
import { Footer } from './components/Footer'
import PrivacyPage from './pages/legal/PrivacyPage'
import NotFoundPage from './pages/NotFoundPage'

function Layout() {
  const location = useLocation()
  const isEditorPage = location.pathname === '/editor' // Hide footer on editor page for more space

  return (
    <>
      <Navbar />
      <Outlet />
      {!isEditorPage && <Footer />}
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
        
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}