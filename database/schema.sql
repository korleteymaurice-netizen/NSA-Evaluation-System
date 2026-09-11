DO $$ BEGIN CREATE TYPE role AS ENUM ('STUDENT', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE evaluation_status AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE appointment_status AS ENUM ('BOOKED', 'CHECKED_IN', 'COMPLETED', 'MISSED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role role NOT NULL DEFAULT 'STUDENT', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS students (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, student_id TEXT UNIQUE NOT NULL, phone TEXT, programme TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS evaluations (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, date TIMESTAMPTZ NOT NULL, location TEXT NOT NULL, status evaluation_status NOT NULL DEFAULT 'DRAFT', created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS time_slots (id SERIAL PRIMARY KEY, evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE, start_time TIMESTAMPTZ NOT NULL, end_time TIMESTAMPTZ NOT NULL, capacity INTEGER NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, appointment_reference TEXT UNIQUE NOT NULL, student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE RESTRICT, evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE RESTRICT, time_slot_id INTEGER NOT NULL REFERENCES time_slots(id) ON DELETE RESTRICT, status appointment_status NOT NULL DEFAULT 'BOOKED', booked_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(student_id, evaluation_id));
CREATE TABLE IF NOT EXISTS session (sid VARCHAR NOT NULL PRIMARY KEY, sess JSON NOT NULL, expire TIMESTAMP(6) NOT NULL);
CREATE INDEX IF NOT EXISTS session_expire_idx ON session(expire);
CREATE INDEX IF NOT EXISTS students_student_id_idx ON students(student_id);
CREATE INDEX IF NOT EXISTS evaluations_date_status_idx ON evaluations(date, status);
CREATE INDEX IF NOT EXISTS time_slots_evaluation_start_idx ON time_slots(evaluation_id, start_time);
CREATE INDEX IF NOT EXISTS appointments_evaluation_status_idx ON appointments(evaluation_id, status);
CREATE INDEX IF NOT EXISTS appointments_slot_status_idx ON appointments(time_slot_id, status);
CREATE INDEX IF NOT EXISTS appointments_student_status_idx ON appointments(student_id);
CREATE INDEX IF NOT EXISTS appointments_booked_at_idx ON appointments(booked_at);