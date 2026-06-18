-- 1. Drop old severity constraint and add new one with 'high'
ALTER TABLE fixes DROP CONSTRAINT IF EXISTS fixes_severity_check;
ALTER TABLE fixes ADD CONSTRAINT fixes_severity_check CHECK (severity IN ('critical','high','medium','low'));

-- 2. Add trigger for scan count increment
CREATE OR REPLACE FUNCTION increment_scan_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET scans_this_month = scans_this_month + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_scan_count ON scans;
CREATE TRIGGER trigger_increment_scan_count
  AFTER INSERT ON scans FOR EACH ROW
  EXECUTE FUNCTION increment_scan_count();
