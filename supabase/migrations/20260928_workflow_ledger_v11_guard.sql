-- Run using the database owner before deploying schema v11 clients.
-- Existing columns: public.user_data(user_id, content JSON/JSONB, version integer).
-- No content conversion is performed here. Client migration retains original local backups.
BEGIN;
CREATE OR REPLACE FUNCTION public.musche_guard_workflow_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE old_schema integer := 0; new_schema integer := coalesce((NEW.content->>'schemaVersion')::integer, 0);
BEGIN
  IF TG_OP = 'UPDATE' THEN
    old_schema := coalesce((OLD.content->>'schemaVersion')::integer, 0);
    IF old_schema >= 10 AND new_schema < old_schema THEN
      RAISE EXCEPTION 'Musche schema downgrade refused. Update this client before saving.' USING ERRCODE = '23514';
    END IF;
    -- Concurrent clients that both read revision N cannot overwrite each other at N+1.
    IF (old_schema >= 10 OR new_schema >= 10) AND NEW.version <> OLD.version + 1 THEN
      RAISE EXCEPTION 'Musche revision conflict. Reload cloud data before saving.' USING ERRCODE = '40001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS musche_workflow_write_guard ON public.user_data;
CREATE TRIGGER musche_workflow_write_guard BEFORE INSERT OR UPDATE ON public.user_data
FOR EACH ROW EXECUTE FUNCTION public.musche_guard_workflow_write();

-- Capability is checked on each new-schema write, not cached by the browser.
-- It reports compatibility only while the required trigger is enabled.
CREATE OR REPLACE FUNCTION public.musche_workflow_schema_version()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.user_data'::regclass
      AND tgname = 'musche_workflow_write_guard' AND tgenabled IN ('O', 'A')
      AND tgfoid = 'public.musche_guard_workflow_write()'::regprocedure
  ) THEN 11 ELSE 0 END;
$$;
REVOKE ALL ON FUNCTION public.musche_workflow_schema_version() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.musche_workflow_schema_version() TO authenticated;
COMMIT;
