/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { Octokit } from "octokit"

export interface Env {
  KV: KVNamespace

  B2_APPLICATION_KEY_ID: string
  B2_APPLICATION_KEY: string
  B2_BUCKET: string
  GITHUB_ACCESS_TOKEN: string
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const authResponse = await fetch(
      "https://api.backblaze.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization:
            "Basic " +
            btoa(env.B2_APPLICATION_KEY_ID + ":" + env.B2_APPLICATION_KEY),
        },
      }
    )
    const authJson = (await authResponse.json()) as {
      authorizationToken: string
      apiUrl: string
      allowed: {
        bucketId: string
      }
    }
    const authorizationToken = authJson.authorizationToken
    const apiUrl = authJson.apiUrl
    const bucketId = authJson.allowed.bucketId

    let largestModifiedMillis = 0
    let startFileName = undefined

    while (true) {
      const listResponse = await fetch(
        apiUrl + "/b2api/v2/b2_list_file_names",
        {
          method: "POST",
          headers: {
            Authorization: authorizationToken,
          },
          body: JSON.stringify({
            bucketId,
            startFileName,
            maxFileCount: 10000,
          }),
        }
      )
      const listJson = (await listResponse.json()) as {
        files: {
          uploadTimestamp: number
          fileInfo: {
            src_last_modified_millis?: number
          }
        }[]
        nextFileName: string | null
      }

      for (const file of listJson.files) {
        largestModifiedMillis = Math.max(
          largestModifiedMillis,
          file.uploadTimestamp
        )
        if (file.fileInfo.src_last_modified_millis) {
          largestModifiedMillis = Math.max(
            largestModifiedMillis,
            file.fileInfo.src_last_modified_millis
          )
        }
      }

      if (listJson.nextFileName === null) {
        break
      }

      startFileName = listJson.nextFileName
    }

    const lastModifiedMillis = parseInt(
      (await env.KV.get("lastModifiedMillis")) || "0",
      10
    )

    if (largestModifiedMillis > lastModifiedMillis) {
      const octokit = new Octokit({
        auth: env.GITHUB_ACCESS_TOKEN,
      })

      await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
        owner: "AlgoWiki",
        repo: "Archive",
        event_type: "webhook",
      })

      await env.KV.put("lastModifiedMillis", String(largestModifiedMillis))
    }
  },
}
