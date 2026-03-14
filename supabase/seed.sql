CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

TRUNCATE TABLE
  "Message",
  "Conversation",
  "Notification",
  "FertilityData",
  "LabResult",
  "CarePlan",
  "Prescription",
  "CycleTrack",
  "SymptomLog",
  "Appointment",
  "EmployerAdmin",
  "Employer",
  "Referral",
  "InsuranceClaim",
  "Patient",
  "Provider",
  "Account",
  "Session",
  "User"
CASCADE;

CREATE TEMP TABLE seed_users (
  full_name text,
  email text,
  role "Role",
  id text
);

INSERT INTO seed_users (full_name, email, role, id) VALUES
  ('Dr. Sarah Chen', 'sarah.chen@virtualclinic.com', 'PROVIDER'::"Role", uuid_generate_v4()::text),
  ('Dr. Maya Patel', 'maya.patel@virtualclinic.com', 'PROVIDER'::"Role", uuid_generate_v4()::text),
  ('Dr. Lisa Torres', 'lisa.torres@virtualclinic.com', 'PROVIDER'::"Role", uuid_generate_v4()::text),
  ('Emma Johnson', 'emma.johnson@gmail.com', 'PATIENT'::"Role", uuid_generate_v4()::text),
  ('Sophia Williams', 'sophia.w@gmail.com', 'PATIENT'::"Role", uuid_generate_v4()::text),
  ('Olivia Martinez', 'olivia.m@gmail.com', 'PATIENT'::"Role", uuid_generate_v4()::text),
  ('Ava Thompson', 'ava.t@gmail.com', 'PATIENT'::"Role", uuid_generate_v4()::text),
  ('Rachel Kim', 'rachel.kim@acmecorp.com', 'EMPLOYER_ADMIN'::"Role", uuid_generate_v4()::text);

INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt")
SELECT id, email, '$2a$12$QfwQotpYxaWQzMnIh4kVY.d1j9JQk7vB2wNfV3M3v8n8kL1V4s8le', role, NOW() - INTERVAL '90 days', NOW()
FROM seed_users;

CREATE TEMP TABLE seed_provider_ids AS
SELECT
  su.full_name,
  su.email,
  su.id AS user_id,
  uuid_generate_v4()::text AS provider_id
FROM seed_users su
WHERE su.role = 'PROVIDER'::"Role";

INSERT INTO "Provider" (
  id, "userId", specialty, "licenseNumber", "licenseState", "npiNumber", languages, bio, availability,
  rating, "totalReviews", "acceptingPatients", "createdAt", "updatedAt"
)
SELECT
  spi.provider_id,
  spi.user_id,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN 'OB/GYN'
    WHEN 'maya.patel@virtualclinic.com' THEN 'Endocrinologist'
    ELSE 'Mental Health'
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN 'CA-OB-908122'
    WHEN 'maya.patel@virtualclinic.com' THEN 'NY-EN-554201'
    ELSE 'TX-MH-332991'
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN 'CA'
    WHEN 'maya.patel@virtualclinic.com' THEN 'NY'
    ELSE 'TX'
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN '1407012120'
    WHEN 'maya.patel@virtualclinic.com' THEN '1861772314'
    ELSE '1154891021'
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN ARRAY['English','Mandarin']::text[]
    WHEN 'maya.patel@virtualclinic.com' THEN ARRAY['English','Hindi']::text[]
    ELSE ARRAY['English','Spanish']::text[]
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN 'Comprehensive women''s health, cycle care, and fertility planning.'
    WHEN 'maya.patel@virtualclinic.com' THEN 'Endocrine and metabolic specialist focused on PCOS and hormone optimization.'
    ELSE 'Evidence-based therapy and integrated mental wellness support.'
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN '{"monday":[{"start":"09:00","end":"17:00","slotDuration":30}],"tuesday":[{"start":"09:00","end":"17:00","slotDuration":30}],"wednesday":[{"start":"10:00","end":"18:00","slotDuration":30}],"thursday":[{"start":"09:00","end":"17:00","slotDuration":30}],"friday":[{"start":"09:00","end":"14:00","slotDuration":30}]}'::jsonb
    WHEN 'maya.patel@virtualclinic.com' THEN '{"monday":[{"start":"08:30","end":"16:30","slotDuration":30}],"wednesday":[{"start":"09:00","end":"17:00","slotDuration":30}],"thursday":[{"start":"08:30","end":"16:30","slotDuration":30}],"friday":[{"start":"09:00","end":"15:00","slotDuration":30}]}'::jsonb
    ELSE '{"tuesday":[{"start":"10:00","end":"18:00","slotDuration":30}],"wednesday":[{"start":"10:00","end":"18:00","slotDuration":30}],"thursday":[{"start":"10:00","end":"18:00","slotDuration":30}],"saturday":[{"start":"09:00","end":"13:00","slotDuration":30}]}'::jsonb
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN 4.9
    WHEN 'maya.patel@virtualclinic.com' THEN 4.8
    ELSE 4.95
  END,
  CASE spi.email
    WHEN 'sarah.chen@virtualclinic.com' THEN 241
    WHEN 'maya.patel@virtualclinic.com' THEN 198
    ELSE 267
  END,
  TRUE,
  NOW() - INTERVAL '120 days',
  NOW()
FROM seed_provider_ids spi;

CREATE TEMP TABLE seed_patient_ids AS
SELECT
  su.full_name,
  su.email,
  su.id AS user_id,
  uuid_generate_v4()::text AS patient_id
FROM seed_users su
WHERE su.role = 'PATIENT'::"Role";

INSERT INTO "Patient" (
  id, "userId", "dateOfBirth", "phoneNumber", address, "emergencyContact", "insuranceId", "insuranceProvider",
  "medicalHistory", allergies, medications, "createdAt", "updatedAt"
)
SELECT
  spi.patient_id,
  spi.user_id,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN DATE '1993-06-12'
    WHEN 'sophia.w@gmail.com' THEN DATE '1997-02-21'
    WHEN 'olivia.m@gmail.com' THEN DATE '1990-09-04'
    ELSE DATE '1996-11-15'
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN '+1-415-555-1101'
    WHEN 'sophia.w@gmail.com' THEN '+1-415-555-1102'
    WHEN 'olivia.m@gmail.com' THEN '+1-415-555-1103'
    ELSE '+1-415-555-1104'
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN '{"line1":"112 Pine St","city":"San Francisco","state":"CA","zip":"94107"}'::jsonb
    WHEN 'sophia.w@gmail.com' THEN '{"line1":"54 Valencia St","city":"San Francisco","state":"CA","zip":"94110"}'::jsonb
    WHEN 'olivia.m@gmail.com' THEN '{"line1":"800 Mission St","city":"San Francisco","state":"CA","zip":"94103"}'::jsonb
    ELSE '{"line1":"39 Howard St","city":"San Francisco","state":"CA","zip":"94105"}'::jsonb
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN '{"name":"Daniel Johnson","phone":"+1-415-555-2101"}'::jsonb
    WHEN 'sophia.w@gmail.com' THEN '{"name":"Chris Williams","phone":"+1-415-555-2102"}'::jsonb
    WHEN 'olivia.m@gmail.com' THEN '{"name":"Maria Martinez","phone":"+1-415-555-2103"}'::jsonb
    ELSE '{"name":"Noah Thompson","phone":"+1-415-555-2104"}'::jsonb
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN 'BC-4455122'
    WHEN 'sophia.w@gmail.com' THEN 'AET-9920181'
    WHEN 'olivia.m@gmail.com' THEN 'UNT-5501839'
    ELSE 'CIG-3109288'
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN 'BlueCross'
    WHEN 'sophia.w@gmail.com' THEN 'Aetna'
    WHEN 'olivia.m@gmail.com' THEN 'United'
    ELSE 'Cigna'
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN '{"primaryCondition":"PCOS"}'::jsonb
    WHEN 'sophia.w@gmail.com' THEN '{"primaryCondition":"Fertility tracking"}'::jsonb
    WHEN 'olivia.m@gmail.com' THEN '{"primaryCondition":"Endometriosis"}'::jsonb
    ELSE '{"primaryCondition":"Anxiety + Hormonal"}'::jsonb
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN ARRAY['Penicillin']::text[]
    WHEN 'sophia.w@gmail.com' THEN ARRAY[]::text[]
    WHEN 'olivia.m@gmail.com' THEN ARRAY['Naproxen']::text[]
    ELSE ARRAY[]::text[]
  END,
  CASE spi.email
    WHEN 'emma.johnson@gmail.com' THEN ARRAY['Metformin']::text[]
    WHEN 'sophia.w@gmail.com' THEN ARRAY[]::text[]
    WHEN 'olivia.m@gmail.com' THEN ARRAY['Norethindrone']::text[]
    ELSE ARRAY['Sertraline']::text[]
  END,
  NOW() - INTERVAL '120 days',
  NOW()
FROM seed_patient_ids spi;

INSERT INTO "Employer" (
  id, name, domain, "contactEmail", plan, "employeeCount", "billingEmail", "stripeCustomerId", "ssoEnabled", "createdAt", "updatedAt"
) VALUES (
  uuid_generate_v4()::text,
  'Acme Corp',
  'acmecorp.com',
  'rachel.kim@acmecorp.com',
  'PROFESSIONAL'::"EmployerPlan",
  150,
  'billing@acmecorp.com',
  'cus_mock_acme123',
  TRUE,
  NOW() - INTERVAL '365 days',
  NOW()
);

INSERT INTO "EmployerAdmin" (id, "userId", "employerId", "createdAt", "updatedAt")
SELECT uuid_generate_v4()::text, u.id, e.id, NOW() - INTERVAL '300 days', NOW()
FROM "User" u
JOIN "Employer" e ON e.domain = 'acmecorp.com'
WHERE u.email = 'rachel.kim@acmecorp.com';

CREATE TEMP TABLE seed_appointments (
  id text,
  patient_email text,
  provider_email text,
  type "AppointmentType",
  status "AppointmentStatus",
  scheduled_at timestamptz,
  duration int,
  chief_complaint text,
  notes text
);

INSERT INTO seed_appointments VALUES
  (uuid_generate_v4()::text, 'emma.johnson@gmail.com', 'maya.patel@virtualclinic.com', 'VIDEO'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '58 days', 30, 'Irregular periods for 3 months', 'Reviewed cycle variance, insulin panel ordered.'),
  (uuid_generate_v4()::text, 'sophia.w@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '54 days', 40, 'Fertility consultation - trying to conceive', 'Started ovulation-timed protocol.'),
  (uuid_generate_v4()::text, 'olivia.m@gmail.com', 'sarah.chen@virtualclinic.com', 'CHAT'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '49 days', 25, 'Pelvic pain management', 'Pain diary and anti-inflammatory plan discussed.'),
  (uuid_generate_v4()::text, 'ava.t@gmail.com', 'lisa.torres@virtualclinic.com', 'VIDEO'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '44 days', 45, 'Anxiety and mood swings', 'Baseline anxiety screening and coping strategies started.'),
  (uuid_generate_v4()::text, 'emma.johnson@gmail.com', 'maya.patel@virtualclinic.com', 'VIDEO'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '38 days', 30, 'Follow-up: hormone panel results', 'Mild androgen elevation, continue metformin.'),
  (uuid_generate_v4()::text, 'olivia.m@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '33 days', 30, 'Endometriosis flare-up', 'Short-term hormonal support initiated.'),
  (uuid_generate_v4()::text, 'sophia.w@gmail.com', 'sarah.chen@virtualclinic.com', 'CHAT'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '27 days', 20, 'Birth control discussion', 'Discussed transition off contraception for conception.'),
  (uuid_generate_v4()::text, 'ava.t@gmail.com', 'lisa.torres@virtualclinic.com', 'VIDEO'::"AppointmentType", 'COMPLETED'::"AppointmentStatus", NOW() - INTERVAL '21 days', 35, 'Postpartum check-in', 'Sleep, support system, and medication tolerance reviewed.'),
  (uuid_generate_v4()::text, 'emma.johnson@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'CONFIRMED'::"AppointmentStatus", NOW() + INTERVAL '1 day' + INTERVAL '14 hour', 30, 'Irregular periods for 3 months', NULL),
  (uuid_generate_v4()::text, 'sophia.w@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'CONFIRMED'::"AppointmentStatus", NOW() + INTERVAL '2 days' + INTERVAL '10 hour', 30, 'Fertility consultation - trying to conceive', NULL),
  (uuid_generate_v4()::text, 'olivia.m@gmail.com', 'maya.patel@virtualclinic.com', 'VIDEO'::"AppointmentType", 'CONFIRMED'::"AppointmentStatus", NOW() + INTERVAL '3 days' + INTERVAL '11 hour', 30, 'Follow-up: hormone panel results', NULL),
  (uuid_generate_v4()::text, 'ava.t@gmail.com', 'lisa.torres@virtualclinic.com', 'CHAT'::"AppointmentType", 'CONFIRMED'::"AppointmentStatus", NOW() + INTERVAL '6 days' + INTERVAL '16 hour', 25, 'Anxiety and mood swings', NULL),
  (uuid_generate_v4()::text, 'emma.johnson@gmail.com', 'maya.patel@virtualclinic.com', 'VIDEO'::"AppointmentType", 'SCHEDULED'::"AppointmentStatus", NOW() + INTERVAL '8 days' + INTERVAL '09 hour', 30, 'Follow-up: hormone panel results', NULL),
  (uuid_generate_v4()::text, 'sophia.w@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'SCHEDULED'::"AppointmentStatus", NOW() + INTERVAL '10 days' + INTERVAL '15 hour', 30, 'Fertility consultation - trying to conceive', NULL),
  (uuid_generate_v4()::text, 'olivia.m@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'SCHEDULED'::"AppointmentStatus", NOW() + INTERVAL '12 days' + INTERVAL '13 hour', 30, 'Pelvic pain management', NULL),
  (uuid_generate_v4()::text, 'ava.t@gmail.com', 'lisa.torres@virtualclinic.com', 'CHAT'::"AppointmentType", 'SCHEDULED'::"AppointmentStatus", NOW() + INTERVAL '14 days' + INTERVAL '17 hour', 25, 'Anxiety and mood swings', NULL),
  (uuid_generate_v4()::text, 'emma.johnson@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'CANCELLED'::"AppointmentStatus", NOW() - INTERVAL '12 days', 30, 'Birth control discussion', 'Cancelled by patient due to travel.'),
  (uuid_generate_v4()::text, 'sophia.w@gmail.com', 'maya.patel@virtualclinic.com', 'CHAT'::"AppointmentType", 'CANCELLED'::"AppointmentStatus", NOW() - INTERVAL '5 days', 20, 'Follow-up: hormone panel results', 'Cancelled by provider schedule conflict.'),
  (uuid_generate_v4()::text, 'olivia.m@gmail.com', 'sarah.chen@virtualclinic.com', 'VIDEO'::"AppointmentType", 'IN_PROGRESS'::"AppointmentStatus", date_trunc('day', NOW()) + INTERVAL '10 hour', 30, 'Endometriosis flare-up', 'Patient joined, reviewing symptom trend.'),
  (uuid_generate_v4()::text, 'ava.t@gmail.com', 'lisa.torres@virtualclinic.com', 'VIDEO'::"AppointmentType", 'IN_PROGRESS'::"AppointmentStatus", date_trunc('day', NOW()) + INTERVAL '15 hour', 40, 'Anxiety and mood swings', 'Session in progress - cognitive reframing exercises.');

INSERT INTO "Appointment" (
  id, "patientId", "providerId", type, status, "scheduledAt", duration, "chiefComplaint", notes, "videoRoomId", "createdAt", "updatedAt"
)
SELECT
  sa.id,
  p.id,
  pr.id,
  sa.type,
  sa.status,
  sa.scheduled_at,
  sa.duration,
  sa.chief_complaint,
  sa.notes,
  'room-' || replace(sa.id, '-', ''),
  sa.scheduled_at - INTERVAL '2 days',
  NOW()
FROM seed_appointments sa
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = sa.patient_email)
JOIN "Provider" pr ON pr."userId" = (SELECT id FROM "User" WHERE email = sa.provider_email);

CREATE TEMP TABLE symptom_seed (
  patient_email text,
  d date,
  symptoms jsonb,
  mood int,
  energy int,
  sleep float,
  pain int,
  notes text
);

INSERT INTO symptom_seed VALUES
  ('emma.johnson@gmail.com', CURRENT_DATE - 29, '["cramps","bloating","fatigue"]'::jsonb, 6, 5, 6.8, 4, 'Mild cramping in evening.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 27, '["headache","mood swings"]'::jsonb, 5, 4, 6.3, 4, 'Mood dip around work stress.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 25, '[]'::jsonb, 7, 6, 7.0, 3, 'Better day overall.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 23, '["cramps","fatigue"]'::jsonb, 6, 5, 6.6, 4, 'Lower abdominal discomfort.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 21, '["bloating"]'::jsonb, 7, 6, 7.1, 3, 'Bloating post-lunch.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 19, '["cramps","mood swings"]'::jsonb, 5, 4, 6.2, 5, 'Pain spike mid-cycle.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 17, '["fatigue"]'::jsonb, 5, 4, 6.0, 4, 'Energy low through afternoon.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 15, '["cramps","bloating","fatigue"]'::jsonb, 5, 4, 6.1, 5, 'Typical PCOS dip window.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 13, '["headache"]'::jsonb, 6, 5, 6.7, 4, 'Hydration helped headache.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 11, '[]'::jsonb, 7, 6, 7.2, 3, 'Stable mood and appetite.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 9, '["breast tenderness","spotting"]'::jsonb, 6, 5, 6.8, 4, 'Light spotting noted.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 7, '["cramps"]'::jsonb, 5, 4, 6.2, 5, 'Cramping increased at night.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 5, '["fatigue"]'::jsonb, 6, 5, 6.9, 4, 'Needed longer rest.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 3, '["bloating"]'::jsonb, 7, 6, 7.3, 3, 'Mild bloating only.'),
  ('emma.johnson@gmail.com', CURRENT_DATE - 1, '[]'::jsonb, 7, 6, 7.4, 3, 'Good energy today.'),

  ('sophia.w@gmail.com', CURRENT_DATE - 28, '[]'::jsonb, 7, 7, 7.4, 2, 'Feeling well.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 26, '["breast tenderness"]'::jsonb, 7, 7, 7.3, 2, 'Mild tenderness only.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 24, '["headache"]'::jsonb, 6, 6, 7.1, 2, 'Brief headache resolved.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 22, '[]'::jsonb, 8, 8, 7.8, 1, 'Great energy and mood.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 20, '["spotting"]'::jsonb, 7, 7, 7.2, 2, 'Light spotting pre-ovulation.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 18, '[]'::jsonb, 8, 8, 7.9, 1, 'No significant symptoms.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 16, '["headache","mood swings"]'::jsonb, 6, 6, 7.0, 3, 'Slightly emotional today.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 14, '[]'::jsonb, 7, 7, 7.5, 2, 'Back to baseline.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 12, '["breast tenderness","spotting"]'::jsonb, 7, 7, 7.4, 2, 'Cycle-related changes.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 10, '[]'::jsonb, 8, 8, 7.9, 1, 'Strong ovulation window.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 8, '[]'::jsonb, 8, 8, 8.0, 1, 'Excellent day.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 6, '["headache"]'::jsonb, 7, 7, 7.2, 2, 'Mild tension headache.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 4, '[]'::jsonb, 8, 8, 7.8, 1, 'Very good mood.'),
  ('sophia.w@gmail.com', CURRENT_DATE - 2, '["breast tenderness"]'::jsonb, 7, 7, 7.3, 2, 'Expected luteal symptom.'),
  ('sophia.w@gmail.com', CURRENT_DATE, '[]'::jsonb, 8, 8, 7.9, 1, 'Stable and optimistic.');

INSERT INTO "SymptomLog" (id, "patientId", date, symptoms, mood, energy, sleep, pain, notes, "createdAt")
SELECT
  uuid_generate_v4()::text,
  p.id,
  ss.d::timestamptz,
  ss.symptoms,
  ss.mood,
  ss.energy,
  ss.sleep,
  ss.pain,
  ss.notes,
  ss.d::timestamptz
FROM symptom_seed ss
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = ss.patient_email);

INSERT INTO "CycleTrack" (
  id, "patientId", "periodStart", "periodEnd", "cycleLength", "ovulationDate", symptoms, flow, notes, "createdAt"
)
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '243 days', CURRENT_DATE - INTERVAL '237 days', 34, CURRENT_DATE - INTERVAL '227 days', ARRAY['cramps','fatigue']::text[], 'HEAVY'::"CycleFlow", 'Irregular longer cycle.', CURRENT_DATE - INTERVAL '243 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'emma.johnson@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '209 days', CURRENT_DATE - INTERVAL '204 days', 32, CURRENT_DATE - INTERVAL '194 days', ARRAY['bloating']::text[], 'MEDIUM'::"CycleFlow", NULL, CURRENT_DATE - INTERVAL '209 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'emma.johnson@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '177 days', CURRENT_DATE - INTERVAL '171 days', 35, CURRENT_DATE - INTERVAL '162 days', ARRAY['cramps','headache']::text[], 'HEAVY'::"CycleFlow", 'Mid-cycle pain spike.', CURRENT_DATE - INTERVAL '177 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'emma.johnson@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '142 days', CURRENT_DATE - INTERVAL '136 days', 33, CURRENT_DATE - INTERVAL '126 days', ARRAY['fatigue']::text[], 'MEDIUM'::"CycleFlow", 'Current stabilization trend.', CURRENT_DATE - INTERVAL '142 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'emma.johnson@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '238 days', CURRENT_DATE - INTERVAL '233 days', 29, CURRENT_DATE - INTERVAL '224 days', ARRAY['spotting']::text[], 'LIGHT'::"CycleFlow", NULL, CURRENT_DATE - INTERVAL '238 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'sophia.w@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '209 days', CURRENT_DATE - INTERVAL '203 days', 28, CURRENT_DATE - INTERVAL '195 days', ARRAY[]::text[], 'LIGHT'::"CycleFlow", NULL, CURRENT_DATE - INTERVAL '209 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'sophia.w@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '181 days', CURRENT_DATE - INTERVAL '175 days', 30, CURRENT_DATE - INTERVAL '166 days', ARRAY['breast tenderness']::text[], 'MEDIUM'::"CycleFlow", NULL, CURRENT_DATE - INTERVAL '181 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'sophia.w@gmail.com')
UNION ALL
SELECT uuid_generate_v4()::text, p.id, CURRENT_DATE - INTERVAL '151 days', CURRENT_DATE - INTERVAL '145 days', 29, CURRENT_DATE - INTERVAL '137 days', ARRAY[]::text[], 'LIGHT'::"CycleFlow", 'Consistent cycle pattern.', CURRENT_DATE - INTERVAL '151 days'
FROM "Patient" p WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'sophia.w@gmail.com');

INSERT INTO "Prescription" (
  id, "patientId", "providerId", "appointmentId", medication, dosage, frequency, refills, "refillsRemaining", "pharmacyName", status, "startDate", "endDate", instructions, "createdAt", "updatedAt"
)
SELECT
  uuid_generate_v4()::text,
  p.id,
  pr.id,
  (SELECT a.id FROM "Appointment" a WHERE a."patientId" = p.id AND a."providerId" = pr.id ORDER BY a."scheduledAt" DESC LIMIT 1),
  x.medication,
  x.dosage,
  x.frequency,
  x.refills,
  x.refills_remaining,
  'CityCare Pharmacy',
  x.status,
  CURRENT_DATE - INTERVAL '35 days',
  CURRENT_DATE + INTERVAL '120 days',
  x.instructions,
  NOW() - INTERVAL '35 days',
  NOW()
FROM (
  VALUES
    ('emma.johnson@gmail.com','maya.patel@virtualclinic.com','Metformin 500mg','500mg','Twice daily',5,3,'ACTIVE'::"PrescriptionStatus",'Take with meals'),
    ('emma.johnson@gmail.com','sarah.chen@virtualclinic.com','Spironolactone 100mg','100mg','Once daily',4,2,'ACTIVE'::"PrescriptionStatus",'For PCOS management'),
    ('sophia.w@gmail.com','sarah.chen@virtualclinic.com','Letrozole 2.5mg','2.5mg','Once daily',2,1,'ACTIVE'::"PrescriptionStatus",'Cycle days 3-7'),
    ('ava.t@gmail.com','lisa.torres@virtualclinic.com','Sertraline 50mg','50mg','Once daily',5,5,'ACTIVE'::"PrescriptionStatus",'Take daily in morning'),
    ('olivia.m@gmail.com','sarah.chen@virtualclinic.com','Norethindrone 5mg','5mg','Once daily',0,0,'COMPLETED'::"PrescriptionStatus",'Pain management'),
    ('sophia.w@gmail.com','sarah.chen@virtualclinic.com','Progesterone 200mg','200mg','Nightly',3,2,'ACTIVE'::"PrescriptionStatus",'Luteal phase support')
) AS x(patient_email, provider_email, medication, dosage, frequency, refills, refills_remaining, status, instructions)
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = x.patient_email)
JOIN "Provider" pr ON pr."userId" = (SELECT id FROM "User" WHERE email = x.provider_email);

INSERT INTO "CarePlan" (
  id, "patientId", "providerId", title, condition, goals, milestones, status, "startDate", "endDate", "createdAt", "updatedAt"
)
SELECT
  uuid_generate_v4()::text,
  p.id,
  pr.id,
  x.title,
  x.condition,
  x.goals,
  x.milestones,
  'ACTIVE'::"CarePlanStatus",
  CURRENT_DATE - INTERVAL '45 days',
  NULL,
  NOW() - INTERVAL '45 days',
  NOW()
FROM (
  VALUES
    (
      'emma.johnson@gmail.com',
      'maya.patel@virtualclinic.com',
      'PCOS Management Plan',
      'PCOS',
      '["Regulate menstrual cycle","Reduce androgen levels","Improve insulin sensitivity"]'::jsonb,
      '[{"title":"Start Metformin - Week 1","status":"COMPLETED"},{"title":"Blood work panel - Week 4","status":"COMPLETED"},{"title":"Follow-up ultrasound - Week 8","status":"IN_PROGRESS"},{"title":"Cycle regulation check - Week 12","status":"PENDING"}]'::jsonb
    ),
    (
      'sophia.w@gmail.com',
      'sarah.chen@virtualclinic.com',
      'Fertility Optimization',
      'Fertility tracking',
      '["Track ovulation accurately","Optimize conception window","Monitor hormone levels"]'::jsonb,
      '[{"title":"Baseline hormone panel","status":"COMPLETED"},{"title":"Start cycle tracking","status":"COMPLETED"},{"title":"First Letrozole cycle","status":"IN_PROGRESS"},{"title":"Follow-up with Dr. Chen","status":"PENDING"}]'::jsonb
    ),
    (
      'ava.t@gmail.com',
      'lisa.torres@virtualclinic.com',
      'Mental Wellness Program',
      'Anxiety + Hormonal',
      '["Manage anxiety symptoms","Improve sleep quality","Balance hormonal mood swings"]'::jsonb,
      '[{"title":"Initial assessment","status":"COMPLETED"},{"title":"Start Sertraline","status":"COMPLETED"},{"title":"2-week check-in","status":"COMPLETED"},{"title":"Monthly therapy session","status":"IN_PROGRESS"}]'::jsonb
    )
) AS x(patient_email, provider_email, title, condition, goals, milestones)
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = x.patient_email)
JOIN "Provider" pr ON pr."userId" = (SELECT id FROM "User" WHERE email = x.provider_email);

INSERT INTO "LabResult" (
  id, "patientId", "appointmentId", "testName", "testCode", status, "orderedAt", "resultedAt", results, "normalRanges", "isAbnormal", "labProvider", "createdAt"
)
SELECT
  uuid_generate_v4()::text,
  p.id,
  (SELECT a.id FROM "Appointment" a WHERE a."patientId" = p.id ORDER BY a."scheduledAt" DESC LIMIT 1),
  x.test_name,
  x.test_code,
  x.status,
  NOW() - INTERVAL '20 days',
  CASE WHEN x.status = 'ORDERED'::"LabStatus" OR x.status = 'PROCESSING'::"LabStatus" THEN NULL ELSE NOW() - INTERVAL '18 days' END,
  x.results,
  x.normal_range,
  x.is_abnormal,
  'LABCORP'::"LabProvider",
  NOW() - INTERVAL '20 days'
FROM (
  VALUES
    ('emma.johnson@gmail.com','AMH (Anti-Mullerian Hormone)','AMH','RESULTED'::"LabStatus",'{"value":"0.8 ng/mL"}'::jsonb,'{"normal":"1.0-3.5 ng/mL"}'::jsonb,TRUE),
    ('emma.johnson@gmail.com','Testosterone Total','TESTO','RESULTED'::"LabStatus",'{"value":"68 ng/dL"}'::jsonb,'{"normal":"15-70 ng/dL"}'::jsonb,FALSE),
    ('emma.johnson@gmail.com','Fasting Insulin','INS','RESULTED'::"LabStatus",'{"value":"18 uIU/mL"}'::jsonb,'{"normal":"2-25 uIU/mL"}'::jsonb,FALSE),
    ('emma.johnson@gmail.com','HbA1c','A1C','PROCESSING'::"LabStatus",NULL,'{"normal":"4.8-5.6%"}'::jsonb,FALSE),
    ('sophia.w@gmail.com','FSH Day 3','FSH3','RESULTED'::"LabStatus",'{"value":"7.2 mIU/mL"}'::jsonb,'{"normal":"3-10 mIU/mL"}'::jsonb,FALSE),
    ('sophia.w@gmail.com','LH Day 3','LH3','RESULTED'::"LabStatus",'{"value":"5.8 mIU/mL"}'::jsonb,'{"normal":"2-15 mIU/mL"}'::jsonb,FALSE),
    ('sophia.w@gmail.com','Estradiol','E2','RESULTED'::"LabStatus",'{"value":"45 pg/mL"}'::jsonb,'{"normal":"25-75 pg/mL"}'::jsonb,FALSE),
    ('sophia.w@gmail.com','Progesterone Day 21','P4D21','RESULTED'::"LabStatus",'{"value":"12 ng/mL"}'::jsonb,'{"normal":">10 ng/mL"}'::jsonb,FALSE)
) AS x(patient_email, test_name, test_code, status, results, normal_range, is_abnormal)
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = x.patient_email);

CREATE TEMP TABLE fertility_seed (
  day_offset int,
  bbt float,
  lh_surge bool,
  mucus text
);

INSERT INTO fertility_seed VALUES
  (13, 97.4, FALSE, 'dry'),
  (12, 97.5, FALSE, 'sticky'),
  (11, 97.3, FALSE, 'sticky'),
  (10, 97.6, FALSE, 'creamy'),
  (9, 97.4, FALSE, 'creamy'),
  (8, 97.5, FALSE, 'watery'),
  (7, 97.3, FALSE, 'watery'),
  (6, 97.2, FALSE, 'egg-white'),
  (5, 97.1, FALSE, 'egg-white'),
  (4, 97.0, FALSE, 'egg-white'),
  (3, 97.0, FALSE, 'egg-white'),
  (2, 97.2, TRUE,  'egg-white'),
  (1, 98.1, FALSE, 'creamy'),
  (0, 98.3, FALSE, 'sticky');

INSERT INTO "FertilityData" (
  id, "patientId", date, "basalBodyTemp", "lhSurge", "cervicalMucus", intercourse, medications, notes, "createdAt"
)
SELECT
  uuid_generate_v4()::text,
  p.id,
  (CURRENT_DATE - fs.day_offset)::timestamptz,
  fs.bbt,
  fs.lh_surge,
  fs.mucus,
  CASE WHEN fs.day_offset IN (6,5,2,1) THEN TRUE ELSE FALSE END,
  '{"letrozole":true}'::jsonb,
  CASE WHEN fs.lh_surge THEN 'Positive LH surge detected.' ELSE NULL END,
  (CURRENT_DATE - fs.day_offset)::timestamptz
FROM fertility_seed fs
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = 'sophia.w@gmail.com');

INSERT INTO "Notification" (
  id, "userId", type, title, body, "isRead", metadata, "sentAt", "createdAt"
)
SELECT uuid_generate_v4()::text, u.id, x.type, x.title, x.body, x.is_read, x.meta, NOW() - x.sent_ago, NOW() - x.sent_ago
FROM (
  VALUES
    ('emma.johnson@gmail.com','LAB_RESULT','Lab results ready','Your AMH and hormone results are available to review.',FALSE,'{"category":"labs"}'::jsonb, INTERVAL '10 hours'),
    ('emma.johnson@gmail.com','APPOINTMENT_CONFIRMED','Appointment confirmed with Dr. Chen tomorrow at 2:00 PM','Your consultation is confirmed.',TRUE,'{"category":"appointments"}'::jsonb, INTERVAL '1 day'),
    ('emma.johnson@gmail.com','REFILL_REQUEST','Prescription refill reminder: Metformin','You have 3 refills remaining. Request early to avoid gaps.',FALSE,'{"category":"prescriptions"}'::jsonb, INTERVAL '2 days'),
    ('emma.johnson@gmail.com','MESSAGE_RECEIVED','New message from Dr. Patel','Dr. Patel sent guidance on your updated bloodwork.',TRUE,'{"category":"messages"}'::jsonb, INTERVAL '3 days'),
    ('sophia.w@gmail.com','APPOINTMENT_REMINDER','Appointment reminder: Dr. Chen in 24 hours','Please complete pre-visit check-in.',FALSE,'{"category":"appointments"}'::jsonb, INTERVAL '14 hours'),
    ('sophia.w@gmail.com','CARE_PLAN_UPDATE','Care plan updated: Fertility Optimization','A new milestone has been added to your plan.',TRUE,'{"category":"care_plans"}'::jsonb, INTERVAL '4 days'),
    ('sophia.w@gmail.com','LAB_RESULT','Lab results ready: Progesterone Day 21','Your progesterone result is now posted.',FALSE,'{"category":"labs"}'::jsonb, INTERVAL '1 day'),
    ('olivia.m@gmail.com','APPOINTMENT_REMINDER','Upcoming pelvic pain follow-up','Your visit starts in 48 hours.',FALSE,'{"category":"appointments"}'::jsonb, INTERVAL '6 hours'),
    ('ava.t@gmail.com','MESSAGE_RECEIVED','New message from Dr. Torres','Please review your breathing exercise plan.',TRUE,'{"category":"messages"}'::jsonb, INTERVAL '2 days'),
    ('sarah.chen@virtualclinic.com','MESSAGE_RECEIVED','New patient message','Emma sent a secure message.',FALSE,'{"category":"messages"}'::jsonb, INTERVAL '5 hours'),
    ('maya.patel@virtualclinic.com','LAB_RESULT','Patient result posted','Emma HbA1c moved to processing.',TRUE,'{"category":"labs"}'::jsonb, INTERVAL '7 hours'),
    ('lisa.torres@virtualclinic.com','APPOINTMENT_CONFIRMED','Session confirmed','Ava confirmed her weekly therapy visit.',FALSE,'{"category":"appointments"}'::jsonb, INTERVAL '12 hours')
) AS x(email, type, title, body, is_read, meta, sent_ago)
JOIN "User" u ON u.email = x.email;

CREATE TEMP TABLE seed_conversations (
  id text,
  patient_email text,
  provider_email text,
  subject text,
  last_message_at timestamptz
);

INSERT INTO seed_conversations VALUES
  (uuid_generate_v4()::text, 'emma.johnson@gmail.com', 'sarah.chen@virtualclinic.com', 'Cycle irregularity follow-up', NOW() - INTERVAL '18 hours'),
  (uuid_generate_v4()::text, 'sophia.w@gmail.com', 'sarah.chen@virtualclinic.com', 'Progesterone results and next steps', NOW() - INTERVAL '4 hours');

INSERT INTO "Conversation" (id, "patientId", "providerId", subject, "lastMessageAt", "createdAt")
SELECT
  sc.id,
  p.id,
  pr.id,
  sc.subject,
  sc.last_message_at,
  NOW() - INTERVAL '30 days'
FROM seed_conversations sc
JOIN "Patient" p ON p."userId" = (SELECT id FROM "User" WHERE email = sc.patient_email)
JOIN "Provider" pr ON pr."userId" = (SELECT id FROM "User" WHERE email = sc.provider_email);

INSERT INTO "Message" (id, "conversationId", "senderId", content, "messageType", "isRead", "readAt", "createdAt")
SELECT uuid_generate_v4()::text, sc.id, sender.id, msg.content, 'TEXT'::"MessageType", msg.is_read, CASE WHEN msg.is_read THEN msg.created_at + INTERVAL '30 minutes' ELSE NULL END, msg.created_at
FROM seed_conversations sc
JOIN LATERAL (
  VALUES
    (1, 'emma.johnson@gmail.com', 'Hi Dr. Chen, I''ve been experiencing more irregular periods this month', TRUE, NOW() - INTERVAL '2 days'),
    (2, 'sarah.chen@virtualclinic.com', 'Thanks for letting me know Emma. Can you describe the pattern? How many days between periods?', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'),
    (3, 'emma.johnson@gmail.com', 'It''s been anywhere from 28 to 45 days. Really frustrating', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '20 minutes'),
    (4, 'sarah.chen@virtualclinic.com', 'That''s consistent with your PCOS. Let''s adjust your Metformin dosage. I''m also ordering updated bloodwork', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '33 minutes'),
    (5, 'emma.johnson@gmail.com', 'Thank you! Should I continue the Spironolactone?', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '42 minutes'),
    (6, 'sarah.chen@virtualclinic.com', 'Yes, continue as prescribed. See you at our appointment Thursday', TRUE, NOW() - INTERVAL '2 days' + INTERVAL '55 minutes')
) AS msg(seq, sender_email, content, is_read, created_at)
ON sc.patient_email = 'emma.johnson@gmail.com'
JOIN "User" sender ON sender.email = msg.sender_email;

INSERT INTO "Message" (id, "conversationId", "senderId", content, "messageType", "isRead", "readAt", "createdAt")
SELECT uuid_generate_v4()::text, sc.id, sender.id, msg.content, 'TEXT'::"MessageType", msg.is_read, CASE WHEN msg.is_read THEN msg.created_at + INTERVAL '20 minutes' ELSE NULL END, msg.created_at
FROM seed_conversations sc
JOIN LATERAL (
  VALUES
    (1, 'sophia.w@gmail.com', 'Dr. Chen, I got my Day 21 progesterone results - they look good?', TRUE, NOW() - INTERVAL '1 day' + INTERVAL '1 hour'),
    (2, 'sarah.chen@virtualclinic.com', 'Yes! 12 ng/mL confirms you ovulated this cycle. That''s great news', TRUE, NOW() - INTERVAL '1 day' + INTERVAL '1 hour 12 minutes'),
    (3, 'sophia.w@gmail.com', 'So excited! Does this mean we''re on track?', TRUE, NOW() - INTERVAL '1 day' + INTERVAL '1 hour 25 minutes'),
    (4, 'sarah.chen@virtualclinic.com', 'Absolutely. Your hormone panel looks excellent. Continue tracking BBT and let''s discuss next steps Thursday', TRUE, NOW() - INTERVAL '1 day' + INTERVAL '1 hour 38 minutes'),
    (5, 'sophia.w@gmail.com', 'Perfect. I''ll keep logging daily and bring my chart to the visit.', FALSE, NOW() - INTERVAL '5 hours'),
    (6, 'sarah.chen@virtualclinic.com', 'Great plan. Keep hydration and sleep consistent this week.', FALSE, NOW() - INTERVAL '4 hours 40 minutes')
) AS msg(seq, sender_email, content, is_read, created_at)
ON sc.patient_email = 'sophia.w@gmail.com'
JOIN "User" sender ON sender.email = msg.sender_email;

COMMIT;
