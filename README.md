# My Blog

Next.js 기반의 개인 블로그입니다. PostgreSQL과 마크다운을 지원합니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Markdown**: react-markdown

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 데이터베이스 생성 및 환경 변수 설정

#### 빠른 설정 (Homebrew로 설치한 PostgreSQL)

```bash
# 1. 데이터베이스 생성
createdb myblog

# 2. .env 파일 생성 (현재 사용자 사용)
echo 'DATABASE_URL="postgresql://'"$(whoami)"'@localhost:5432/myblog?schema=public"' > .env
```

#### 수동 설정

1. PostgreSQL에 접속:
```bash
psql postgres
```

2. 데이터베이스 생성:
```sql
CREATE DATABASE myblog;
\q
```

3. `.env` 파일 생성:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/myblog?schema=public"
```
*비밀번호가 설정되어 있다면: `postgresql://postgres:your_password@localhost:5432/myblog?schema=public`*

⚠️ **접근 권한 오류 발생 시**: `DATABASE_SETUP.md` 파일을 참고하세요.

### 3. 데이터베이스 설정

Prisma 스키마를 데이터베이스에 적용합니다:

```bash
npm run db:generate
npm run db:push
```

또는 마이그레이션을 사용하려면:

```bash
npm run db:generate
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 기능

- ✅ 게시글 작성 (마크다운 지원)
- ✅ 게시글 목록 조회
- ✅ 게시글 상세 보기
- ✅ 게시글 수정/삭제 (IP 기반 권한 제어)
- ✅ 마크다운 렌더링 (코드 하이라이팅 포함)
- ✅ 이미지 업로드 및 관리
- ✅ 자동 이미지 정리 스케줄러 (사용되지 않는 이미지 자동 삭제)
- ✅ 반응형 디자인

## 프로젝트 구조

```
my_blog/
├── prisma/
│   └── schema.prisma      # 데이터베이스 스키마
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── posts/     # 게시글 API 라우트
│   │   ├── posts/
│   │   │   ├── new/       # 새 게시글 작성 페이지
│   │   │   └── [id]/      # 게시글 상세 페이지
│   │   ├── layout.tsx     # 레이아웃
│   │   ├── page.tsx       # 홈 페이지 (게시글 목록)
│   │   └── globals.css    # 전역 스타일
│   └── lib/
│       └── prisma.ts      # Prisma 클라이언트
└── package.json
```

## 사용법

1. **게시글 작성**: 상단 네비게이션의 "글쓰기" 버튼을 클릭하거나 `/posts/new`로 이동
2. **게시글 조회**: 홈 페이지에서 게시글 목록을 확인하고 제목을 클릭하여 상세 보기
3. **마크다운 작성**: 게시글 작성 시 마크다운 문법을 사용하여 포맷팅된 내용을 작성할 수 있습니다.
4. **이미지 업로드**: 게시글 작성/수정 시 이미지 업로드 버튼을 통해 이미지를 업로드할 수 있습니다.

## 이미지 정리 스케줄러

게시글이 삭제되면 해당 게시글에서 사용하던 이미지가 로컬에 남아있을 수 있습니다. 이를 방지하기 위해 자동 정리 스케줄러가 실행됩니다.

### 자동 실행
- **프로덕션 모드**: 매일 새벽 3시에 자동 실행
- **스케줄 변경**: `.env` 파일에 `IMAGE_CLEANUP_SCHEDULE` 환경 변수로 cron 스케줄 설정 가능
  - 예: `IMAGE_CLEANUP_SCHEDULE="0 3 * * *"` (매일 새벽 3시)

### 수동 실행
허용된 IP에서 다음 API를 호출하여 수동으로 실행할 수 있습니다:

```bash
curl -X POST http://localhost:3000/api/cleanup-images
```

응답 예시:
```json
{
  "success": true,
  "deletedCount": 5,
  "deletedFiles": ["1234567890-image1.jpg", "1234567891-image2.png"]
}
```

## 데이터베이스 스키마

### Post

- `id`: 게시글 ID (자동 증가)
- `title`: 제목
- `content`: 내용 (마크다운)
- `createdAt`: 작성일시
- `updatedAt`: 수정일시

