import { Link, Routes, Route } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import './App.css'
import Home from './pages/Home'
import Users from './pages/Users'

function App() {

  return (
    <>
      {/* Navigation Menu Bar */}
      <nav className="menu-bar">
        <div className="menu-container">
          <div className="menu-brand">
            <Link to="/" className="brand-link">
              <img src={reactLogo} className="brand-logo" alt="React" />
              React Demo
            </Link>
          </div>
          <ul className="menu-nav">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/users" className="nav-link">Users</Link></li>
            <li><Link to="/roles" className="nav-link">Roles</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </main>
    </>
  )
}

export default App
