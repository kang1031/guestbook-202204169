# 05: README와 Vercel 배포

**What to build:** 누구나 배포된 Vercel URL에서 방명록의 작성, 조회, 수정, 삭제를 모두 쓸 수 있다. README만 보고 로컬 실행, 테이블 생성, 배포를 따라 할 수 있다.

**Blocked by:** 03 (메시지 수정), 04 (글 삭제)

**Status:** done

- [x] README에 다음 내용이 있다: 프로젝트 소개(개발자 강동헌 · 202204169), 기술 스택, 로컬 실행 방법, `DATABASE_URL` 설정, `npm run db:init`, 테스트 실행, Vercel 배포 절차, 시도 횟수 제한을 범위에서 뺀 이유
- [x] Vercel 프로젝트가 GitHub 저장소 kang1031/guestbook-202204169에 연결되어 있고, `DATABASE_URL`이 환경 변수로 등록되어 있다. 계정 로그인과 연결은 사용자가 직접 해야 할 수 있다
- [x] 운영 DB에 `entries` 테이블이 있다
- [x] 서버 코드가 Node 런타임에서 실행된다
- [x] 배포된 URL에서 확인했다: 작성, 최신순 목록, 수정 성공과 비밀번호 오류 안내, 삭제 성공과 비밀번호 오류 안내, 헤더의 개발자 정보, 모바일 표시
