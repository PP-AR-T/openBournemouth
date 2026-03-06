import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AboutPage } from '@/pages/AboutPage'
import { EconomyPage } from '@/pages/EconomyPage'
import { HousingPage } from '@/pages/HousingPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { MethodologyPage } from '@/pages/MethodologyPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { PopulationPage } from '@/pages/PopulationPage'
import { SafetyPage } from '@/pages/SafetyPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/housing" element={<HousingPage />} />
        <Route path="/population" element={<PopulationPage />} />
        <Route path="/economy" element={<EconomyPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
