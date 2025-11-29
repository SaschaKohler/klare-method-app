-- =====================================================
-- 004 - Life Wheel System
-- AI-Ready Database Reconstruction - Part 4
-- =====================================================

-- =======================================
-- LIFE WHEEL TRACKING SYSTEM
-- =======================================

-- Individual life wheel areas with enhanced tracking
CREATE TABLE IF NOT EXISTS life_wheel_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'health', 'career', 'relationships', etc.
  current_value INTEGER NOT NULL CHECK (current_value >= 0 AND current_value <= 10),
  target_value INTEGER NOT NULL CHECK (target_value >= 0 AND target_value <= 10),
  notes TEXT,
  improvement_actions JSONB DEFAULT '[]', -- Action items for improvement
  barriers JSONB DEFAULT '[]', -- Identified obstacles
  strengths JSONB DEFAULT '[]', -- What's working well
  translations JSONB DEFAULT '{}', -- Multi-language support
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);
-- Life wheel snapshots for progression tracking
CREATE TABLE IF NOT EXISTS life_wheel_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL, -- Complete wheel state at this moment
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  trigger_event TEXT, -- What caused this snapshot ('manual', 'milestone', 'ai_suggested')
  ai_analysis JSONB DEFAULT '{}', -- AI insights about changes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =======================================
-- VISION BOARD SYSTEM (Part of Life Wheel)
-- =======================================

-- Vision board items for visualization exercises
CREATE TABLE IF NOT EXISTS vision_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT, -- 'personal', 'professional', 'relationships', etc.
  life_wheel_area TEXT, -- Connection to life wheel areas
  target_date DATE,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused', 'archived')),
  progress_notes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =======================================
-- INDEXES FOR LIFE WHEEL SYSTEM
-- =======================================

CREATE INDEX IF NOT EXISTS idx_life_wheel_areas_user_id ON life_wheel_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_life_wheel_areas_updated ON life_wheel_areas(updated_at);
CREATE INDEX IF NOT EXISTS idx_life_wheel_snapshots_user_date ON life_wheel_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_life_wheel_snapshots_trigger ON life_wheel_snapshots(trigger_event);
CREATE INDEX IF NOT EXISTS idx_vision_board_user_category ON vision_board_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_vision_board_status ON vision_board_items(status);
CREATE INDEX IF NOT EXISTS idx_vision_board_target_date ON vision_board_items(target_date) WHERE target_date IS NOT NULL;
-- =======================================
-- TRIGGERS
-- =======================================

DROP TRIGGER IF EXISTS update_life_wheel_areas_updated_at ON life_wheel_areas;
CREATE TRIGGER update_life_wheel_areas_updated_at 
  BEFORE UPDATE ON life_wheel_areas 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_vision_board_items_updated_at ON vision_board_items;
CREATE TRIGGER update_vision_board_items_updated_at 
  BEFORE UPDATE ON vision_board_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- =======================================
-- LIFE WHEEL HELPER FUNCTIONS
-- =======================================

-- Function to create automatic snapshots on significant changes
CREATE OR REPLACE FUNCTION create_life_wheel_snapshot_if_significant()
RETURNS TRIGGER AS $$
DECLARE
  change_magnitude INTEGER;
  last_snapshot_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate change magnitude
  change_magnitude := ABS(NEW.current_value - OLD.current_value);
  
  -- Check when the last snapshot was taken
  SELECT MAX(snapshot_date) INTO last_snapshot_date
  FROM life_wheel_snapshots
  WHERE user_id = NEW.user_id;
  
  -- Create snapshot if significant change (>=2 points) or no snapshot in 30 days
  IF change_magnitude >= 2 OR 
     last_snapshot_date IS NULL OR 
     last_snapshot_date < NOW() - INTERVAL '30 days' THEN
    
    INSERT INTO life_wheel_snapshots (
      user_id, 
      snapshot_data, 
      trigger_event,
      notes
    )
    SELECT 
      NEW.user_id,
      jsonb_object_agg(name, 
        jsonb_build_object(
          'current_value', current_value,
          'target_value', target_value
        )
      ),
      CASE 
        WHEN change_magnitude >= 2 THEN 'significant_change'
        ELSE 'periodic_snapshot'
      END,
      'Auto-generated: ' || NEW.name || ' changed from ' || OLD.current_value || ' to ' || NEW.current_value
    FROM life_wheel_areas
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply the snapshot trigger
DROP TRIGGER IF EXISTS life_wheel_auto_snapshot ON life_wheel_areas;
CREATE TRIGGER life_wheel_auto_snapshot
  AFTER UPDATE ON life_wheel_areas
  FOR EACH ROW
  WHEN (OLD.current_value IS DISTINCT FROM NEW.current_value)
  EXECUTE FUNCTION create_life_wheel_snapshot_if_significant();
