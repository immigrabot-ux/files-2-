export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-6">
          LectureAI
        </h1>
        <p className="text-2xl text-gray-700 mb-8">
          Transform Slides into Professional Lecture Videos
        </p>
        <p className="text-lg text-gray-600">
          Server is running successfully!
        </p>
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
            <li><a href="/dashboard/create" className="text-blue-600 hover:underline">Create Video</a></li>
            <li><a href="/dashboard/settings" className="text-blue-600 hover:underline">Settings</a></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
