-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency')),
  scans_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scans table
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','scanning','completed','failed')),
  provider TEXT DEFAULT 'deepseek',
  language TEXT DEFAULT 'en',
  scores JSONB,
  report TEXT,
  report_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fixes table
CREATE TABLE fixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical','medium','low')),
  description TEXT,
  code TEXT,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature requests table
CREATE TABLE feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_fixes_scan_id ON fixes(scan_id);
CREATE INDEX idx_feature_requests_created_at ON feature_requests(created_at DESC);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read own scans" ON scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON scans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans" ON scans FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can read own fixes" ON fixes FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM scans WHERE scans.id = fixes.scan_id)
);
CREATE POLICY "Users can insert own fixes" ON fixes FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM scans WHERE scans.id = fixes.scan_id)
);
CREATE POLICY "Users can update own fixes" ON fixes FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM scans WHERE scans.id = fixes.scan_id)
);
CREATE POLICY "Users can delete own fixes" ON fixes FOR DELETE USING (
  auth.uid() = (SELECT user_id FROM scans WHERE scans.id = fixes.scan_id)
);

-- Allow any user to insert feature requests (no auth required)
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert feature requests" ON feature_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read feature requests" ON feature_requests FOR SELECT USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
