-- ==========================================
-- 注册/提权超级管理员
-- ==========================================
-- 步骤说明:
-- 1. 流程：
--    a. 在前端页面 (Admin 后台或个人库) 正常注册一个普通账号。
--    b. 使用本脚本将该账号提权为 super_admin。
-- ==========================================

-- 请将下方 'your_email@example.com' 替换为你刚刚注册的邮箱
UPDATE public.user_profiles 
SET role = 'super_admin' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'your_email@example.com'
);

-- 验证提权结果 (可选)
-- SELECT auth.users.email, user_profiles.role FROM user_profiles JOIN auth.users ON user_profiles.id = auth.users.id WHERE auth.users.email = 'your_email@example.com';
