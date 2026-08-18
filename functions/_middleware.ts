/**
 * Cloudflare Access can only bind to a hostname inside a Cloudflare zone, which
 * means the project's own koun-cat-journey.pages.dev address cannot be put
 * behind it. Without this the letter and the photographs stay readable there
 * even after the custom domain is locked down, and there is no dashboard switch
 * to turn that address off. This is the switch.
 *
 * Root middleware runs in front of static files as well as routes, so the
 * images under /images/journey are covered too — not just the HTML shell.
 *
 * ALLOWED_HOSTS is a comma-separated list, set per environment under
 * Settings > Environment variables in the Pages dashboard. Leaving it unset
 * allows everything, which is deliberate: it lets this file deploy without
 * changing behaviour until the variable is in place, and it leaves preview
 * builds alone. Previews are guarded by the project's preview access policy
 * instead, and 404ing them would make every branch deployment useless.
 */

type MiddlewareContext = {
  request: Request
  env: { ALLOWED_HOSTS?: string }
  next: () => Promise<Response>
}

export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const { request, env, next } = context

  const allowed = (env.ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)

  if (allowed.length === 0) return next()

  // Port and case are stripped by `hostname`; a Host header carrying either
  // should still match a plainly-written entry in the list.
  const hostname = new URL(request.url).hostname.toLowerCase()
  if (allowed.includes(hostname)) return next()

  // 404 rather than 403. A refusal confirms there is something here worth
  // refusing, and the point of this address is to stop being a way in at all.
  return new Response('Not found', {
    status: 404,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
