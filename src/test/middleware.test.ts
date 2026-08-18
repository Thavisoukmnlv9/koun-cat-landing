import { describe, expect, it } from 'vitest'

import { onRequest } from '../../functions/_middleware'

/**
 * The host gate is the only thing keeping the letter and the photographs off
 * koun-cat-journey.pages.dev, which Cloudflare Access cannot cover and the
 * dashboard cannot switch off. A mistake here is silent — the site keeps
 * working on the custom domain while the old address quietly stays open — so
 * the cases that matter are asserted rather than eyeballed once.
 */

let served = 0

function respond(url: string, ALLOWED_HOSTS?: string) {
  served = 0
  return onRequest({
    request: new Request(url),
    env: { ALLOWED_HOSTS },
    next: async () => {
      served += 1
      return new Response('the site', { status: 200 })
    },
  })
}

const PAGES_DEV = 'https://koun-cat-journey.pages.dev/'
const PHOTO = '/images/journey/m20.jpg'
const CUSTOM = 'journey.example.com'

describe('when ALLOWED_HOSTS is not configured', () => {
  it('serves every host, so deploying the gate alone changes nothing', async () => {
    expect((await respond(PAGES_DEV, undefined)).status).toBe(200)
  })

  it('treats an empty or comma-only value the same as unset', async () => {
    expect((await respond(PAGES_DEV, '')).status).toBe(200)
    expect((await respond(PAGES_DEV, ' , , ')).status).toBe(200)
  })
})

describe('when a production host is pinned', () => {
  it('serves the custom domain', async () => {
    expect((await respond(`https://${CUSTOM}/`, CUSTOM)).status).toBe(200)
  })

  it('blocks the pages.dev address', async () => {
    expect((await respond(PAGES_DEV, CUSTOM)).status).toBe(404)
  })

  it('blocks photographs, not just the HTML shell', async () => {
    // Root middleware runs in front of static files; if it did not, every image
    // would still be fetchable at the old address one direct URL at a time.
    expect((await respond(`https://koun-cat-journey.pages.dev${PHOTO}`, CUSTOM)).status).toBe(404)
  })

  it('still serves those photographs on the allowed host', async () => {
    expect((await respond(`https://${CUSTOM}${PHOTO}`, CUSTOM)).status).toBe(200)
  })

  it('blocks generated preview subdomains', async () => {
    expect((await respond('https://373f31e2.koun-cat-journey.pages.dev/', CUSTOM)).status).toBe(404)
  })

  it('never reaches the site when it blocks', async () => {
    await respond(PAGES_DEV, CUSTOM)
    expect(served).toBe(0)
  })

  it('answers 404 rather than 403, so the address gives nothing away', async () => {
    const res = await respond(PAGES_DEV, CUSTOM)
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('Not found')
  })
})

describe('how the host list is read', () => {
  it('accepts several hosts', async () => {
    const list = `${CUSTOM}, www.example.com`
    expect((await respond(`https://www.example.com/`, list)).status).toBe(200)
    expect((await respond(`https://${CUSTOM}/`, list)).status).toBe(200)
  })

  it('ignores surrounding whitespace and case', async () => {
    expect((await respond('https://JOURNEY.example.com/', '  Journey.Example.com  ')).status).toBe(
      200,
    )
  })

  it('matches the whole hostname, not a suffix', async () => {
    // journey.example.com.attacker.tld ends with the allowed host; a careless
    // endsWith check would hand the album to whoever registered it.
    expect((await respond('https://journey.example.com.attacker.tld/', CUSTOM)).status).toBe(404)
  })

  it('does not treat a bare subdomain of the allowed host as allowed', async () => {
    expect((await respond('https://staging.journey.example.com/', CUSTOM)).status).toBe(404)
  })
})
