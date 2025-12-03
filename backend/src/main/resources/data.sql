-- ============================================
-- DROP TABLES IF THEY ALREADY EXIST
-- ============================================
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS user_friends;
DROP TABLE IF EXISTS cafes;
DROP TABLE IF EXISTS users;

-- ============================================
-- CREATE users TABLE (matches JPA User entity)
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- ============================================
-- CREATE user_friends TABLE (Many-to-Many relationship)
-- ============================================
CREATE TABLE user_friends (
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
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
    user_id BIGINT NOT NULL,
    overall_rating DOUBLE,
    tags VARCHAR(200),
    ai_summary VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- CREATE reviews TABLE
-- ============================================
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cafe_id INT NOT NULL,
    rating DOUBLE NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(cafe_id) ON DELETE CASCADE
);

-- ============================================
-- INSERT USER DATA (BCrypt-encoded passwords)
-- Password for all users is: "testuser"
-- ============================================
INSERT INTO users (username, email, password)
VALUES
('testuser', 'test@usc.edu', '$2a$10$oKjKkpoS93JqjEQ/7jWq/ewiFQh7JHQAEigf6F.dD7C.1Jk1P6PCO'),
('demoUser', 'demo@example.com', '$2a$10$oKjKkpoS93JqjEQ/7jWq/ewiFQh7JHQAEigf6F.dD7C.1Jk1P6PCO'),
('coffeeKing', 'coffee@usc.edu', '$2a$10$oKjKkpoS93JqjEQ/7jWq/ewiFQh7JHQAEigf6F.dD7C.1Jk1P6PCO'),
('latte_lover', 'latte@usc.edu', '$2a$10$oKjKkpoS93JqjEQ/7jWq/ewiFQh7JHQAEigf6F.dD7C.1Jk1P6PCO');

-- ============================================
-- INSERT CAFES DATA
-- ============================================
INSERT INTO cafes (name, address, latitude, longitude, price, user_id, overall_rating, tags, ai_summary)
VALUES
('Blue Bottle Coffee', '300 S Broadway, Los Angeles, CA', 34.0451, -118.2517, 1, 1, 4.6, 'bathrooms,outlets', 'Bright space with excellent espresso.'),
('Maru Coffee', '1936 Hillhurst Ave, Los Angeles, CA', 34.1053, -118.2871, 2, 1, 4.8, 'metro-friendly,wifi', 'Famous for premium matcha drinks.'),
('Urth Caffé', '451 S Hewitt St, Los Angeles, CA', 34.0466, -118.2361, 3, 2, 4.2, 'bathrooms,wifi,outlets', 'Popular organic cafe with great desserts.'),
('Starbucks Reserve', '646 S Main St, Los Angeles, CA', 34.0445, -118.2509, 2, 3, 4.0, 'wifi,outlets', 'Premium Starbucks experience with unique roasts.'),
('Verve Coffee', '833 S Spring St, Los Angeles, CA', 34.0430, -118.2545, 2, 4, 4.7, 'wifi,outlets', 'Trendy spot with excellent pour-overs.'),
('Intelligentsia Coffee', '3922 Sunset Blvd, Los Angeles, CA', 34.0908, -118.2834, 2, 1, 4.5, 'wifi,bathrooms', 'Award-winning roasts in a stylish Silver Lake location.'),
('Alfred Coffee', '963 S Broadway, Los Angeles, CA', 34.0456, -118.2564, 3, 2, 4.3, 'metro-friendly,wifi,outlets', 'Trendy spot known for "But First, Coffee" motto.'),
('Philz Coffee', '801 S Hope St, Los Angeles, CA', 34.0459, -118.2592, 2, 3, 4.4, 'metro-friendly,wifi', 'Personalized pour-over coffee with unique blends.');

-- ============================================
-- INSERT SAMPLE REVIEWS
-- ============================================
INSERT INTO reviews (user_id, cafe_id, rating, comment)
VALUES
(1, 1, 4.5, 'Great espresso, love the ambiance!'),
(1, 2, 5.0, 'Best matcha latte in LA!'),
(2, 1, 4.0, 'Good coffee but a bit pricey.'),
(2, 3, 4.5, 'Amazing organic options.'),
(3, 2, 4.8, 'My go-to spot for studying.'),
(4, 5, 4.7, 'Perfect pour-over coffee.');

-- ============================================
-- INSERT SAMPLE FRIENDSHIPS
-- ============================================
INSERT INTO user_friends (user_id, friend_id)
VALUES
(1, 2),
(1, 3),
(2, 1);
