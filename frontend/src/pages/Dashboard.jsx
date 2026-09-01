import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { repositoryAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { Plus, GitBranch, ExternalLink, Trash2 } from 'lucide-react'

export default function Dashboard() {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', url: '', description: '', language: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchRepositories()
  }, [])

  const fetchRepositories = async () => {
    try {
      const response = await repositoryAPI.getAll()
      setRepositories(response.data.repositories || [])
    } catch (err) {
      setError('Failed to fetch repositories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRepository = async (e) => {
    e.preventDefault()
    try {
      await repositoryAPI.create(formData)
      setFormData({ name: '', url: '', description: '', language: '' })
      setShowForm(false)
      fetchRepositories()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add repository')
    }
  }

  const handleDeleteRepository = async (id) => {
    if (confirm('Are you sure you want to delete this repository?')) {
      try {
        await repositoryAPI.delete(id)
        fetchRepositories()
      } catch (err) {
        setError('Failed to delete repository')
      }
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Manage and review your repositories</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            Add Repository
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Add New Repository</h2>
            <form onSubmit={handleAddRepository} className="space-y-4">
              <input
                type="text"
                placeholder="Repository Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              />
              <input
                type="url"
                placeholder="Repository URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                placeholder="Language (e.g., JavaScript, Python)"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-primary focus:outline-none"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Add Repository
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400">Loading repositories...</div>
        ) : repositories.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <GitBranch className="mx-auto mb-4 text-gray-500" size={48} />
            <p className="text-gray-400 text-lg mb-4">No repositories yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Add Your First Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <div key={repo._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-primary transition cursor-pointer" onClick={() => navigate(`/repositories/${repo._id}`)}>
                <h3 className="text-xl font-bold text-white mb-2">{repo.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{repo.description || 'No description'}</p>
                
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <GitBranch size={16} />
                    <span>{repo.language || 'Unknown'}</span>
                  </div>
                  {repo.codeQualityScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Quality Score:</span>
                      <span className="text-green-400 font-bold">{repo.codeQualityScore}%</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm"
                  >
                    <ExternalLink size={16} />
                    GitHub
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRepository(repo._id)
                    }}
                    className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
