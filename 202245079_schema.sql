-- 학번_schema.sql (예: 202512345_schema.sql)
-- DB 생성
CREATE DATABASE IF NOT EXISTS portfolio_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE portfolio_db;

-- users 테이블: 로그인 및 기본 정보
CREATE TABLE IF NOT EXISTS users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    student_id    VARCHAR(20) NOT NULL UNIQUE,   -- 학번
    name          VARCHAR(50) NOT NULL,          -- 이름
    email         VARCHAR(100) NOT NULL UNIQUE,  -- 이메일
    password_hash VARCHAR(255) NOT NULL,         -- bcrypt 해시
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- portfolio_items 테이블: 프로젝트/기술 카드
CREATE TABLE IF NOT EXISTS portfolio_items (
    item_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    title        VARCHAR(255) NOT NULL,          -- 제목
    summary      VARCHAR(500) NULL,              -- 한 줄 요약
    content      TEXT NOT NULL,                  -- 상세 내용
    category     VARCHAR(50) DEFAULT 'PROJECT',  -- PROJECT / SKILL / ETC 등
    github_url   VARCHAR(255) NULL,
    demo_url     VARCHAR(255) NULL,
    is_public    TINYINT(1) DEFAULT 1,           -- 공개 여부
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- reflections 테이블: 개인 소감/회고
CREATE TABLE IF NOT EXISTS reflections (
    reflection_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    title         VARCHAR(255) NOT NULL,       -- 소감 제목
    content       TEXT NOT NULL,               -- 소감 내용
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reflection_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
