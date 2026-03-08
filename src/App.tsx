import { HashRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import PlanList from './pages/PlanList'
import PlanDetail from './pages/PlanDetail'
import ShoppingList from './pages/ShoppingList'
import ImportPlan from './pages/ImportPlan'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plans" element={<PlanList />} />
        <Route path="/plans/:id" element={<PlanDetail />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/import" element={<ImportPlan />} />
      </Routes>
      <NavBar />
    </HashRouter>
  )
}
