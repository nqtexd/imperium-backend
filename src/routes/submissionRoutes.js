import express from 'express'
import upload from '../middleware/upload.js'
import supabase from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/submit', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { user_id, round_id } = req.body

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      })
    }

    // Get round details
    const { data: roundData, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', round_id)
      .single()

    if (roundError || !roundData) {
      return res.status(404).json({
        error: 'Round not found'
      })
    }

    // Check deadline
    if (
      roundData.deadline &&
      new Date() > new Date(roundData.deadline)
    ) {
      return res.status(400).json({
        error: 'Submission deadline passed'
      })
    }

    // Count previous submissions
    const { data: previousSubmissions, error: submissionError } =
      await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user_id)
        .eq('round_id', round_id)

    if (submissionError) {
      return res.status(500).json({
        error: submissionError.message
      })
    }

    const attemptNo = previousSubmissions.length + 1

    // Check max attempts
    if (attemptNo > roundData.max_submission) {
      return res.status(400).json({
        error: 'Maximum submission attempts reached'
      })
    }

    // Generate file path
    const filePath = `${user_id}/round-${round_id}-attempt-${attemptNo}.csv`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, req.file.buffer, {
        contentType: 'text/csv',
        upsert: false
      })

    if (uploadError) {
      return res.status(500).json({
        error: uploadError.message
      })
    }

    // Save submission in DB
    const { data: submissionData, error: insertError } =
      await supabase
        .from('submissions')
        .insert([
          {
            user_id,
            round_id,
            file_url: filePath,
            file_name: req.file.originalname,
            attempt_no: attemptNo
          }
        ])
        .select()

    if (insertError) {
      return res.status(500).json({
        error: insertError.message
      })
    }

    return res.status(200).json({
      message: 'Submission uploaded successfully',
      submission: submissionData
    })

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
})

export default router