-- =============================================================
-- Abe Garage – PostgreSQL schema
-- Converted from MySQL; identical table/column names preserved.
-- Run via: npm run db:setup
-- =============================================================

-- Customer tables ------------------------------------------------

CREATE TABLE IF NOT EXISTS customer_identifier (
  customer_id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_email        VARCHAR(255) NOT NULL UNIQUE,
  customer_phone_number VARCHAR(255) NOT NULL UNIQUE,
  customer_added_date   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  customer_hash         VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_info (
  customer_info_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id            INTEGER      NOT NULL REFERENCES customer_identifier(customer_id) ON DELETE CASCADE,
  customer_first_name    VARCHAR(255) NOT NULL,
  customer_last_name     VARCHAR(255) NOT NULL,
  active_customer_status INTEGER      NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_customer_info_customer_id ON customer_info(customer_id);

CREATE TABLE IF NOT EXISTS customer_vehicle_info (
  vehicle_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id     INTEGER      NOT NULL REFERENCES customer_identifier(customer_id) ON DELETE CASCADE,
  vehicle_year    INTEGER      NOT NULL,
  vehicle_make    VARCHAR(255) NOT NULL,
  vehicle_model   VARCHAR(255) NOT NULL,
  vehicle_type    VARCHAR(255) NOT NULL,
  vehicle_mileage INTEGER      NOT NULL,
  vehicle_tag     VARCHAR(255) NOT NULL,
  vehicle_serial  VARCHAR(255) NOT NULL,
  vehicle_color   VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vehicle_customer_id ON customer_vehicle_info(customer_id);

-- Company tables -------------------------------------------------

CREATE TABLE IF NOT EXISTS company_roles (
  company_role_id   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company_role_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS common_services (
  service_id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_name        VARCHAR(255) NOT NULL,
  service_description TEXT,
  active_service      INTEGER NOT NULL DEFAULT 1
);

-- Employee tables ------------------------------------------------

CREATE TABLE IF NOT EXISTS employee (
  employee_id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_email VARCHAR(255) NOT NULL UNIQUE,
  active_employee INTEGER     NOT NULL DEFAULT 1,
  added_date     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS employee_info (
  employee_info_id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id         INTEGER      NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
  employee_first_name VARCHAR(255) NOT NULL,
  employee_last_name  VARCHAR(255) NOT NULL,
  employee_phone      VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_employee_info_employee_id ON employee_info(employee_id);

CREATE TABLE IF NOT EXISTS employee_pass (
  employee_pass_id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id              INTEGER      NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
  employee_password_hashed VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_employee_pass_employee_id ON employee_pass(employee_id);

CREATE TABLE IF NOT EXISTS employee_role (
  employee_role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id      INTEGER NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
  company_role_id  INTEGER NOT NULL REFERENCES company_roles(company_role_id)
);
CREATE INDEX IF NOT EXISTS idx_employee_role_employee_id ON employee_role(employee_id);

-- Order tables ---------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  order_id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  employee_id INTEGER      NOT NULL REFERENCES employee(employee_id),
  customer_id INTEGER      NOT NULL REFERENCES customer_identifier(customer_id),
  vehicle_id  INTEGER      NOT NULL REFERENCES customer_vehicle_info(vehicle_id),
  order_date  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  active_order INTEGER     NOT NULL DEFAULT 1,
  order_hash  VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vehicle_id  ON orders(vehicle_id);

CREATE TABLE IF NOT EXISTS order_info (
  order_info_id                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id                      INTEGER     NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  order_total_price             INTEGER     NOT NULL,
  estimated_completion_date     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completion_date               TIMESTAMPTZ,
  additional_request            TEXT,
  notes_for_internal_use        TEXT,
  notes_for_customer            TEXT,
  additional_requests_completed INTEGER     NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_info_order_id ON order_info(order_id);

CREATE TABLE IF NOT EXISTS order_services (
  order_service_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id          INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  service_id        INTEGER NOT NULL REFERENCES common_services(service_id),
  service_completed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON order_services(order_id);

CREATE TABLE IF NOT EXISTS order_status (
  order_status_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  order_status    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_status_order_id ON order_status(order_id);

-- Seed: company roles --------------------------------------------
INSERT INTO company_roles (company_role_name)
  VALUES ('Employee'), ('Manager'), ('Admin')
  ON CONFLICT (company_role_name) DO NOTHING;
