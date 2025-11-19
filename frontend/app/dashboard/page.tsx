'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Video, Clock, HardDrive } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentVideos, setRecentVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch usage stats
      const usageResponse = await fetch('/api/user/usage')
      const usageData = await usageResponse.json()

      if (usageData.success) {
        setStats(usageData.data)
      }

      // Fetch recent videos
      const videosResponse = await fetch('/api/videos?limit=6')
      const videosData = await videosResponse.json()

      if (videosData.success) {
        setRecentVideos(videosData.data.videos)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your overview</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="w-4 h-4 mr-2" />
              Create New Video
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Videos Usage */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Video className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-gray-500 uppercase">
                {stats?.currentPlan || 'Free'} Plan
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats?.videos.used || 0}/{stats?.videos.limit || 5}
            </h3>
            <p className="text-sm text-gray-600 mb-3">Videos this month</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${stats?.videos.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.videos.percentage || 0}% used
            </p>
          </div>

          {/* Storage Usage */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="w-8 h-8 text-purple-500" />
              <span className="text-sm font-medium text-gray-500 uppercase">
                Storage
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats?.storage.usedFormatted || '0 GB'}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              of {stats?.storage.limitFormatted || '2 GB'}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${stats?.storage.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.storage.percentage || 0}% used
            </p>
          </div>

          {/* Quick Action */}
          <div className="bg-gradient-to-br from-primary to-blue-600 p-6 rounded-lg shadow-sm text-white">
            <Clock className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to create?</h3>
            <p className="text-sm mb-4 opacity-90">
              Turn your slides into videos in under 5 minutes
            </p>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/dashboard/create">
                Start Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Videos</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/videos">
                View All
              </Link>
            </Button>
          </div>

          {recentVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Video className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first lecture video to get started
              </p>
              <Button asChild>
                <Link href="/dashboard/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Video
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentVideos.map(video => (
                <div key={video.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 bg-gray-900 rounded overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{video.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      video.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {video.status}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/videos/${video.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
