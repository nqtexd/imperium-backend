import express from 'express'
import supabase from '../config/supabase.js'

const router = express.Router()

router.get('/rounds/:challengeId', async (req, res) => {

  try {

    const { challengeId } = req.params

    const { data, error } = await supabase
      .from('rounds')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('round_order')

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