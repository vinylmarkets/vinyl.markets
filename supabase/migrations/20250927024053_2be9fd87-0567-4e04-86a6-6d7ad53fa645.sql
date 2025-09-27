-- Add missing admin pages to launch checklist
INSERT INTO public.launch_checklist_pages (page_name, page_path, page_section, sort_order)
VALUES 
  ('Image Generator', '/admin/image-generator', 'Admin', 7),
  ('Image Library', '/admin/image-library', 'Admin', 8),
  ('Create Blog Article', '/admin/blog/create', 'Admin', 9);

-- Update the sort order for Launch Checklist to be last
UPDATE public.launch_checklist_pages 
SET sort_order = 10 
WHERE page_name = 'Launch Checklist' AND page_section = 'Admin';