# 미니 방명록

이름, 메시지, 작성 시각이 쌓이는 미니 방명록입니다. 회원가입이나 로그인은 없습니다. 글을 쓸 때 정한 비밀번호로만 그 글을 수정하거나 삭제할 수 있습니다.

- 개발자: **강동헌**
- 학번: **202204169**
- 배포: https://guestbook-202204169.vercel.app

## 기능

- **작성**: 이름(1~20자), 메시지(1~500자), 비밀번호(4~72자)를 입력해 글을 남깁니다.
- **조회**: 모든 글을 작성 시각 최신순으로 보여줍니다. 시각은 한국 시간 기준입니다.
- **수정**: 비밀번호가 맞으면 메시지를 고칠 수 있습니다. 이름은 바꿀 수 없습니다. 수정된 글에는 "(수정됨)"과 수정 시각이 붙습니다.
- **삭제**: 비밀번호가 맞으면 글이 완전히 삭제됩니다.
- 비밀번호가 틀리면 수정이나 삭제가 거부되고, 글 카드 안에 안내가 나옵니다. 이미 삭제된 글이면 따로 안내합니다.

## 기술 스택

- Next.js 16 (App Router, Server Actions) + TypeScript
- Neon Postgres (`@neondatabase/serverless`)
- Tailwind CSS
- Vitest
- Vercel 배포

## 로컬 실행

```bash
npm install
```

프로젝트 루트에 `.env.local` 파일을 만들고 Neon 연결 문자열을 넣습니다.

```
DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require
```

테이블을 만들고 개발 서버를 실행합니다.

```bash
npm run db:init   # entries 테이블 생성 (여러 번 실행해도 안전)
npm run dev       # http://localhost:3000
```

## 테스트

```bash
npm test
```

방명록 모듈(`lib/guestbook`)을 메모리 저장소로 테스트합니다. 작성, 목록 정렬, 입력 검증 경계값, 비밀번호 일치와 불일치, 이미 삭제된 글 처리, 비밀번호 비노출을 확인합니다. 실제 DB에는 접속하지 않습니다.

## Vercel 배포

1. [Vercel](https://vercel.com/new)에서 GitHub 저장소 `kang1031/guestbook-202204169`를 가져옵니다(Import).
2. **Settings → Environment Variables**에 `DATABASE_URL`을 추가합니다. Neon 연결 문자열을 넣고 Production, Preview, Development를 모두 선택합니다. Vercel의 Neon 연동(Storage → Neon)을 쓰면 이 변수가 자동으로 추가됩니다.
3. 운영 DB에 테이블이 없다면 로컬에서 한 번 실행합니다: `DATABASE_URL="<운영 DB 연결 문자열>" npm run db:init`. `.env.local`이 없어도 동작하며, 셸에서 지정한 값이 `.env.local`보다 우선합니다.
4. 배포합니다. 이후 `master` 브랜치에 푸시할 때마다 자동으로 다시 배포됩니다.

## 구조

- `lib/guestbook/`: 방명록 모듈. 작성, 목록, 메시지 수정, 삭제를 담당하고, 저장소(`EntryStore`)를 주입받습니다.
  - `validation.ts`: 입력 검증. 글자 수는 사용자가 보는 글자 기준으로 셉니다.
  - `password.ts`: `crypto.scrypt`와 글마다 다른 salt로 비밀번호를 해시하고, 상수 시간으로 비교합니다.
  - `neon-store.ts`: Neon Postgres 저장소. 모든 값은 쿼리 파라미터로 바인딩합니다.
  - `memory-store.ts`: 테스트용 메모리 저장소
- `app/actions.ts`: Server Actions. 폼 입력을 방명록 모듈로 넘기는 얇은 연결부입니다.
- `app/page.tsx`: 목록 페이지. 요청마다 렌더링합니다.
- `app/entry-form.tsx`, `app/entry-card.tsx`: 작성 폼과 글 카드(보기, 수정, 삭제 모드)
- `db/schema.sql`: 테이블 정의
- `GLOSSARY.md`: 도메인 용어 정의

## 범위에서 제외한 것

- **비밀번호 시도 횟수 제한**: 무차별 대입을 막으려면 시도 횟수를 요청 사이에 기억해야 합니다. Vercel 서버리스 함수는 인스턴스끼리 메모리를 공유하지 않아서 Redis 같은 별도 저장소가 필요하고, 이 과제 범위를 넘습니다. 비밀번호는 scrypt 해시로만 저장하므로 DB가 유출돼도 원문은 드러나지 않습니다.
- 이름 수정, 비밀번호 변경이나 분실 복구, 페이지네이션, 삭제 글 복구, 스팸 방지, 실시간 갱신
