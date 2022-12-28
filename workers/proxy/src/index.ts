/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  PAGES_URL: string
  B2_URL: string
}

const FILE_RE = new RegExp("/[^/]+[.][^/]+$")

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return await handleRequest(request, env).catch(
      () => new Response("An internal error occurred", { status: 500 })
    )
  },
}

async function handleRequest(request: Request, env: Env) {
  const url = new URL(request.url)
  const { pathname } = url

  let newUrl
  if (pathname.match(FILE_RE)) {
    newUrl = env.B2_URL + pathname
  } else {
    newUrl = env.PAGES_URL + pathname
  }

  return fetch(newUrl)
}
