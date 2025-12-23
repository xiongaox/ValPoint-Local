-- 投稿点位表
-- 用于存储用户投稿的点位，待管理员审核

CREATE TABLE lineup_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 投稿者信息
  submitter_id UUID NOT NULL,
  submitter_email TEXT,
  -- 点位基础信息 (与 shared_lineups 结构一致)
  title TEXT NOT NULL,
  map_name TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_icon TEXT,
  skill_icon TEXT,
  side TEXT CHECK (side IN ('attack', 'defense')),
  ability_index INTEGER,
  agent_pos JSONB,
  skill_pos JSONB,
  description TEXT,
  -- 图片链接 (临时存储在 Supabase Storage)
  stand_img TEXT,
  stand_desc TEXT,
  aim_img TEXT,
  aim_desc TEXT,
  aim2_img TEXT,
  aim2_desc TEXT,
  land_img TEXT,
  land_desc TEXT,
  -- 来源信息
  source_link TEXT,
  author_name TEXT,
  author_avatar TEXT,
  author_uid TEXT,
  -- 审核状态
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_submissions_status ON lineup_submissions(status);
CREATE INDEX idx_submissions_submitter ON lineup_submissions(submitter_id);
CREATE INDEX idx_submissions_created ON lineup_submissions(created_at DESC);

-- RLS 策略
ALTER TABLE lineup_submissions ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户插入自己的投稿
CREATE POLICY "Users can insert own submissions" ON lineup_submissions
  FOR INSERT WITH CHECK (auth.uid() = submitter_id);

-- 允许用户查看自己的投稿
CREATE POLICY "Users can view own submissions" ON lineup_submissions
  FOR SELECT USING (auth.uid() = submitter_id);

-- 允许管理员查看所有投稿
CREATE POLICY "Admins can view all submissions" ON lineup_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM system_settings WHERE id = '00000000-0000-0000-0000-000000000001'
    )
  );

-- 允许管理员更新投稿状态
CREATE POLICY "Admins can update submissions" ON lineup_submissions
  FOR UPDATE USING (true);

-- 修改 system_settings 表添加投稿限制和官方 OSS 配置
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS daily_submission_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS official_oss_config JSONB;
