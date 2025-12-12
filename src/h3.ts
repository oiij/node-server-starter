import process from 'node:process'
import { H3, serve } from 'h3'

const PORT = Number(process.env.PORT) || 5632

const app = new H3({
  debug: true,
})
app.get('/h3', () => {
  return 'H3 Is Started'
})
serve(app, {
  port: PORT,
})
