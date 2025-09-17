import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./components/LandingPage"
import ImageAnalysis from "./components/ImageAnalysis"
import DamageDetection from "./components/DamageDetection"
import VirtualSimuCAD from "./components/VirtualSimuCAD"

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/image-analysis" element={<ImageAnalysis />} />
          <Route path="/damage-detection" element={<DamageDetection />} />
          <Route path="/virtual-simu-CAD" element={<VirtualSimuCAD />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
