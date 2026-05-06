import { useEffect, useState } from 'react'
import Link from 'next/link'

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

function timeAgo(isoString) {
  if (!isoString) return null
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (diff < 60)  return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ResultsPage() {
  const [matches, setMatches]         = useState([])
  const [userName, setUserName]       = useState('')
  const [matchedAt, setMatchedAt]     = useState(null)
  const [rerunLoading, setRerunLoading] = useState(false)
  const [hasSavedProfile, setHasSavedProfile] = useState(false)

  useEffect(() => {
    try {
      const stored   = localStorage.getItem('matches')
      const ts       = localStorage.getItem('matchedAt')
      const profile  = localStorage.getItem('savedProfile')
      const dataKey  = localStorage.getItem('savedProfileData')

      if (stored)  setMatches(JSON.parse(stored))
      if (ts)      setMatchedAt(ts)
      if (profile) setUserName(JSON.parse(profile).name || '')
      if (dataKey) setHasSavedProfile(true)
    } catch {}
  }, [])

  const handleRerun = async () => {
    const savedData = localStorage.getItem('savedProfileData')
    if (!savedData) return

    setRerunLoading(true)
    try {
      const data = JSON.parse(savedData)
      const res = await fetch('https://roommate-backend-r445.onrender.com/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(await res.text())

      const result = await res.json()
      const now = new Date().toISOString()
      localStorage.setItem('matches', JSON.stringify(result.top_matches))
      localStorage.setItem('matchedAt', now)
      setMatches(result.top_matches)
      setMatchedAt(now)
    } catch (err) {
      alert('Re-run failed: ' + err.message + '\n\nThe backend may be waking up, wait 30s and try again.')
    } finally {
      setRerunLoading(false)
    }
  }

  if (!matches.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-tr from-sky-100 via-white to-purple-100">
        <p className="text-lg text-gray-500">No matches found.</p>
        <Link href="/form" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700">
          Fill the form →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100 via-white to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Top action bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {userName ? `${userName}'s Matches` : 'Your Top 5 Roommate Matches'}
            </h1>
            {matchedAt && (
              <p className="text-sm text-gray-400 mt-1">
                Last matched {timeAgo(matchedAt)} · {new Date(matchedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="flex gap-3 shrink-0">
            <Link
              href="/form"
              className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Update Profile
            </Link>
            {hasSavedProfile && (
              <button
                onClick={handleRerun}
                disabled={rerunLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {rerunLoading ? 'Finding…' : 'Re-run Matching'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-gray-500 mb-8 max-w-2xl mx-auto text-sm">
          Matched using Big Five personality similarity, cleanliness level, and lifestyle preferences.
        </p>

        {/* ── Match cards ── */}
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
                  Click &ldquo;Re-run Matching&rdquo; to see the factor breakdown.
                </p>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
