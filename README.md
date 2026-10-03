# 던전탈출 사칙연산 v1.1

초등학생이 세 개의 주사위를 사칙연산으로 조합해 몬스터와 싸우는 1~4인 로컬 협동 수학 RPG입니다. 태블릿 순차 입력과 전자칠판 동시 입력을 지원합니다.

## v1.1 변화

검격 4종과 몬스터별 반격 3종, 등급별 템포, 연속 공격 표시, 마지막 일격, 반복 특수기 축약 연출을 추가했습니다. 콤보는 연출이며 추가 피해를 주지 않습니다.

공격 S는 A급 기본 검격 뒤 팀 공용 두루마리를 선택하거나 아껴둘 수 있습니다. 선택·연출 중 계산 시간은 멈춥니다. 처치 가능한 검격이면 미사용 두루마리는 소비하지 않습니다.

화염구·얼음창·마법방패·치유·연쇄번개·정화·운석·시간정지의 8종이 있습니다. 처치 후 랜덤 전리품 세 후보 중 하나를 고릅니다. 희귀도는 일반/고급/희귀/영웅이며 역할이 서로 다릅니다. 상세 수치와 한계는 CHANGELOG-v1.1.md를 참고하세요.

HP는 던전 전체에서 유지하고 다음 몬스터에서 방어막은 0입니다. 좌→우 계산, 목표 생성, 공격/방어 등급 수치, 기존 몬스터 수치와 입력 모드를 유지합니다.

## 실행과 검사

Node.js 18 이상에서 START.cmd 또는 npm start. npm run build는 정적 배포 파일을 dist에 만듭니다.

npm test: 자동 검사. 서버 실행 후 npm run test:browser, npm run test:presentation, npm run test:quality, npm run test:update로 Edge/Playwright 검사를 실행합니다.

?debug=1은 개발자 전용 테스트 패널입니다. 일반 주소에는 패널과 개발 API가 없습니다.

## 저장과 배포

GitHub 저장소: https://github.com/limjiseung62-lgtm/dungeon-arithmetic

main push → 자동 테스트/production build → GitHub Pages의 같은 주소 업데이트. v1.0 태그는 기존 정상 버전 복구 지점입니다. v1.1 로컬 작업은 update/v1.1 브랜치에서 진행했습니다.
