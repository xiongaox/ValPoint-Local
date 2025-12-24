-- 创建管理员用户表
-- 用于存储有权限访问管理后台的用户

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    nickname TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    UNIQUE(user_id),
    UNIQUE(email)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- RLS 策略
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 允许管理员读取管理员列表
CREATE POLICY "admins_can_read" ON admin_users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid()
        )
    );

-- 仅超级管理员可以添加管理员
CREATE POLICY "super_admin_can_insert" ON admin_users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
    );

-- 仅超级管理员可以删除管理员（但不能删除自己）
CREATE POLICY "super_admin_can_delete" ON admin_users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au 
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin'
        )
        AND role != 'super_admin' -- 超级管理员不能被删除
    );

-- 注意：需要手动插入第一个超级管理员
-- INSERT INTO admin_users (user_id, email, role, nickname) 
-- VALUES ('xxxxxxxxx', 'admin@example.com', 'super_admin', 'SuperAdmin');
