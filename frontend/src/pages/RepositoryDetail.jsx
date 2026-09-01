import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { repositoryAPI, reviewAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { ArrowLeft, Play, Eye } from 'lucide-react'

export default function RepositoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repository, setRepository] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRepositoryAndReviews()
  }, [id])

  const fetchRepositoryAndReviews = async () => {
    try {
      const [repoRes, reviewsRes] = await Promise.all([
        repositoryAPI.getById(id),
        reviewAPI.getAll()
      ])
      setRepository(repoRes.data.repository)
      // Filter reviews for this repository
      const repoReviews = reviewsRes.data.reviews.filter(
        (review) => review.repositoryId._id === id
      )
      setReviews(repoReviews)
    } catch (err) {
      setError('Failed to load repository')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartReview = async () => {
    setAnalyzing(true)
    try {
      const response = await reviewAPI.create({
        repositoryId: id,
        pullRequestUrl: repository.url
      })
      // TODO: Redirect to review results or poll for status
      alert('Code review started! This will be processed in the background.')
      fetchRepositoryAndReviews()
    } catch (err) {
      setError('Failed to start review')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="text-center text-gray-400 py-12">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {repository && (
          <>
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">{repository.name}</h1>
              <p className="text-gray-400 mb-6">{repository.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Language</p>
                  <p className="text-white text-lg font-bold">{repository.language || 'Unknown'}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Quality Score</p>
                  <p className="text-green-400 text-lg font-bold">{repository.codeQualityScore || '-'}%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Reviews</p>
                  <p className="text-white text-lg font-bold">{reviews.length}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Last Analyzed</p>
                  <p className="text-white text-lg font-bold">
                    {repository.lastAnalyzedAt 
                      ? new Date(repository.lastAnalyzedAt).toLocaleDateString() 
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartReview}
                disabled={analyzing}
                className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
              >
                <Play size={20} />
                {analyzing ? 'Starting Review...' : 'Start Code Review'}
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Reviews</h2>
              {reviews.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
                  <p className="text-gray-400">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-primary transition cursor-pointer" onClick={() => navigate(`/reviews/${review._id}`)}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Review #{reviews.indexOf(review) + 1}</p>
                          <p className="text-white text-lg font-semibold">Quality Score: {review.codeQualityScore || '-'}%</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          review.status === 'completed' ? 'bg-green-900 text-green-200' :
                          review.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-gray-700 text-gray-200'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">{review.summary || 'No summary available'}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          {review.totalIssues} issues found
                        </span>
                        <Eye className="text-primary" size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
