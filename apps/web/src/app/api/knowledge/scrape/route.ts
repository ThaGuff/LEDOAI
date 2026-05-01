import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Polyfill File for Node 18 — cheerio's transitive deps (undici) reference
// the File global which doesn't exist there, causing build-time evaluation to fail.
const g = globalThis as unknown as { File?: unknown }
if (typeof g.File === 'undefined') {
  g.File = class File {}
}

const MAX_PAGES = 8
const MAX_CONTENT = 40000

export async function POST(req: NextRequest) {
  const cheerio = await import('cheerio')
  const session = await getServerSession(authOptions)
  const orgId = session?.user?.organizationId
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(url.startsWith('http') ? url : `https://${url}`)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return NextResponse.json({ error: 'Only HTTP(S) URLs are supported' }, { status: 400 })
  }

  try {
    const visited = new Set<string>()
    const queue: string[] = [target.toString()]
    const pages: { url: string; title: string; text: string }[] = []

    while (queue.length > 0 && pages.length < MAX_PAGES) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      const res = await fetch(current, {
        headers: { 'User-Agent': 'LEDO-AI-Scraper/1.0' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const html = await res.text()
      const $ = cheerio.load(html)
      $('script, style, noscript, nav, footer, header').remove()
      const title = $('title').text().trim() || $('h1').first().text().trim() || current
      const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000)
      if (text.length > 100) {
        pages.push({ url: current, title, text })
      }

      if (pages.length < MAX_PAGES) {
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href')
          if (!href) return
          try {
            const next = new URL(href, current)
            if (next.host === target.host && !visited.has(next.toString()) && queue.length < MAX_PAGES * 2) {
              queue.push(next.toString())
            }
          } catch { /* skip invalid */ }
        })
      }
    }

    if (pages.length === 0) {
      return NextResponse.json({ error: 'Could not extract content from this URL' }, { status: 422 })
    }

    const combinedContent = pages
      .map((p) => `# ${p.title}\nURL: ${p.url}\n\n${p.text}`)
      .join('\n\n---\n\n')
      .slice(0, MAX_CONTENT)

    const item = await prisma.knowledgeBase.create({
      data: {
        organizationId: orgId,
        type: 'website',
        title: `Website: ${target.hostname}`,
        content: combinedContent,
        sourceUrl: target.toString(),
      },
    })

    return NextResponse.json({ item, pagesScraped: pages.length }, { status: 201 })
  } catch (err) {
    console.error('Scrape error', err)
    return NextResponse.json({ error: 'Failed to scrape website' }, { status: 500 })
  }
}
