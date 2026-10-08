import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simple in-memory rate limiter (per IP)
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 8
const verifyAttempts = new Map<string, { count: number; resetAt: number }>()

function normalizeCode(input: string): string {
  return String(input || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6)
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    const now = Date.now()
    const rec = verifyAttempts.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    if (now > rec.resetAt) {
      rec.count = 0
      rec.resetAt = now + RATE_LIMIT_WINDOW_MS
    }
    rec.count++
    verifyAttempts.set(ip, rec)
    if (rec.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Príliš veľa pokusov. Skúste o minútu.', retryAfterMs: rec.resetAt - now },
        { status: 429 },
      )
    }

    const body = await req.json().catch(() => ({}))
    const raw = String(body?.code || '')
    const code = normalizeCode(raw)

    if (code.length !== 6) {
      return NextResponse.json({ error: 'Neplatný formát kódu.' }, { status: 400 })
    }

    // Clean up expired (best-effort)
    await db.skySession
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {})

    const session = await db.skySession.findUnique({ where: { code } })
    if (!session) {
      return NextResponse.json({ error: 'Kód neexistuje alebo vypršal.' }, { status: 404 })
    }
    if (session.status === 'paired' || session.paired) {
      return NextResponse.json({ error: 'Relácia je už obsadená.' }, { status: 409 })
    }
    if (session.expiresAt.getTime() < Date.now()) {
      await db.skySession.delete({ where: { id: session.id } }).catch(() => {})
      return NextResponse.json({ error: 'Kód vypršal.' }, { status: 410 })
    }

    // Mark as paired atomically (optimistic update with where clause)
    const updated = await db.skySession
      .updateMany({
        where: { id: session.id, paired: false, status: 'waiting' },
        data: { paired: true, status: 'paired', clientPeerId: 'pending', updatedAt: new Date() },
      })
      .catch(() => ({ count: 0 }))

    if (!updated || updated.count === 0) {
      // Race condition: someone else paired in the meantime
      return NextResponse.json({ error: 'Relácia bola práve obsadená.' }, { status: 409 })
    }

    return NextResponse.json({
      ok: true,
      code,
      displayCode: `${code.slice(0, 3)}-${code.slice(3)}`,
      sessionId: session.id,
      expiresAt: session.expiresAt,
      remainingSeconds: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)),
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Server error: ' + (e?.message || 'unknown') },
      { status: 500 },
    )
  }
}
