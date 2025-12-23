-- 添加投稿开关字段
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS submission_enabled BOOLEAN DEFAULT false;
