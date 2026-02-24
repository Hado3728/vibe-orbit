-- ENHANCE ROOMS SCHEMA FOR VIBE ROOMS
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description text;

-- CLEAN UP MESSAGES (IF NEEDED)
-- The schema already has public.messages which is linked to rooms.

-- REFINE RLS FOR ROOMS
-- Users should see rooms matching their interests.
DROP POLICY IF EXISTS "Authenticated users can read rooms" ON public.rooms;
CREATE POLICY "Users can see rooms matching their interests"
  ON public.rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND (
        rooms.tags && users.interests -- Overlap in tags and interests
        OR rooms.category = ANY(users.interests)
      )
    )
  );

-- JOIN POLICY
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_members;
CREATE POLICY "Users can join rooms matching their vibes"
  ON public.room_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms
      JOIN public.users ON users.id = auth.uid()
      WHERE rooms.id = room_members.room_id
      AND (
        rooms.tags && users.interests
        OR rooms.category = ANY(users.interests)
      )
    )
  );
