// src/pages/api/submit-profile.js

import supabase from '@/lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = req.body

    // Validation (optional, add your own checks)
    if (!formData.age || !formData.gender) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Insert into Supabase
    const { data, error } = await supabase.from('users').insert([formData])

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ error: 'Server error' })
  }
}
