import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getPayload, SanitizedConfig } from 'payload'

export const getPostBySlug = createServerFn()
  .handler(async () => {
    const { config } = await import('cms-payload/src') as unknown as { config: SanitizedConfig };
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'users',
      limit: 1,
    })
    return result;
  })

export const Route = createFileRoute('/test')({
  component: RouteComponent,
  loader: async () => {
    const post = await getPostBySlug();
    return { post }
  }
})

function RouteComponent() {
  const test = Route.useLoaderData()
  return (
    <div>
      Hello "/test"!
      <pre>{JSON.stringify(test, null, 2)}</pre>
    </div>
  )
}
