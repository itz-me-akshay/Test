import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'

export default function Home() {
  const [input, setInput] = useState('')
  const [lines, setLines] = useState([
    { type: 'system', text: 'TERMINAL v1.0.0 — connection established' },
    { type: 'system', text: 'Type a message and press Enter.' },
    { type: 'prompt', text: '' },
  ])
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const handleKey = async (e) => {
    if (e.key !== 'Enter' || !input.trim() || loading || sent) return
    const msg = input.trim()
    setInput('')
    setLoading(true)

    setLines(prev => [
      ...prev.slice(0, -1),
      { type: 'input', text: `> ${msg}` },
      { type: 'system', text: '...' },
    ])

    try {
      const r = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      if (r.ok) {
        setLines(prev => [
          ...prev.slice(0, -1),
          { type: 'ok', text: '✓ Message received.' },
          { type: 'ok', text: 'Your session has been logged.' },
        ])
        setSent(true)
      } else {
        throw new Error()
      }
    } catch {
      setLines(prev => [
        ...prev.slice(0, -1),
        { type: 'err', text: '✗ Transmission failed. Try again.' },
        { type: 'prompt', text: '' },
      ])
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Terminal</title>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="root" onClick={() => inputRef.current?.focus()}>
        <div className="screen">
          <div className="scanline" />
          <div className="header">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
            <span className="title">terminal — bash</span>
          </div>
          <div className="body">
            {lines.map((l, i) => (
              <div key={i} className={`line ${l.type}`}>
                {l.type === 'prompt' && !sent && !loading ? (
                  <span className="prompt-row">
                    <span className="ps1">user@node:~$ </span>
                    <span className="typed">{input}</span>
                    <span className="cursor" />
                  </span>
                ) : (
                  l.text
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {!sent && (
            <input
              ref={inputRef}
              className="hidden-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
      `}</style>

      <style jsx>{`
        .root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0a;
          padding: 2rem;
          cursor: text;
        }
        .screen {
          width: 100%;
          max-width: 680px;
          background: #0d0d0d;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(0,255,100,0.04), 0 20px 60px rgba(0,0,0,0.8);
          position: relative;
          font-family: 'JetBrains Mono', monospace;
        }
        .scanline {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 10;
        }
        .header {
          background: #161616;
          border-bottom: 1px solid #222;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot.red { background: #ff5f57; }
        .dot.yellow { background: #febc2e; }
        .dot.green { background: #28c840; }
        .title {
          margin-left: 8px;
          font-size: 11px;
          color: #555;
          letter-spacing: 0.05em;
        }
        .body {
          padding: 20px 22px;
          min-height: 280px;
          max-height: 500px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.9;
          color: #c8c8c8;
        }
        .line.system { color: #555; }
        .line.input { color: #e2e2e2; }
        .line.ok { color: #3ddc84; }
        .line.err { color: #ff5f57; }
        .line.prompt { color: #e2e2e2; min-height: 1.9em; }
        .ps1 { color: #3ddc84; }
        .typed { color: #e2e2e2; }
        .cursor {
          display: inline-block;
          width: 8px; height: 14px;
          background: #3ddc84;
          margin-left: 1px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .hidden-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          width: 1px; height: 1px;
        }
        .body::-webkit-scrollbar { width: 4px; }
        .body::-webkit-scrollbar-track { background: transparent; }
        .body::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>
    </>
  )
}
