INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');

CREATE POLICY "Service role upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'screenshots');
