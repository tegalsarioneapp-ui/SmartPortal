export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-lg text-gray-600">Page not found</p>
        <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to home
        </a>
      </div>
    </div>
  )
}
