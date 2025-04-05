// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'

// Import your GameComponent
import GameComponent from './Game/components/comp1'
function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/game">Game</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/game" element={<GameComponent />} />
      </Routes>
    </>
  )
}

export default App
