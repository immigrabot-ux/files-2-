-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats_total INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
  invited_by_user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_team_member UNIQUE(team_id, user_id)
);

-- Team video shares
CREATE TABLE IF NOT EXISTS team_video_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES users(id),
  can_edit BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_team_video UNIQUE(team_id, video_id)
);

-- Indexes
CREATE INDEX idx_teams_owner ON teams(owner_user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_video_shares_team ON team_video_shares(team_id);
CREATE INDEX idx_team_video_shares_video ON team_video_shares(video_id);
