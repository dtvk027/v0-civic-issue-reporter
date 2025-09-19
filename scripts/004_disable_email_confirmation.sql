-- Disable email confirmation for development
-- This allows users to sign up without waiting for email verification
-- Note: In production, you should enable email confirmation and configure proper SMTP

-- Update auth settings to disable email confirmation
-- This is done through the Supabase dashboard, but we can create users directly

-- For development, we'll create a function to auto-confirm users
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirm users in development
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users on signup
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();
