// We use a dynamic import singleton to avoid Next.js 16 Turbopack
// misresolving @supabase/supabase-js to its Node.js export path during the
// production build step. Static imports let the bundler evaluate and
// potentially tree-shake or remap the package; dynamic imports are deferred
// to runtime, guaranteeing the browser always gets the browser bundle.

let clientPromise: ReturnType<typeof createSupabaseClient> | null = null

async function createSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Returns the singleton Supabase browser client.
 * Safe to call in event handlers and useEffect — never during SSR.
 */
export function getClient() {
  if (!clientPromise) {
    clientPromise = createSupabaseClient()
  }
  return clientPromise
}