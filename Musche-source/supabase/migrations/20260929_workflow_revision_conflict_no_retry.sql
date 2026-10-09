-- Business revision conflicts must not use serialization_failure (40001):
-- PostgREST 14 retries it indefinitely. Keep both existing write protections.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '15s';
CREATE OR REPLACE FUNCTION public.musche_guard_workflow_write()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
DECLARE old_schema integer := 0; new_schema integer := coalesce((NEW.content->>'schemaVersion')::integer, 0);
BEGIN
  IF TG_OP = 'UPDATE' THEN
    old_schema := coalesce((OLD.content->>'schemaVersion')::integer, 0);
    IF old_schema >= 10 AND new_schema < old_schema THEN
      RAISE EXCEPTION 'Musche schema downgrade refused. Update this client before saving.' USING ERRCODE = '23514';
    END IF;
    IF (old_schema >= 10 OR new_schema >= 10) AND NEW.version <> OLD.version + 1 THEN
      RAISE SQLSTATE 'PT409' USING MESSAGE = 'Musche revision conflict. Reload cloud data before saving.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
COMMIT;
