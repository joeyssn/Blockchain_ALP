CREATE DATABASE IF NOT EXISTS product_authenticity;

USE product_authenticity;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    category VARCHAR(100),
    seller_name VARCHAR(255),
    owner_wallet VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);