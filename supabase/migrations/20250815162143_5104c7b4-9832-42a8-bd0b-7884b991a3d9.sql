-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.request_dice_roll(p_mood TEXT, p_action TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_today_rolls INTEGER;
  v_last_roll_time TIMESTAMP WITH TIME ZONE;
  v_cooldown_expires TIMESTAMP WITH TIME ZONE;
  v_dice_roll_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check today's roll count (max 3 per day)
  SELECT COUNT(*) INTO v_today_rolls
  FROM public.dice_roll_usage
  WHERE user_id = v_user_id 
    AND created_at::date = CURRENT_DATE;

  IF v_today_rolls >= 3 THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Daily limit reached', 
      'remaining_rolls', 0,
      'resets_at', (CURRENT_DATE + INTERVAL '1 day')::TEXT
    );
  END IF;

  -- Check cooldown (15 minutes between rolls)
  SELECT created_at, cooldown_expires_at INTO v_last_roll_time, v_cooldown_expires
  FROM public.dice_roll_usage
  WHERE user_id = v_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_cooldown_expires IS NOT NULL AND now() < v_cooldown_expires THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cooldown active',
      'cooldown_expires_at', v_cooldown_expires::TEXT,
      'remaining_rolls', 3 - v_today_rolls
    );
  END IF;

  -- Create new dice roll record
  INSERT INTO public.dice_roll_usage (user_id, mood, action_suggested)
  VALUES (v_user_id, p_mood, p_action)
  RETURNING id INTO v_dice_roll_id;

  -- Return success with remaining rolls
  RETURN json_build_object(
    'success', true,
    'dice_roll_id', v_dice_roll_id,
    'remaining_rolls', 2 - v_today_rolls, -- subtract 1 for current roll
    'next_reset', (CURRENT_DATE + INTERVAL '1 day')::TEXT
  );
END;
$$;

-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.complete_action(
  p_dice_roll_id UUID,
  p_planned_duration INTEGER,
  p_actual_duration INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_completion_type TEXT;
  v_current_streak INTEGER;
  v_best_streak INTEGER;
  v_is_new_best BOOLEAN := false;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Determine completion type based on duration
  IF p_planned_duration <= 300 THEN -- 5 minutes or less
    v_completion_type := 'small';
  ELSIF p_planned_duration <= 1200 THEN -- 20 minutes or less
    v_completion_type := 'medium';
  ELSE
    v_completion_type := 'big';
  END IF;

  -- Insert completion record
  INSERT INTO public.action_completions (user_id, dice_roll_id, planned_duration, actual_duration, completion_type)
  VALUES (v_user_id, p_dice_roll_id, p_planned_duration, p_actual_duration, v_completion_type);

  -- Update or create streak record
  INSERT INTO public.action_streaks (user_id, current_streak, best_streak, last_completion_date, total_completions)
  VALUES (v_user_id, 1, 1, CURRENT_DATE, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE 
      WHEN action_streaks.last_completion_date = CURRENT_DATE THEN action_streaks.current_streak
      WHEN action_streaks.last_completion_date = CURRENT_DATE - INTERVAL '1 day' THEN action_streaks.current_streak + 1
      ELSE 1
    END,
    best_streak = GREATEST(
      action_streaks.best_streak,
      CASE 
        WHEN action_streaks.last_completion_date = CURRENT_DATE THEN action_streaks.current_streak
        WHEN action_streaks.last_completion_date = CURRENT_DATE - INTERVAL '1 day' THEN action_streaks.current_streak + 1
        ELSE 1
      END
    ),
    last_completion_date = CURRENT_DATE,
    total_completions = action_streaks.total_completions + 1,
    updated_at = now()
  RETURNING current_streak, best_streak INTO v_current_streak, v_best_streak;

  -- Check if this is a new best streak
  IF v_current_streak = v_best_streak AND v_current_streak > 1 THEN
    v_is_new_best := true;
  END IF;

  RETURN json_build_object(
    'success', true,
    'completion_type', v_completion_type,
    'current_streak', v_current_streak,
    'best_streak', v_best_streak,
    'is_new_best', v_is_new_best
  );
END;
$$;