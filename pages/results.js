import { useEffect, useState } from 'react'

const BREAKDOWN_LABELS = {
  personality:    'Personality (Big Five)',
  cleanliness:    'Cleanliness',
  smoking:        'Smoking',
  sleep_schedule: 'Sleep Schedule',
  pets:           'Pets',
  social_pref:    'Social Preference',
  location:       'Location',
}

function barColor(pct) {
  if (pct >= 75) return 'bg-green-400'
  if (pct >= 40) return 'bg-yellow-400'
  return 'bg-red-400'
}

function BreakdownBar({ label, pct }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-44 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${barColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-gray-700 font-semibold text-xs">{pct}%</span>
    </div>
  )
}

export default function ResultsPage() {
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem("matches")
    if (stored) setMatches(JSON.parse(stored))
  }, [])

  if (!matches.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-100 via-white to-purple-100">
        <p className="text-lg text-gray-500">No matches found. Try submitting your profile first.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100 via-white to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Your Top 5 Roommate Matches</h1>
        <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto text-sm">
          Matched using Big Five personality similarity, cleanliness level, and lifestyle preferences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-indigo-700">{match.name ?? 'Unknown'}</h2>
                  <p className="text-sm text-gray-400">{match.gender} · {match.location}</p>
                </div>
                <span className="text-sm bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 font-semibold">
                  {Math.min(match.similarity * 100, 100).toFixed(1)}% match
                </span>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-5">
                <p><span className="font-medium">Smoking:</span> {match.smoking}</p>
                <p><span className="font-medium">Sleep:</span> {match.sleep_schedule}</p>
                <p><span className="font-medium">Pets:</span> {match.pets}</p>
                <p><span className="font-medium">Social:</span> {match.social_pref}</p>
              </div>

              {/* Breakdown bars */}
              {match.breakdown ? (
                <>
                  <hr className="mb-4 border-gray-100" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Why you matched</p>
                  <div className="space-y-2.5">
                    {Object.entries(match.breakdown).map(([key, pct]) => (
                      <BreakdownBar key={key} label={BREAKDOWN_LABELS[key]} pct={pct} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 mt-3 italic">
                  Re-submit your profile to see the match breakdown.
                </p>
              )}

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
