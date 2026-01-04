# PostgreSQL 데이터베이스 설정 가이드

## 문제 해결: 접근 권한 오류

`P1010: User 'user' was denied access` 오류가 발생하는 경우, 다음 단계를 따라주세요.

## 방법 1: 기본 PostgreSQL 사용자 사용 (가장 간단)

대부분의 경우, PostgreSQL의 기본 사용자를 사용하는 것이 가장 쉽습니다.

### 1. PostgreSQL 기본 사용자로 접속

```bash
psql postgres
```

또는 만약 PostgreSQL이 다른 사용자로 설치되어 있다면:

```bash
psql -U postgres
# 또는
psql -U $(whoami) postgres
```

### 2. 데이터베이스 생성

```sql
CREATE DATABASE myblog;
\q
```

### 3. .env 파일 설정

프로젝트 루트에 `.env` 파일을 만들고 다음 중 하나를 사용하세요:

**옵션 A: 기본 사용자 (postgres)**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myblog?schema=public"
```
*비밀번호가 설정되어 있지 않다면 `postgresql://postgres@localhost:5432/myblog?schema=public` 사용*

**옵션 B: 현재 시스템 사용자**
```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/myblog?schema=public"
```
*터미널에서 실행: `echo "DATABASE_URL=\"postgresql://$(whoami)@localhost:5432/myblog?schema=public\"" >> .env`*

### 4. Prisma 스키마 적용

```bash
npm run db:generate
npm run db:push
```

## 방법 2: 새 사용자 생성

### 1. PostgreSQL에 접속

```bash
psql postgres
```

### 2. 사용자 및 데이터베이스 생성

```sql
-- 사용자 생성
CREATE USER myblog_user WITH PASSWORD 'your_secure_password';

-- 데이터베이스 생성
CREATE DATABASE myblog;

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE myblog TO myblog_user;

-- 데이터베이스에 연결
\c myblog

-- 스키마 권한 부여
GRANT ALL ON SCHEMA public TO myblog_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO myblog_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO myblog_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO myblog_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO myblog_user;

\q
```

### 3. .env 파일 설정

```env
DATABASE_URL="postgresql://myblog_user:your_secure_password@localhost:5432/myblog?schema=public"
```

### 4. Prisma 스키마 적용

```bash
npm run db:generate
npm run db:push
```

## 빠른 설정 (macOS Homebrew 설치 기준)

Homebrew로 PostgreSQL을 설치한 경우:

```bash
# 1. PostgreSQL 시작 (필요한 경우)
brew services start postgresql@14
# 또는 postgresql@15, postgresql@16 등 설치된 버전에 맞게

# 2. 현재 사용자로 데이터베이스 생성
createdb myblog

# 3. .env 파일 생성
echo 'DATABASE_URL="postgresql://'"$(whoami)"'@localhost:5432/myblog?schema=public"' > .env

# 4. Prisma 스키마 적용
npm run db:generate
npm run db:push
```

## 문제 진단

### PostgreSQL이 실행 중인지 확인

```bash
# macOS
brew services list

# 또는
ps aux | grep postgres
```

### 연결 테스트

```bash
psql -d myblog
```

성공하면 데이터베이스 연결이 정상입니다. `\q`로 종료하세요.

### 사용자 및 데이터베이스 목록 확인

```bash
psql postgres -c "\l"  # 데이터베이스 목록
psql postgres -c "\du" # 사용자 목록
```

## 추가 리소스

- [Prisma 데이터베이스 연결 가이드](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)

