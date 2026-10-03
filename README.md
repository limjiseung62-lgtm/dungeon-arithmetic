# 던전탈출 사칙연산

초등학생이 사칙연산을 활용해 몬스터와 싸우는 협력형 던전 RPG 수학 게임.

## 플레이 방식

- 1~4인 로컬 협동
- 태블릿 순차 플레이 / 전자칠판 동시 플레이
- 주사위 3개의 숫자를 왼쪽부터 계산하는 사칙연산으로 조합
- 공격·방어 S/A/B/C 목표를 선택하고 행동 예약 후 일괄 전투
- 스크롤과 특수능력 차단을 활용한 5종 몬스터 공략
- HP는 던전 전체에서 유지하며 다음 몬스터 시작 시 방어막은 0

## 현재 버전

v1.0 테스트 버전. 서버·계정 없이 실행하는 정적 웹 게임입니다. 기존 연출·음원·한국어 UI를 유지합니다.

## 실행과 검증

Node.js 18 이상에서 START.cmd 또는 npm start를 실행합니다.

npm test: 자동 검사. npm run build: 배포용 dist 생성.

서버 실행 후 npm run test:browser, npm run test:quality로 브라우저 검사를 실행할 수 있습니다. 브라우저 검사는 Playwright와 Edge가 필요합니다.

## 배포

GitHub 저장소: https://github.com/limjiseung62-lgtm/dungeon-arithmetic

GitHub Pages 설정 후 main에 push하면 테스트·빌드·배포를 자동 실행하도록 .github/workflows/pages.yml을 준비했습니다. 상세 연결 단계와 검증 상태는 RELEASE-v1.0.md를 참고하세요.

최신 버전 반영: git add . && git commit -m "Update game" && git push origin main

v1.0 기준점: git switch --detach v1.0 (변경 파일을 먼저 저장한 뒤 실행).
