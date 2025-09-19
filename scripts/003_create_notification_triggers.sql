-- Create triggers for automatic notifications

-- Function to create notification when issue status changes
CREATE OR REPLACE FUNCTION public.notify_issue_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify reporter when status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, issue_id, title, message)
    VALUES (
      NEW.reporter_id,
      NEW.id,
      'Issue Status Updated',
      'Your issue "' || NEW.title || '" status changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  
  -- Notify assigned staff when issue is assigned
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, issue_id, title, message)
    VALUES (
      NEW.assigned_to,
      NEW.id,
      'New Issue Assigned',
      'You have been assigned to issue: "' || NEW.title || '"'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for issue status changes
DROP TRIGGER IF EXISTS on_issue_status_change ON public.issues;
CREATE TRIGGER on_issue_status_change
  AFTER UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_issue_status_change();

-- Function to create notification when new update is added
CREATE OR REPLACE FUNCTION public.notify_issue_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  issue_title TEXT;
  reporter_id UUID;
BEGIN
  -- Get issue details
  SELECT title, reporter_id INTO issue_title, reporter_id
  FROM public.issues WHERE id = NEW.issue_id;
  
  -- Notify reporter if update is not from them
  IF NEW.user_id != reporter_id THEN
    INSERT INTO public.notifications (user_id, issue_id, title, message)
    VALUES (
      reporter_id,
      NEW.issue_id,
      'Issue Update',
      'New update on your issue "' || issue_title || '": ' || NEW.message
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for issue updates
DROP TRIGGER IF EXISTS on_issue_update_created ON public.issue_updates;
CREATE TRIGGER on_issue_update_created
  AFTER INSERT ON public.issue_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_issue_update();
