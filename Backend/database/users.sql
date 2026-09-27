CREATE TABLE IF NOT EXISTS users (
  id CHAR(32) NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(80) NOT NULL DEFAULT 'Sales Executive',
  avatar_color CHAR(7) NOT NULL DEFAULT '#3B3486',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO users (id, name, email, password_hash, role, avatar_color)
VALUES
  ('u1', 'Aarav Sharma', 'aarav@smartcrm.io', 'smartcrm123', 'Sales Manager', '#3B3486'),
  ('u2', 'Priya Patel', 'priya@smartcrm.io', 'smartcrm123', 'Account Executive', '#0E8388'),
  ('u3', 'Rohan Mehta', 'rohan@smartcrm.io', 'smartcrm123', 'SDR', '#C05621'),
  ('u4', 'Ananya Desai', 'ananya@smartcrm.io', 'smartcrm123', 'CSM', '#805AD5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  avatar_color = VALUES(avatar_color);
