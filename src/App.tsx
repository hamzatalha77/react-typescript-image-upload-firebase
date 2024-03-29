import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TheForm from './pages/TheForm'
import ThePage from './pages/ThePage'
import './index.css'
const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<TheForm />} />
          <Route path="/thepage" element={<ThePage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
