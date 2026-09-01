import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Home } from 'lucide-react'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-secondary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <span className="text-primary">🤖</span>
          AI Developer Review
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 hover:text-primary transition">
            <Home size={20} />
            Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user.username || 'User'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
