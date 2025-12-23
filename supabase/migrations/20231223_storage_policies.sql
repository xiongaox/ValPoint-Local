-- 为 submissions bucket 配置 Storage RLS 策略
-- 注意：这些策略需要在 Supabase 后台 Storage -> Policies 中执行

-- 1. 允许已认证用户上传到自己的目录
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 允许已认证用户查看自己的文件
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 允许所有人查看 submissions bucket（公开访问）
CREATE POLICY "Public can view submissions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submissions');

-- 4. 允许已认证用户更新自己的文件
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. 允许已认证用户删除自己的文件
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'submissions' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
