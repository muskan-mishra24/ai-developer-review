import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reviewAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { ArrowLeft, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

const severityColors = {
  critical: 'bg-red-900 text-red-200',
  high: 'bg-orange-900 text-orange-200',
  medium: 'bg-yellow-900 text-yellow-200',
  low: 'bg-blue-900 text-blue-200',
  info: 'bg-gray-700 text-gray-200'
}

export default function ReviewResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReview()
  }, [id])

  const fetchReview = async () => {
    try {
      const response = await reviewAPI.getById(id)
      setReview(response.data.review)
    } catch (err) {
      setError('Failed to load review')
      console.error(err)
    } finally {
      setLoading(false)
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

        {review && (
          <>
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {review.repositoryId.name}
                  </h1>
                  <p className="text-gray-400">Code Review Report</p>
                </div>
                <span className={`px-4 py-2 rounded-lg font-semibold ${
                  review.status === 'completed' ? 'bg-green-900 text-green-200' :
                  review.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                  'bg-gray-700 text-gray-200'
                }`}>
                  {review.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Code Quality Score</p>
                  <p className="text-4xl font-bold text-green-400">{review.codeQualityScore || '-'}%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Total Issues</p>
                  <p className="text-4xl font-bold text-orange-400">{review.totalIssues || 0}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Files Analyzed</p>
                  <p className="text-4xl font-bold text-blue-400">{review.filesAnalyzed || 0}</p>
                </div>
              </div>

              {review.summary && (
                <div className="mt-6 bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm mb-2">Summary</p>
                  <p className="text-white">{review.summary}</p>
                </div>
              )}
            </div>

            {review.issues && review.issues.length > 0 && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-white">Issues Found</h2>
                </div>

                <div className="divide-y divide-gray-700">
                  {review.issues.map((issue, index) => (
                    <div key={index} className="p-6 hover:bg-gray-700 transition">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 ${
                          issue.severity === 'critical' ? 'text-red-400' :
                          issue.severity === 'high' ? 'text-orange-400' :
                          issue.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {issue.severity === 'critical' || issue.severity === 'high' ? (
                            <AlertTriangle size={24} />
                          ) : (
                            <AlertCircle size={24} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColors[issue.severity]}`}>
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-gray-200">
                              {issue.type.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-gray-300 mb-3">{issue.description}</p>

                          {issue.file && (
                            <p className="text-gray-400 text-sm mb-2">
                              📄 <strong>{issue.file}</strong>
                              {issue.lineNumber && ` (Line ${issue.lineNumber})`}
                            </p>
                          )}

                          {issue.codeSnippet && (
                            <div className="bg-gray-900 rounded-lg p-3 mb-3 overflow-x-auto">
                              <pre className="text-sm text-gray-300 font-mono">{issue.codeSnippet}</pre>
                            </div>
                          )}

                          {issue.suggestion && (
                            <div className="bg-green-900 border border-green-700 rounded-lg p-3 text-green-200">
                              <p className="font-semibold mb-1">💡 Suggestion:</p>
                              <p>{issue.suggestion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
