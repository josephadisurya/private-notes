// Neon Postgres over HTTP (@neondatabase/serverless), DATABASE_URL. One
// driver for everything: middleware.js runs on the Edge runtime, which has
// no TCP sockets, and the API routes use the same client.
// Server-only: never import from client components.
import { neon } from "@neondatabase/serverless";

let client;
export const sql = (...args) => (client ||= neon(process.env.DATABASE_URL))(...args);
const db = () => (client ||= neon(process.env.DATABASE_URL));

// Tables are created on first use, so setup needs no SQL step. Same columns
// as the old Supabase tables (supabase/migrations/001_private_notes.sql).
let ready;
export function ensureSchema() {
  ready ||= db()
    .transaction((q) => [
      q`create table if not exists notes_sessions (
          id text primary key,
          ip text,
          device text,
          created_at timestamptz not null default now(),
          last_seen timestamptz not null default now()
        )`,
      q`create table if not exists private_notes (
          id uuid primary key,
          title text not null default '',
          body text not null default '',
          footer text not null default '',
          version integer not null default 1,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )`,
      q`create index if not exists private_notes_updated_at_idx on private_notes (updated_at desc)`,
    ])
    .catch((e) => {
      ready = null; // retry on the next request
      throw e;
    });
  return ready;
}

// Timestamps as ISO strings (the HTTP driver returns Date objects).
export const iso = (v) => (v instanceof Date ? v.toISOString() : v);
