// src/pages/form.js

import { useState } from 'react'
import supabase from '@/lib/supabaseClient'
import { useRouter } from 'next/router'

const TRAIT_QUESTIONS = [
  { key: 'E1', label: 'I am the life of the party.' },
  { key: 'E3', label: 'I start conversations.' },
  { key: 'E5', label: 'I talk to a lot of different people at parties.' },
  { key: 'E7', label: 'I don’t mind being the center of attention.' },
  { key: 'E9', label: 'I feel comfortable around people.' },

  { key: 'N1', label: 'I get stressed out easily.' },
  { key: 'N3', label: 'I worry about things.' },
  { key: 'N5', label: 'I am easily disturbed.' },
  { key: 'N7', label: 'I change my mood a lot.' },
  { key: 'N9', label: 'I get irritated easily.' },

  { key: 'A2', label: 'I sympathize with others’ feelings.' },
  { key: 'A4', label: 'I take time out for others.' },
  { key: 'A6', label: 'I feel others’ emotions.' },
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

export default function FormPage() {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    state: '',
    ...Object.fromEntries(TRAIT_QUESTIONS.map(q => [q.key, ''])),
    ...Object.fromEntries(LIFESTYLE_FIELDS.map(field => [field, '']))
  })
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const computeTraitScores = () => {
    const avg = (keys) => keys.map(k => parseFloat(form[k])).reduce((a, b) => a + b, 0) / keys.length
    return {
      extraversion_score: avg(['E1', 'E3', 'E5', 'E7', 'E9']),
      neuroticism_score: avg(['N1', 'N3', 'N5', 'N7', 'N9']),
      agreeableness_score: avg(['A2', 'A4', 'A6', 'A8', 'A10']),
      conscientiousness_score: avg(['C1', 'C3', 'C5', 'C7', 'C9']),
      openness_score: avg(['O3', 'O5', 'O7', 'O9', 'O10'])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const traits = computeTraitScores()
    const lifestyle = Object.fromEntries(LIFESTYLE_FIELDS.map(k => [
      k,
      k === 'cleanliness' ? (parseInt(form[k]) - 1) / 4 : form[k]  // normalize cleanliness
    ]))

    if (!VALID_STATES.includes(form.state)) {
      alert('Please select a valid Indian state.')
      return
    }

    const data = {
      name: form.name,
      gender: form.gender,
      age: parseInt(form.age),
      location: form.state,
      ...traits,
      ...lifestyle
    }

const { data: inserted, error } = await supabase.from('users').insert([data]).select()
if (!error && inserted && inserted.length > 0) {
  const user_id = inserted[0].id
  localStorage.setItem("user_id", user_id)
  console.log("Stored user_id:", user_id)

  // Send to match API
  // ✅ New (your live backend)
  const matchRes = await fetch("https://roommate-backend-r445.onrender.com/match",
 {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!matchRes.ok) {
    alert("Matching failed")
    return
  }

  const matchData = await matchRes.json()
  localStorage.setItem("matches", JSON.stringify(matchData.top_matches))
  router.push("/results")
} else {
  alert("Error submitting profile")
}
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Roommate Compatibility Form</h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          1 = Strongly Disagree → 5 = Strongly Agree
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Name</label>
              <input type="text" name="name" className="w-full border rounded p-2 bg-gray-50" onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Gender</label>
              <select name="gender" className="w-full border rounded p-2 bg-gray-50" onChange={handleChange} required>
                <option value="">Select</option>
                {OPTIONS.gender.map(opt => <option key={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Age</label>
              <input type="number" name="age" className="w-full border rounded p-2 bg-gray-50" onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">State (Location)</label>
              <select name="state" className="w-full border rounded p-2 bg-gray-50" onChange={handleChange} required>
                <option value="">Select</option>
                {VALID_STATES.map(state => <option key={state}>{state}</option>)}
              </select>
            </div>
          </div>


          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Personality Questions</h2>
            {TRAIT_QUESTIONS.map(({ key, label }) => (
              <div key={key}>
                <label className="block mb-1 text-gray-700">{label}</label>
                <select name={key} className="w-full border rounded p-2 bg-gray-50" onChange={handleChange} required>
                  <option value="">Select</option>
                  {[1,2,3,4,5].map(val => <option key={val} value={val}>{val}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Lifestyle Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LIFESTYLE_FIELDS.map(field => (
                <div key={field}>
                  <label className="block mb-1 text-gray-700">{field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                  <select name={field} className="w-full border rounded p-2 bg-gray-50" onChange={handleChange} required>
                    <option value="">Select</option>
                    {OPTIONS[field]?.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-600">
              Submit Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}