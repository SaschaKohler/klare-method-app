-- Migration to add vision_board_id to vision_board_items
ALTER TABLE vision_board_items 
ADD COLUMN vision_board_id UUID REFERENCES vision_boards(id) ON DELETE CASCADE;

-- Optional: Create an index for faster lookups
CREATE INDEX idx_vision_board_items_board_id ON vision_board_items(vision_board_id);

-- Optional: Add a policy to ensure items can only be linked to the user's own boards
CREATE POLICY "Items can only be linked to user's own boards"
ON vision_board_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vision_boards 
    WHERE vision_boards.id = vision_board_items.vision_board_id 
    AND vision_boards.user_id = auth.uid()
  )
);
