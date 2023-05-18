import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TheForm from './pages/theform'
import ThePage from './pages/thepage'
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
