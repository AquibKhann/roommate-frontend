// src/pages/results.js

import { useEffect, useState } from 'react'

export default function ResultsPage() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem("matches")
    if (stored) {
      setMatches(JSON.parse(stored))
    }
  }, [])

 

  if (!matches.length) return <div className="text-center mt-10 text-lg">No matches found.</div>


  

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100 via-white to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Your Top 5 Roommate Matches</h1>

        <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
          You have been matched based on similarity in: personality traits (Big Five), cleanliness level,
          smoking preference, sleep schedule, social preference, pet preference, and state location.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-indigo-700">{match.name}</h2>
                <span className="text-sm bg-blue-100 text-blue-700 rounded-full px-3 py-1 font-medium">
                  Match Score: {match.similarity.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-700">
                <p><strong>Gender:</strong> {match.gender}</p>
                <p><strong>Location (State):</strong> {match.location}</p>
                <p><strong>Cleanliness:</strong> {match.cleanliness}</p>
                <p><strong>Smoking:</strong> {match.smoking}</p>
                <p><strong>Sleep Schedule:</strong> {match.sleep_schedule}</p>
                <p><strong>Pets:</strong> {match.pets}</p>
                <p><strong>Social Preference:</strong> {match.social_pref}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
