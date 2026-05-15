import express from 'express'
import jwt from 'jsonwebtoken'
import supabase from '../config/supabase.js'

const router = express.Router()

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    return res.status(200).json({
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router