-- PostgreSQL 데이터베이스 및 사용자 설정 스크립트
-- psql -U postgres -f setup-db.sql 으로 실행하거나
-- psql에 접속한 후 아래 명령어들을 직접 실행하세요

-- 1. 데이터베이스 생성 (이미 존재하면 오류 무시)
CREATE DATABASE myblog;

-- 2. 사용자 생성 (필요한 경우)
-- CREATE USER myblog_user WITH PASSWORD 'your_password_here';

-- 3. 권한 부여
GRANT ALL PRIVILEGES ON DATABASE myblog TO CURRENT_USER;
-- 만약 별도 사용자를 생성했다면:
-- GRANT ALL PRIVILEGES ON DATABASE myblog TO myblog_user;

-- 4. 데이터베이스에 연결 후 스키마 권한 부여 (myblog 데이터베이스에 접속한 후 실행)
-- \c myblog
-- GRANT ALL ON SCHEMA public TO CURRENT_USER;
-- 또는 별도 사용자인 경우:
-- GRANT ALL ON SCHEMA public TO myblog_user;

