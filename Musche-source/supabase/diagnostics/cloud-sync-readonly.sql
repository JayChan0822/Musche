-- Read-only: no changes to data, versions, triggers or configuration.
-- Run in the Supabase SQL Editor for the affected project.
SELECT user_id, version, content->>'schemaVersion' AS schema_version,
       jsonb_array_length(coalesce(content::jsonb->'tasks', '[]'::jsonb)) AS schedule_count,
       jsonb_array_length(coalesce(content::jsonb->'pool', '[]'::jsonb)) AS task_count,
       pg_column_size(content) AS content_bytes
FROM public.user_data
WHERE user_id = '7ea572b4-72cd-4589-9d5e-9532e0a4eaf1';

-- All user-defined triggers, including their function bodies and execution order.
SELECT t.tgname, t.tgenabled, pg_get_triggerdef(t.oid) AS trigger_definition,
       pg_get_functiondef(t.tgfoid) AS function_definition
FROM pg_trigger t
WHERE t.tgrelid = 'public.user_data'::regclass AND NOT t.tgisinternal
ORDER BY t.tgname;

SELECT public.musche_workflow_schema_version() AS supported_schema;
