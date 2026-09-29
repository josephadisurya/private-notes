// Thin server-only PostgREST client, shared by every notes_* table. The
// service-role key bypasses RLS entirely, so this must never be imported
// from client components — only from getServerSideProps / API routes.
// (Same project/pattern as spending-tracker's and mosaics's lib/supabase.js,
// reusing the one Supabase account with its own tables here.)
function base(table) {
  return `${process.env.SUPABASE_URL}/rest/v1/${table}`
}

function headers(extra = {}) {
  return {
    'Content-Type': 'application/json',
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    ...extra,
  }
}

// query: object of PostgREST query params, e.g. { select: '*', order: 'position.asc' }
export async function sbSelect(table, query = {}) {
  const qs = new URLSearchParams({ select: '*', ...query }).toString()
  const r = await fetch(`${base(table)}?${qs}`, { headers: headers(), cache: 'no-store' })
  if (!r.ok) throw new Error(`Supabase select on ${table} failed: ${r.status} ${await r.text()}`)
  return r.json()
}

export async function sbInsert(table, rows) {
  if (Array.isArray(rows) && rows.length === 0) return []
  const r = await fetch(base(table), {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(rows),
  })
  if (!r.ok) throw new Error(`Supabase insert on ${table} failed: ${r.status} ${await r.text()}`)
  return r.json()
}

// Upsert by primary key — safe to call repeatedly (used for the fixed
// board row and for re-seeding).
export async function sbUpsert(table, rows, onConflict) {
  if (Array.isArray(rows) && rows.length === 0) return []
  const r = await fetch(`${base(table)}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(rows),
  })
  if (!r.ok) throw new Error(`Supabase upsert on ${table} failed: ${r.status} ${await r.text()}`)
  return r.json()
}

export async function sbDelete(table, filterCol, filterVal) {
  const r = await fetch(`${base(table)}?${filterCol}=eq.${encodeURIComponent(filterVal)}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!r.ok) throw new Error(`Supabase delete on ${table} failed: ${r.status} ${await r.text()}`)
}

// filterCol/filterVal: simple `col=eq.val` filter — every table here is
// small and single-user/single-board, so this covers every update this app needs.
export async function sbUpdate(table, filterCol, filterVal, patch) {
  const r = await fetch(`${base(table)}?${filterCol}=eq.${encodeURIComponent(filterVal)}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
  })
  if (!r.ok) throw new Error(`Supabase update on ${table} failed: ${r.status} ${await r.text()}`)
  return r.json()
}

export async function sbDeleteIn(table, filterCol, values) {
  if (!values.length) return
  const r = await fetch(`${base(table)}?${filterCol}=in.(${values.map(encodeURIComponent).join(',')})`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!r.ok) throw new Error(`Supabase bulk delete on ${table} failed: ${r.status} ${await r.text()}`)
}

// Call a Postgres function via PostgREST. Returns { missing: true } if the
// function doesn't exist (yet), so callers can fall back.
export async function sbRpc(fn, args) {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(args),
  })
  if (r.status === 404) {
    const body = await r.text()
    if (body.includes('PGRST202')) return { missing: true }
    throw new Error(`Supabase rpc ${fn} failed: 404 ${body}`)
  }
  if (!r.ok) throw new Error(`Supabase rpc ${fn} failed: ${r.status} ${await r.text()}`)
  return { data: await r.json() }
}
