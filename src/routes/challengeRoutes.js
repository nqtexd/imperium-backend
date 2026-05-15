import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import supabase from '../config/supabase.js'

const router = express.Router()

router.get('/challenges', requireAuth, async (req, res) => {

  try {

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('challenge_order')

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