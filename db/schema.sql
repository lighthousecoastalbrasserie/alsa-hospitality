-- ALSA Hospitality schema v0.1. Execute on a dedicated Neon PostgreSQL database.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE app_role AS ENUM ('admin','employee','customer');
CREATE TYPE event_status AS ENUM ('inquiry','quoted','confirmed','completed','cancelled');
CREATE TABLE app_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text UNIQUE NOT NULL,
 full_name text NOT NULL, role app_role NOT NULL DEFAULT 'customer',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','disabled')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE employee_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL,
 invited_by uuid NOT NULL REFERENCES app_users(id),
 token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL,
 accepted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE REFERENCES app_users(id),
 name text NOT NULL, email text NOT NULL, phone text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_id uuid NOT NULL REFERENCES customers(id),
 title text NOT NULL, venue_address text, event_date date, start_time time,
 guest_count integer CHECK(guest_count > 0), status event_status NOT NULL DEFAULT 'inquiry',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE quotes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id uuid NOT NULL REFERENCES events(id),
 tier text NOT NULL CHECK(tier IN ('well','standard','premium')),
 guest_count integer NOT NULL CHECK(guest_count >= 20),
 hours integer NOT NULL DEFAULT 4 CHECK(hours >= 4),
 unit_price_cents integer NOT NULL CHECK(unit_price_cents >= 0),
 extras_cents integer NOT NULL DEFAULT 0 CHECK(extras_cents >= 0),
 subtotal_cents integer NOT NULL CHECK(subtotal_cents >= 0),
 selections jsonb NOT NULL DEFAULT '{}'::jsonb,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','sent','accepted','declined')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE event_assignments (
 event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
 employee_id uuid NOT NULL REFERENCES app_users(id),
 assignment_role text NOT NULL DEFAULT 'bartender',
 shift_start timestamptz, shift_end timestamptz,
 confirmation text NOT NULL DEFAULT 'pending' CHECK(confirmation IN ('pending','accepted','declined')),
 PRIMARY KEY(event_id,employee_id)
);
CREATE TABLE checklist_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
 description text NOT NULL, completed_by uuid REFERENCES app_users(id), completed_at timestamptz
);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_assignments_employee ON event_assignments(employee_id);
