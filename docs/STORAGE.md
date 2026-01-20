# ONLYFAME - Media Storage

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `actor-images` | Face profile photos | Actor: own, Caster: applicants |
| `audition-videos` | Audition submissions | Actor: own, Caster: for their calls |
| `voice-notes` | Casting call voice notes | Public read, Caster: write |

---

## Bucket Configuration

### actor-images

```json
{
  "id": "actor-images",
  "public": false,
  "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp"],
  "fileSizeLimit": 5242880
}
```

**File naming:** `{user_id}/{type}.{ext}`
Example: `123e4567-e89b/center.jpg`

---

### audition-videos

```json
{
  "id": "audition-videos",
  "public": false,
  "allowedMimeTypes": ["video/mp4", "video/webm", "video/quicktime"],
  "fileSizeLimit": 104857600
}
```

**File naming:** `{user_id}/{casting_call_id}.{ext}`
Example: `123e4567-e89b/abc123-call.mp4`

---

### voice-notes

```json
{
  "id": "voice-notes",
  "public": true,
  "allowedMimeTypes": ["audio/mpeg", "audio/wav", "audio/webm"],
  "fileSizeLimit": 10485760
}
```

**File naming:** `{caster_id}/{call_id}.{ext}`

---

## Upload Flow

```typescript
// 1. Upload file
const { data, error } = await supabase.storage
  .from('actor-images')
  .upload(`${userId}/center.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  });

// 2. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('actor-images')
  .getPublicUrl(`${userId}/center.jpg`);

// 3. Store URL in database
await supabase
  .from('actor_images')
  .insert({
    actor_id: actorProfileId,
    type: 'center',
    image_url: publicUrl
  });
```

---

## Signed URLs (Private Buckets)

```typescript
// Generate signed URL (valid for 1 hour)
const { data, error } = await supabase.storage
  .from('audition-videos')
  .createSignedUrl(`${userId}/${callId}.mp4`, 3600);

// Use in video player
<video src={data.signedUrl} controls />
```

---

## Video Processing Considerations

For production, consider:

1. **Transcoding**: Use Mux, Cloudinary, or AWS MediaConvert
2. **Thumbnails**: Generate preview frames
3. **Compression**: Client-side before upload
4. **Streaming**: HLS/DASH for long videos

### Recommended Limits

| Type | Max Size | Max Duration |
|------|----------|--------------|
| Audition Video | 100 MB | 3 minutes |
| Voice Note | 10 MB | 2 minutes |
| Profile Image | 5 MB | N/A |
