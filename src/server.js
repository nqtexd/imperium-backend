import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import submissionRoutes from './routes/submissionRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js'
import challengeRoutes from './routes/challengeRoutes.js'
import roundRoutes from './routes/roundRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: '*'
}))

app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', submissionRoutes)
app.use('/api', progressRoutes)
app.use('/api', leaderboardRoutes)
app.use('/api', challengeRoutes)
app.use('/api', roundRoutes)

app.get('/', (req, res) => {
  res.send('Imperium Backend Running')
})

const PORT = process.env.PORT || 5000

app.use((err, req, res, next) => {

  return res.status(500).json({
    error: err.message
  })

})

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Backend Running'
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})