CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  company_size text,
  role text,
  phone text,
  message text,
  source_page text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_signups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_studies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  company_logo_url text,
  quote text NOT NULL,
  author_name text,
  author_title text,
  category text,
  stat_highlight text,
  published_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text,
  description text,
  image_url text,
  url text,
  published_at timestamptz DEFAULT now()
);

INSERT INTO demo_requests (name, email, company, role, source_page) VALUES
('John Smith', 'john@techcorp.com', 'TechCorp', 'EMPLOYER', '/for-employers'),
('Sarah Lee', 'sarah@healthplan.com', 'HealthFirst', 'HEALTH_PLAN', '/solutions'),
('Mike Johnson', 'mike@consulting.com', 'BCG', 'CONSULTANT', '/for-consultants');

INSERT INTO case_studies (company_name, quote, author_name, author_title, stat_highlight) VALUES
('SoFi', 'Our employees are so very appreciative of this program.', 'Debbie Westover', 'Senior Benefits Manager', '4x ROI'),
('Microsoft', 'We had amazing emotional support and saved £30,000.', 'Han', 'Maven member', '£30,000 saved'),
('Amazon', 'This is by far the easiest access to services and specialists.', 'Sarah', 'Maven member', '24/7 access');

INSERT INTO resources (title, type, description) VALUES
('State of Women Health Benefits 2026', 'GUIDE', 'Comprehensive analysis of women health benefits trends'),
('Fertility Benefits: What Employers Need to Know', 'BLOG', 'Key considerations for implementing fertility benefits'),
('Modern Maternity Benefits Guide', 'GUIDE', 'A comprehensive guide to maternity benefit programs');
