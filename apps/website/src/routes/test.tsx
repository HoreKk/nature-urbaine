import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getPayload, payloadConfig } from 'cms-payload';


export const getPostBySlug = createServerFn()
  .handler(async () => {
    const payload = await getPayload({ config: payloadConfig });
    const result = await payload.find({
      collection: 'categories',
      limit: 1,
      depth: 0,
    })
    return result.docs[0];
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
