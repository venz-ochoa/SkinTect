-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.
--
-- This file is committed on purpose. Your schema is a fact about your
-- application, not a runtime concern: it should be readable by opening a file
-- rather than by connecting to a server. It is also what lets you move to a
-- hosted database in one command.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  id                     SERIAL PRIMARY KEY,
  photo                  BYTEA       NOT NULL,
  heatmap                TEXT        NOT NULL,
  prediction             TEXT        NOT NULL,
  malignant_probability  REAL        NOT NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);