-- Read-only snapshots. No data modifications or full-table content scans.
-- Active database waits; query text intentionally omitted.
SELECT pid, state, wait_event_type, wait_event,
       clock_timestamp() - query_start AS running_for,
       pg_blocking_pids(pid) AS blocked_by
FROM pg_stat_activity
WHERE datname = current_database() AND pid <> pg_backend_pid()
  AND state <> 'idle'
ORDER BY query_start;

-- Confirm a usable user_id index exists.
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'user_data';

-- One account lookup only. SQL Editor timings exclude browser/network transfer
-- and may differ from authenticated API calls because of RLS.
EXPLAIN (ANALYZE, BUFFERS)
SELECT content, version FROM public.user_data
WHERE user_id = '7ea572b4-72cd-4589-9d5e-9532e0a4eaf1';
