import express from 'express'
import supabase from '../config/supabase.js'

const router = express.Router()

router.get('/leaderboard', async (req, res) => {

  try {

    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        score,
        rank,
        users (
          email
        )
      `)
      .order('score', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: error.message
      })
    }

    return res.status(200).json(data)

  } catch (error) {

    return res.status(500).json({
      error: error.message
    })
  }
})

export default router