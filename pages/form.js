import { useState, useEffect } from 'react'
import Link from 'next/link'
import supabase from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

const TRAIT_QUESTIONS = [
  { key: 'E1', label: 'I am the life of the party.' },
  { key: 'E3', label: 'I start conversations.' },
  { key: 'E5', label: 'I talk to a lot of different people at parties.' },
  { key: 'E7', label: 'I don\'t mind being the center of attention.' },
  { key: 'E9', label: 'I feel comfortable around people.' },

  { key: 'N1', label: 'I get stressed out easily.' },
  { key: 'N3', label: 'I worry about things.' },
  { key: 'N5', label: 'I am easily disturbed.' },
  { key: 'N7', label: 'I change my mood a lot.' },
  { key: 'N9', label: 'I get irritated easily.' },

  { key: 'A2', label: 'I sympathize with others\' feelings.' },
  { key: 'A4', label: 'I take time out for others.' },
  { key: 'A6', label: 'I feel others\' emotions.' },
  { key: 'A8', label: 'I make people feel at ease.' },
  { key: 'A10', label: 'I am interested in people.' },

  { key: 'C1', label: 'I am always prepared.' },
  { key: 'C3', label: 'I pay attention to details.' },
  { key: 'C5', label: 'I get chores done right away.' },
  { key: 'C7', label: 'I follow a schedule.' },
  { key: 'C9', label: 'I like order.' },

  { key: 'O3', label: 'I have a vivid imagination.' },
  { key: 'O5', label: 'I have excellent ideas.' },
  { key: 'O7', label: 'I am quick to understand things.' },
  { key: 'O9', label: 'I spend time reflecting on things.' },
  { key: 'O10', label: 'I use difficult words.' }
]

const LIFESTYLE_FIELDS = [
  'cleanliness', 'sleep_schedule', 'smoking', 'drinking', 'cooking',
  'pets', 'guests', 'noise', 'study_time', 'social_pref'
]

const OPTIONS = {
  gender: ['Male', 'Female', 'Other'],
  sleep_schedule: ['Early', 'Late', 'Flexible'],
  smoking: ['Yes', 'No'],
  drinking: ['Yes', 'No'],
  cooking: ['Yes', 'No'],
  pets: ['Yes', 'No'],
  guests: ['Yes', 'No'],
  noise: ['Silent', 'Moderate', 'Noisy'],
  study_time: ['Morning', 'Night', 'Flexible'],
  social_pref: ['Introvert', 'Ambivert', 'Extrovert'],
  cleanliness: ['1', '2', '3', '4', '5']
}

const VALID_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
]

const EMPTY_FORM = {
  name: '', gender: '', age: '', state: '',
  ...Object.fromEntries(TRAIT_QUESTIONS.map(q => [q.key, ''])),
  ...Object.fromEntries(LIFESTYLE_FIELDS.map(f => [f, '']))
}

export default function FormPage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Load saved profile on mount and pre-fill the form
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedProfile')
      if (saved) {
        const parsed = JSON.parse(saved)
        setForm(prev => ({ ...prev, ...parsed }))
        setIsReturningUser(true)
      }
    } catch {}
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const computeTraitScores = (f) => {
    const avg = (keys) => keys.map(k => parseFloat(f[k])).reduce((a, b) => a + b, 0) / keys.length
    return {
      extraversion_score:      avg(['E1', 'E3', 'E5', 'E7', 'E9']),
      neuroticism_score:       avg(['N1', 'N3', 'N5', 'N7', 'N9']),
      agreeableness_score:     avg(['A2', 'A4', 'A6', 'A8', 'A10']),
      conscientiousness_score: avg(['C1', 'C3', 'C5', 'C7', 'C9']),
      openness_score:          avg(['O3', 'O5', 'O7', 'O9', 'O10'])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!VALID_STATES.includes(form.state)) {
      alert('Please select a valid Indian state.')
      return
    }

    const traits = computeTraitScores(form)
    const lifestyle = Object.fromEntries(LIFESTYLE_FIELDS.map(k => [
      k,
      k === 'cleanliness' ? (parseInt(form[k]) - 1) / 4 : form[k]
    ]))

    const data = {
      name: form.name,
      gender: form.gender,
      age: parseInt(form.age),
      location: form.state,
      ...traits,
      ...lifestyle
    }

    setLoading(true)
    try {
      // Always insert a fresh row so the profile in the DB stays current
      const { data: inserted, error } = await supabase.from('users').insert([data]).select()
      if (error || !inserted || inserted.length === 0) {
        alert('Error submitting profile: ' + (error?.message || 'Unknown error'))
        return
      }

      // Persist everything needed for returning-user experience
      localStorage.setItem('user_id', inserted[0].id)
      localStorage.setItem('savedProfile', JSON.stringify(form))        // raw form → pre-fill
      localStorage.setItem('savedProfileData', JSON.stringify(data))    // computed → re-match

      const matchRes = await fetch('https://roommate-backend-r445.onrender.com/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!matchRes.ok) {
        const errBody = await matchRes.text()
        alert('Matching failed (status ' + matchRes.status + '): ' + errBody)
        return
      }

      const matchData = await matchRes.json()
      localStorage.setItem('matches', JSON.stringify(matchData.top_matches))
      localStorage.setItem('matchedAt', new Date().toISOString())
      router.push('/results')
    } catch (err) {
      alert(
        'Network error: ' + err.message +
        '\n\nThe backend may be waking up (Render free tier). Please wait 30–60 seconds and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8">

        {/* ── Welcome-back banner ── */}
        {isReturningUser && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-indigo-700">Welcome back, {form.name}!</p>
              <p className="text-sm text-indigo-500 mt-0.5">
                Your profile is pre-filled below. Change whatever you like, then re-submit to get fresh recommendations.
              </p>
            </div>
            <Link
              href="/results"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition text-center"
            >
              View last results →
            </Link>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Roommate Compatibility Form</h1>
        <p className="text-sm text-center text-gray-500 mb-8">
          {isReturningUser
            ? 'Update any section below and re-submit — only changed fields affect your new matches.'
            : '1 = Strongly Disagree → 5 = Strongly Agree'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Basic info ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Name</label>
              <input
                type="text" name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-50"
                required
              >
                <option value="">Select</option>
                {OPTIONS.gender.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Age</label>
              <input
                type="number" name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-50"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">State (Location)</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border rounded p-2 bg-gray-50"
                required
              >
                <option value="">Select</option>
                {VALID_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* ── Personality questions ── */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Personality Questions</h2>
            <p className="text-sm text-gray-500">1 = Strongly Disagree &rarr; 5 = Strongly Agree</p>
            {TRAIT_QUESTIONS.map(({ key, label }) => (
              <div key={key}>
                <label className="block mb-1 text-gray-700">{label}</label>
                <select
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  className="w-full border rounded p-2 bg-gray-50"
                  required
                >
                  <option value="">Select</option>
                  {[1, 2, 3, 4, 5].map(val => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* ── Lifestyle preferences ── */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Lifestyle Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LIFESTYLE_FIELDS.map(field => (
                <div key={field}>
                  <label className="block mb-1 text-gray-700">
                    {field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </label>
                  <select
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full border rounded p-2 bg-gray-50"
                    required
                  >
                    <option value="">Select</option>
                    {OPTIONS[field]?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Finding matches… (may take ~30s)'
                : isReturningUser ? 'Re-run Matching' : 'Submit Profile'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
