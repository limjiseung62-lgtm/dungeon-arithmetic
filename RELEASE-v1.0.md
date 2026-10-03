# v1.0 테스트 버전 릴리스 기록

2026-10-03. 새 기능이나 대규모 리팩터링 없이 현재 게임을 보존합니다. 이전 원본은 work/dungeon-before-v1-release와 기존 v5 ZIP에 보존했습니다.

## 최소 수정

다음 몬스터 시작 시 방어막이 남던 것을 0으로 초기화합니다. HP는 그대로 유지합니다. HP 82/방어막 30 → 고블린 HP 82/방어막 0의 회귀 테스트를 추가했습니다. 나머지 수식·전투·음원·UI 규칙을 새로 설계하지 않았습니다.

현재 특수기는 정해진 턴별 주기로 반복하며 무한히 강화되지 않습니다. 요청 점검 목록의 '턴이 길어질수록 강화'는 무제한 강화 시스템으로 구현되어 있지 않습니다. 이번 동결 작업에서 새 시스템을 추가하지 않았습니다.

## 빌드와 검사

정적 ES 모듈 프로젝트이므로 번들러 없이 실행 파일·src·assets만 dist로 복사하는 production build를 추가했습니다. 테스트·개인 설정·Git·개발 서버는 배포 산출물에 포함하지 않습니다. 상대 자산 경로를 유지하여 GitHub Pages 저장소 하위 경로에서도 실행합니다.

자동 검사 48개 통과. 실제 Edge 브라우저에서 PC/태블릿/전자칠판 배치와 수식 입력, 예약, 전투, 음향 동기화, 한국어 UI를 확인했습니다. 실제 태블릿·학교 전자칠판 하드웨어 검증을 대체하지는 않습니다.

전략 수치는 v5의 BALANCE-REPORT.md가 당시 기준입니다. 이번 방어막 초기화 후에는 그 문서의 캠페인 잔여 HP/턴 결과가 동일하다고 보장하지 않습니다. 현재 전체 인원 캠페인 자동 검사는 통과했습니다.

.gitignore는 node_modules/dist/cache/log/env/private key/개인 IDE 설정을 제외합니다. 소스와 배포 파일에서 일반적인 비밀키 패턴을 검사했습니다. 게임은 외부 API key를 사용하지 않습니다.

## GitHub Pages 활성화

1. 지정 저장소에 로그인한 뒤 Settings → Pages를 엽니다.
2. Build and deployment → Source를 GitHub Actions로 선택합니다.
3. main push 후 Actions → Deploy game to GitHub Pages의 결과를 확인합니다.
4. 완료된 배포가 제공하는 HTTPS 주소를 사용합니다. 현재 문서에는 확인되지 않은 주소를 공개 게임 주소로 적지 않습니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

연결할 원격은 https://github.com/limjiseung62-lgtm/dungeon-arithmetic.git 입니다. 실제 push·태그 반영·공개 주소 접속 확인은 별도 완료 여부로 보고합니다.
