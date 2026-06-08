CREATE DATABASE IF NOT EXISTS shoe_authenticity;
USE shoe_authenticity;

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_code VARCHAR(100) NOT NULL UNIQUE,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  release_year INT NOT NULL,
  company_wallet VARCHAR(42) NOT NULL,
  image_url TEXT,
  description TEXT,
  specifications JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_wallet (company_wallet),
  INDEX idx_product_code (product_code)
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_address VARCHAR(42),
  action VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  tx_hash VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_product_code (product_code),
  INDEX idx_activity_wallet (wallet_address)
);
