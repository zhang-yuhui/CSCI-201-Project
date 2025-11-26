-- ============================================
-- DROP TABLES IF THEY ALREADY EXIST
-- ============================================
DROP TABLE IF EXISTS cafes;
DROP TABLE IF EXISTS userinfo;

-- ============================================
-- CREATE userinfo TABLE
-- ============================================
CREATE TABLE userinfo (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE cafes TABLE
-- ============================================
CREATE TABLE cafes (
    cafe_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    price DOUBLE NOT NULL,
    user_id INT NOT NULL,
    overall_rating DOUBLE,
    tags VARCHAR(200),
    ai_summary VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES userinfo(user_id)
);

-- ============================================
-- INSERT USER DATA
-- ============================================
INSERT INTO userinfo (username, email, password_hash)
VALUES
('demoUser', 'demo@example.com', 'hashed_pw_123'),
('testUser', 'test@example.com', 'hashed_pw_456');

-- ====================users========================
-- INSERT CAFES DATA
-- ============================================
INSERT INTO cafes (name, address, latitude, longitude, price, user_id, overall_rating, tags, ai_summary)
VALUES
('Blue Bottle Coffee', '300 S Broadway, Los Angeles, CA', 34.0451, -118.2517, 4, 1, 4.6, 'coffee,study', 'Bright space with excellent espresso.'),
('Maru Coffee', '1936 Hillhurst Ave, Los Angeles, CA', 34.1053, -118.2871, 3, 1, 4.8, 'matcha,quiet', 'Famous for premium matcha drinks.'),
('Urth Caffé', '451 S Hewitt St, Los Angeles, CA', 34.0466, -118.2361, 3, 2, 4.2, 'organic,breakfast', 'Popular organic cafe with great desserts.');
