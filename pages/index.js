// src/pages/index.js

import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100 via-purple-100 to-pink-100 flex flex-col items-center p-6">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl shadow-xl p-8">
          <div className="md:w-1/2 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-indigo-700 mb-4">Find Your Ideal Roommate</h1>
            <p className="text-lg text-gray-700 mb-6">
              We help you find the perfect roommate using <strong>personality psychology</strong> and <strong>lifestyle preferences</strong>. Take our short quiz and let our matching algorithm do the rest!
            </p>
            <Link href="/form" className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-600 transition">
              Start Compatibility Quiz
            </Link>

          </div>
          <div className="md:w-1/2">
            <Image src="/roommates.png" alt="Roommates" width={500} height={400} className="rounded-xl" />
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-indigo-800 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">1. Fill the Form</h3>
              <p className="text-gray-600">Answer a short quiz about your personality and lifestyle preferences.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">2. Get Matched</h3>
              <p className="text-gray-600">Our algorithm analyzes your traits and returns your top 5 compatible roommates.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h3 className="text-xl font-semibold text-indigo-600 mb-2">3. Connect</h3>
              <p className="text-gray-600">View details of your matches and plan your next move with confidence.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-sm text-gray-500">
        Built with ❤️ using Next.js, Supabase, and FastAPI
      </div>
    </div>
  )
}