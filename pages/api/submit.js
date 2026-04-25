import fs from 'fs'
import path from 'path'

const FILE = path.join('/tmp', 'ip.json')

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) } catch { return [] }
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message } = req.body
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' })

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'

  const entry = {
    id: Date.now().toString(),
    message: message.trim().slice(0, 500),
    ip,
    ua: req.headers['user-agent'] || 'unknown',
    ts: new Date().toISOString(),
  }

  const entries = load()
  entries.unshift(entry)
  save(entries.slice(0, 500))

  return res.status(200).json({ ok: true })
}
