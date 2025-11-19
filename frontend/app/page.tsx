import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Play, Sparkles, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">LectureAI</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Transform Slides into
            <span className="text-primary"> Professional Lecture Videos</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create engaging video content 10x faster with AI-powered voiceovers and storytelling
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard/create">
                Create Your First Video
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Generate professional videos in under 5 minutes. No recording or editing needed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Sparkles className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Story Mode</h3>
            <p className="text-gray-600">
              Transform dry content into engaging narratives that keep students hooked.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <Play className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Voiceover</h3>
            <p className="text-gray-600">
              Choose from 10+ professional voices. Sound natural and polished every time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
