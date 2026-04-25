import { useState } from 'react'
import Head from 'next/head'

export default function Admin() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(e) {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`/api/entries?key=${encodeURIComponent(key)}`)
      if (r.status === 401) { setError('Invalid key.'); setLoading(false); return }
      const data = await r.json()
      setEntries(data.entries || [])
      setAuthed(true)
    } catch {
      setError('Failed to connect.')
    }
    setLoading(false)
  }

  async function refresh() {
    setLoading(true)
    try {
      const r = await fetch(`/api/entries?key=${encodeURIComponent(key)}`)
      const data = await r.json()
      setEntries(data.entries || [])
    } catch {}
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Admin</title>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">
        {!authed ? (
          <form className="login" onSubmit={login}>
            <div className="lock">⬡</div>
            <h1>ADMIN ACCESS</h1>
            <p className="sub">Enter admin key to continue</p>
            <input
              type="password"
              placeholder="Admin key"
              value={key}
              onChange={e => setKey(e.target.value)}
              autoFocus
            />
            {error && <p className="err">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'ENTER →'}
            </button>
          </form>
        ) : (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h1>IP LOG</h1>
                <span className="count">{entries.length} entries</span>
              </div>
              <button className="refresh" onClick={refresh} disabled={loading}>
                {loading ? '...' : '↻ Refresh'}
              </button>
            </div>

            {entries.length === 0 ? (
              <p className="empty">No entries yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>IP</th>
                      <th>Message</th>
                      <th>Time</th>
                      <th>User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={e.id}>
                        <td className="num">{i + 1}</td>
                        <td className="ip">{e.ip}</td>
                        <td className="msg">{e.message}</td>
                        <td className="ts">{new Date(e.ts).toLocaleString()}</td>
                        <td className="ua" title={e.ua}>{e.ua.slice(0, 40)}{e.ua.length > 40 ? '…' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; font-family: 'JetBrains Mono', monospace; color: #c8c8c8; }
      `}</style>

      <style jsx>{`
        .root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        /* LOGIN */
        .login {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
          max-width: 360px;
        }
        .lock {
          font-size: 2.5rem;
          color: #3ddc84;
          line-height: 1;
          margin-bottom: 4px;
        }
        h1 {
          font-size: 1rem;
          letter-spacing: 0.2em;
          color: #eee;
        }
        .sub { font-size: 11px; color: #555; }
        .login input {
          width: 100%;
          background: #111;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 10px 14px;
          color: #eee;
          font-family: inherit;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .login input:focus { border-color: #3ddc84; }
        .err { color: #ff5f57; font-size: 12px; }
        .login button {
          width: 100%;
          background: #3ddc84;
          color: #0a0a0a;
          border: none;
          border-radius: 6px;
          padding: 10px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .login button:disabled { opacity: 0.5; cursor: not-allowed; }
        /* PANEL */
        .panel { width: 100%; max-width: 1100px; }
        .panel-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .panel-header h1 {
          letter-spacing: 0.2em;
          font-size: 1.1rem;
          color: #eee;
        }
        .count { font-size: 11px; color: #555; display: block; margin-top: 2px; }
        .refresh {
          background: #161616;
          border: 1px solid #2a2a2a;
          border-radius: 6px;
          padding: 7px 14px;
          color: #888;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .refresh:hover { color: #3ddc84; border-color: #3ddc84; }
        .refresh:disabled { opacity: 0.4; cursor: not-allowed; }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #1e1e1e;
          border-radius: 8px;
        }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead { background: #111; }
        th {
          text-align: left;
          padding: 10px 14px;
          color: #555;
          font-weight: 400;
          letter-spacing: 0.08em;
          font-size: 10px;
          text-transform: uppercase;
          border-bottom: 1px solid #1e1e1e;
        }
        td { padding: 10px 14px; border-bottom: 1px solid #151515; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #0f0f0f; }
        .num { color: #444; width: 36px; }
        .ip { color: #3ddc84; white-space: nowrap; }
        .msg { color: #ccc; max-width: 320px; word-break: break-word; }
        .ts { color: #555; white-space: nowrap; font-size: 11px; }
        .ua { color: #444; font-size: 10px; max-width: 200px; }
        .empty { color: #444; text-align: center; padding: 3rem; font-size: 12px; }
      `}</style>
    </>
  )
}
