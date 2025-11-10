-- Create message-media storage bucket for chat images and videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-media', 'message-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for message-media bucket
CREATE POLICY "Anyone can view message media"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-media');

CREATE POLICY "Authenticated users can upload message media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-media' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own message media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'message-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own message media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
