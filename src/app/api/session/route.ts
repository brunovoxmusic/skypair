import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Crockford-style alphabet: no 0, O, 1, I (32 chars)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_TTL_MINUTES = 10

function generateCode(length = 6): string {
  const bytes = new Uint8Array(length)
  const c = globalThis.crypto
  c.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % 32]).join('')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const role = body?.role === 'client' ? 'client' : 'host'

    // Clean up expired sessions (best-effort)
    await db.skySession
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {})

    // Try up to 5 times to generate a unique code
    let code = ''
    let session = null
    for (let attempt = 0; attempt < 5; attempt++) {
      code = generateCode(6)
      const existing = await db.skySession.findUnique({ where: { code } })
      if (!existing) {
        const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)
        session = await db.skySession.create({
          data: { code, status: 'waiting', expiresAt },
        })
        break
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Nepodarilo sa vygenerovať unikátny kód. Skúste znova.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      code,
      displayCode: `${code.slice(0, 3)}-${code.slice(3)}`,
      sessionId: session.id,
      role,
      expiresAt: session.expiresAt,
      ttlSeconds: CODE_TTL_MINUTES * 60,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Server error: ' + (e?.message || 'unknown') },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'sky-session' })
}
