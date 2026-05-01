import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ROWS = 500
const MAX_CONTENT = 40000

// Convert any Google Sheets URL into a CSV export URL.
// Supported inputs:
//   https://docs.google.com/spreadsheets/d/<ID>/edit#gid=<GID>
//   https://docs.google.com/spreadsheets/d/<ID>/edit?gid=<GID>
//   https://docs.google.com/spreadsheets/d/<ID>/
function toCsvUrl(input: string): { csvUrl: string; sheetId: string } | null {
  try {
    const u = new URL(input.trim())
    if (!u.hostname.includes('docs.google.com')) return null
    const m = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!m) return null
    const sheetId = m[1]
    const gidParam = u.hash.match(/gid=([0-9]+)/) || u.searchParams.get('gid')
    const gid = Array.isArray(gidParam) ? gidParam[1] : gidParam || '0'
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    return { csvUrl, sheetId }
  } catch {
    return null
  }
}

// Minimal RFC 4180 CSV parser (handles quoted fields, embedded commas, escaped quotes, CRLF).
function parseCsv(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && input[i + 1] === '\n') i++
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += c
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, title } = await req.json().catch(() => ({}))
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Google Sheet URL is required' }, { status: 400 })
  }

  const parsed = toCsvUrl(url)
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          'Invalid Google Sheets URL. Make sure the sheet is shared as "Anyone with the link can view" and copy the address bar URL.',
      },
      { status: 400 },
    )
  }

  try {
    const res = await fetch(parsed.csvUrl, {
      headers: { 'User-Agent': 'LEDO-AI-KB/1.0', Accept: 'text/csv' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            res.status === 401 || res.status === 403
              ? 'Sheet is private. Share it as "Anyone with the link can view" and try again.'
              : `Could not fetch sheet (status ${res.status}).`,
        },
        { status: 422 },
      )
    }
    const csv = await res.text()
    const rows = parseCsv(csv).filter((r) => r.some((c) => c.trim().length > 0))
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sheet appears empty' }, { status: 422 })
    }

    const header = rows[0].map((h) => h.trim() || '_')
    const dataRows = rows.slice(1, MAX_ROWS + 1)

    // Render as Q/A markdown if there are recognizable question/answer columns,
    // otherwise as a labeled key:value list per row.
    const lowerHeader = header.map((h) => h.toLowerCase())
    const qIdx = lowerHeader.findIndex((h) => /question|q$|prompt/.test(h))
    const aIdx = lowerHeader.findIndex((h) => /answer|a$|reply|response/.test(h))

    let content: string
    if (qIdx >= 0 && aIdx >= 0) {
      content = dataRows
        .map((r) => {
          const q = (r[qIdx] || '').trim()
          const a = (r[aIdx] || '').trim()
          if (!q && !a) return ''
          return `Q: ${q}\nA: ${a}`
        })
        .filter(Boolean)
        .join('\n\n')
    } else {
      content = dataRows
        .map((r) => header.map((h, i) => `${h}: ${(r[i] || '').trim()}`).join('\n'))
        .join('\n\n---\n\n')
    }

    content = content.slice(0, MAX_CONTENT)
    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Sheet did not contain any usable rows' }, { status: 422 })
    }

    const item = await prisma.knowledgeBase.create({
      data: {
        organizationId: orgId,
        type: 'google_sheet',
        title: (title && String(title).trim()) || `Google Sheet ${parsed.sheetId.slice(0, 8)}`,
        content,
        sourceUrl: url,
      },
    })

    return NextResponse.json({ item, rowsImported: dataRows.length }, { status: 201 })
  } catch (err) {
    console.error('Google Sheet import failed', err)
    return NextResponse.json({ error: 'Failed to import Google Sheet' }, { status: 500 })
  }
}
