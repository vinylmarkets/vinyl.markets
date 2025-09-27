-- Create user complaints table for compliance monitoring
CREATE TABLE public.user_complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'closed')),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user complaints
ALTER TABLE public.user_complaints ENABLE ROW LEVEL SECURITY;

-- Create policies for user complaints
CREATE POLICY "Users can view their own complaints" 
ON public.user_complaints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own complaints" 
ON public.user_complaints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all complaints" 
ON public.user_complaints 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create system notifications table for tracking system-level events
CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  read_by_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on system notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for system notifications
CREATE POLICY "Admin can manage system notifications" 
ON public.system_notifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_complaints_updated_at
BEFORE UPDATE ON public.user_complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data for testing (without user_id to avoid referential issues)
INSERT INTO public.user_complaints (category, subject, description, priority, status) VALUES
('Content Quality', 'Inaccurate stock information', 'The prediction for AAPL seems to be consistently wrong', 'medium', 'resolved'),
('Technical Issues', 'Login problems', 'Cannot access my account after password reset', 'high', 'resolved'),
('Billing', 'Incorrect charges', 'Was charged twice for my subscription', 'high', 'resolved'),
('Data Privacy', 'Data export request', 'Request to export all my personal data', 'low', 'resolved'),
('User Experience', 'Dashboard loading slow', 'The main dashboard takes too long to load', 'medium', 'investigating'),
('User Experience', 'Mobile app issues', 'Charts not displaying properly on mobile', 'medium', 'pending'),
('Content Quality', 'Missing briefing', 'Did not receive todays market briefing', 'low', 'resolved');

INSERT INTO public.system_notifications (notification_type, title, message, severity) VALUES
('security', 'Failed Login Attempts', 'Multiple failed login attempts detected from IP 192.168.1.1', 'warning'),
('content', 'Content Flag Raised', 'New content flag raised for inappropriate language', 'info'),
('system', 'Database Backup Complete', 'Daily database backup completed successfully', 'info'),
('compliance', 'Compliance Review Required', 'Monthly compliance review is due', 'warning'),
('security', 'API Rate Limit Exceeded', 'API rate limit exceeded for user endpoint', 'error');