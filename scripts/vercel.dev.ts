import { readdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { resolve } from 'node:path'

import process from 'node:process'
import express, { Router } from 'express'

const PORT = process.env.PORT || 5631
const localPath = resolve(process.cwd(), 'api')

const app = express()
app.use(express.json())
const router = Router()

app.use('/api', router)
const routesPath = readdirSync(localPath)
  .filter(f => f.endsWith('.ts') && !f.startsWith('_') && statSync(`${localPath}/${f}`).isFile())
const asyncImport = routesPath.map(async (m) => {
  return {
    path: `/${m.replace('.ts', '')}`,
    fun: await import(`../api/${m}`),
  }
})
Promise.all(asyncImport).then((asyncFunc) => {
  asyncFunc.forEach((f) => {
    const keys = Object.keys(f.fun)
    if (keys.includes('default'))
      router.all(f.path, f.fun.default)
  })
})
const server = createServer(app)

server.listen(PORT, () => {
  console.log(`server is running at http://127.0.0.1:${PORT}/api/`)
})
