# 던전탈출 사칙연산 v2.3 완료 보고

기준: v2.2 commit 5c3dd0b. 기존 프로젝트를 확장했으며 새 프로젝트를 만들지 않았다. 검증은 로컬 Edge/Playwright, Node test runner에서 수행했다. 원격 push와 공개 배포는 수행하지 않는다.

## 1. 주요 변경 파일

신규: src/MercenaryData.js, src/MercenarySystem.js, src/MercenaryPresentation.js, mercenary-v2.3.css, assets/mercenaries/*.webp, tests/mercenary.test.mjs, tests/mercenary-browser.cjs, tests/mercenary-balance.mjs.

연결: RPGMode/RPGView/UI, SaveSystem/RPGConfig, QuestData/QuestSystem, CombatSystem의 두 선택적 callback, ScrollSystem의 기본값 0인 powerModifier, index/package/build. 기존 Encounter/Monster/Math/Equipment/Shop/Loot 구조를 재작성하지 않았다.

## 2. MercenarySystem 구조

- 데이터: 조건, 효과, 값, 전투별 제한, 비용, 자산 경로, 대사.
- 로직: hireMercenary → bindContract → 계산 성공 후 support → returnToTown의 endContract.
- 계약: waiting/active, 구매 token, contract ID, run ID, 전투별 지원 counts, 지원 eventIds, 계산 성공 encounter 기록.
- 지원 효과는 전투의 기존 행동 적용 직후 계산한다. 모든 적이 기본 공격으로 이미 쓰러졌으면 추가 공격과 미사용 스크롤을 낭비하지 않는다.
- 시스템이 HP/Shield/적 HP를 반영하고 Presentation은 반영된 결과의 등장·투사체·피격·마법진만 보여준다. UI 없이도 결정적 계산 검증이 가능하다.
- Battle Core에는 용병 이름별 조건이 없다. RPGMode가 generic supportHook/scrollModifier를 연결하고 CLASS는 연결하지 않는다.

## 3–5. 용병 6명·능력·고용비

| 등급 | 이름/직업 | 발동 | 효과/전투별 제한 | 비용 |
|---|---|---|---|---:|
| B | 로웬/궁수 | Attack A/S | 화살 피해 +5, 3회 | 260G |
| B | 브람/기사 | Defense A/S | 방어막 +6, 3회 | 240G |
| A | 세라/성직자 | 계산에 성공한 전투 승리 | HP +12, 최대 HP 제한, 1회 | 480G |
| A | 루나/마법사 | Attack S로 실제 Scroll 사용 | 피해/회복/방어막 +6, 2회 | 520G |
| S | 카인/검성 | Attack S | 참격 피해 +12, 2회 | 1,050G |
| S | 엘리아/대현자 | Attack S 또는 Defense S | 피해 +8 또는 방어막 +10, 합계 3회 | 1,150G |

Luna는 스크롤 charge를 추가 소모하지 않는다. 기존 장비의 ScrollPowerBonus와 합산한다. 정화/시간정지처럼 수치 강화가 없는 스크롤은 원래 효과를 유지하고 보호 방어막 +6을 제공한다. 운석 주변 적에도 용병 보정 +6을 적용한다. 로웬/카인의 지원 피해는 적의 남은 HP까지만 계산하며 Total Damage에 포함된다. 브람/엘리아의 방어막은 기존 방어와 합산하고 Defense S Special Block 규칙을 대체하지 않는다.

## 6–7. 이미지 자산·출처

assets/mercenaries/rowen.webp, bram.webp, sera.webp, luna.webp, kain.webp, elia.webp. 각 667×1000px, 실제 투명 alpha. built-in image_gen으로 새로 제작한 독창적인 판타지 RPG 캐릭터다. 상업 게임 이미지/캐릭터 복사 없음.

[ASSET-PROMPTS-v2.3.md](ASSET-PROMPTS-v2.3.md)와 [MERCENARY-ASSETS-v2.3.json](MERCENARY-ASSETS-v2.3.json)에 최종 경로, 원본 위치, 정확한 프롬프트, 연결 위치를 기록했다. 전신 원본을 카드 crop과 상세/전투 contain으로 재사용한다. 최적화는 Sharp resize/WebP encoding이며 alpha를 유지했다. 카드 lazy loading, 전투는 동행하는 1명만 eager loading.

## 8. 용병 전투 연출

로웬: 측면 진입·활 준비 동작·화살·대상 피격. 브람: 앞쪽 진입·방패·푸른 보호막. 세라: 승리 후 녹색/금색 회복. 루나: 보라색 마법진과 증폭. 카인: 빠른 진입·참격·피격·퇴장. 엘리아: 공격 에너지 또는 보호막.

일반 첫 발동 620ms, S급 780ms, 반복 발동 420ms. reduced-motion에서는 120ms/정적 표시. 기존 연출 건너뛰기가 지원 대기에도 적용된다. 지원 대상 enemy ID로 투사체/피격 위치를 맞춘다. 기존 SFX의 attack/guard/magic를 재사용한다.

## 9. 용병 길드 UI

마을 시설 추가. 6명 항상 비교 가능. 큰 캐릭터 이미지, B/A/S 글자 배지, 등급 프레임, 직업/조건/지원 횟수/가격, 상세/고용 버튼. 상세는 큰 전신과 대사. 골드 부족 안내, 이미 고용한 용병 재결제 차단, 다른 용병 교체는 명시적 확인과 환불 없음 안내. 탐험 중 교체 불가.

## 10. 던전 준비 UI

용병 고용 시 내 이름/레벨/HP와 용병 전신/이름/등급/능력을 함께 보여준다. 준비 취소는 계약과 골드를 유지한다. 출발 시 이미 지불한 계약을 run ID에 연결한다. 전투 HUD에도 동료 초상화/능력을 표시하고, 수학 입력 중 동행 이미지는 목표·패드와 별도 영역에 배치한다.

## 11. Gold 경제

기존 지하감옥 기본 완주 수입 175G, 숲 411G. 기존 영구 장비는 100–700G. B 고용은 지하감옥 약 1.4–1.5회, A는 숲 약 1.2회, S는 숲 약 2.6–2.8회의 기본 수입이다. 한 탐험 후 계약이 종료되어 반복 고용은 명확한 골드 소비다. 영구 장비와 일회용 동료 사이의 선택을 유지한다. 용병 관련 새 퀘스트 보상 합계는 한 번만 290G이며 반복 수익을 만들지 않는다.

## 12. Quest 연동

기존 10개 의뢰 유지 + 3개:

| 의뢰 | 목표 | 보상 |
|---|---|---|
| 새로운 동료 | 용병 동반 던전 클리어 1회 | 40EXP/80G |
| 완벽한 호흡 | 실제 용병 지원 5회 | 50EXP/90G |
| 든든한 동료 | 용병 동반 저주받은 숲 클리어 | 60EXP/120G |

기존 수락 이후 진행, 동시에 3개, 완료 후 귀환하여 수동 보고, 보상 1회 규칙을 그대로 사용한다. 지원 event ID에는 mercenary namespace를 둬 기존 공격 event와 충돌하지 않게 했다. 던전 clear event는 계약이 종료되기 전 동행 ID를 기록한다.

## 13. SaveData migration

saveVersion 3→4. 이전 0/1/2 버전도 기존 chain을 통해 4로 이동한다. 기존 localStorage 키와 backup 사용. 신규 activeMercenary, mercenaryContractState, mercenaryStats(hires/supports/ended). 계약이 없으면 null/null/0으로 시작한다. 기존 객체를 복제하여 migration하고 원본은 변경하지 않는다.

waiting/active와 run ID 일치, 알려진 용병, 중복 event ID, 비음수 counts/stats를 검증한다. 새로고침 시 기존 저장 정책대로 중단된 전투는 다시 시작하지만 지불된 계약/사용 횟수/진행/HP/두루마리를 유지한다. 고용비를 다시 청구하지 않는다.

## 14. v2.2 보존

캐릭터 이름/레벨/EXP/Gold/HP/스크롤/장비/중복 인벤토리, Quest 상태와 진행, 숲 해금, clear/lootHistory, 진행 중 던전 pending receipt를 비교하는 migration tests 통과. 실제 브라우저에서도 v2.2 형태의 QA 세이브를 불러와 캐릭터 전체를 비교했다. 기존 세이브 초기화 없음.

## 15–16. CLASS/RPG 회귀

CLASS에는 용병 길드/지원/용병 퀘스트/Gold 계약을 연결하지 않는다. 기존 1–4인 순차/동시, 다중 몬스터, 특수 차단, 스크롤, 결과 저장 흐름의 browser suites와 unit regression을 유지했다.

RPG 기존 생성/저장/이름 확인/저장 접근 실패 안내/마을/장비/상점/Quest/Loot/2개 던전/보스 회귀 검증. Defense S의 실제 Special Block, 독/시간정지, HP carry/shield reset, 보상 중복 방지 유지.

## 17. 테스트

기존 208개 테스트 유지 + 용병 신규 85개 = **293/293 PASS**. 기존 세이브 버전의 기대값만 3→4, 카탈로그는 기존 10개 보존과 신규 3개를 함께 검사하도록 갱신했다. 테스트 삭제 없음.

신규 coverage: v2.2 migration, 6명/등급 데이터, 비용/부족/1인/교체/중복 결제, 저장/입장/새로고침/계약 종료, 각 조건별 발동/미발동, 지원 damage/shield/heal/scroll, 횟수 제한과 event dedupe, 기존 Special Block, lethal 처리, 새 Quest, CLASS 격리, 잘못된 계약 거부, UI data/asset 연결.

## 18. 실제 브라우저 검증

tests/mercenary-browser.cjs 및 MERCENARY-BROWSER-RESULTS.json. Edge에서 실제 화면 버튼과 목표 solution에 해당하는 주사위/연산 입력으로 계산했다. 강제 승리는 사용하지 않았다. QA 시작 fixture는 Lv4, 강철검/가죽갑옷, 5,000G이며 세라는 치유 검증을 위해 70HP fixture로 시작했다.

6명 카드/상세 → 로웬 고용/골드 차감 → 교체 취소 → 파티 → Attack A 지원 → 전투 중 새로고침 → 실제 지하감옥 3전투 완주 → 새 Quest 완료 → 계약 종료/귀환을 확인했다. 브람 방어, 세라 승리 회복, 루나 S scroll, 카인 S 참격, 엘리아 S 방어와 S 공격을 각각 실제 전투에서 확인했다. 이후 나머지 5명과 용병 없는 경우도 같은 지하감옥 3전투 전체를 완주했다. 각 고용비와 기본 완주 수입 175G를 비교하고, 모든 계약의 귀환 후 종료를 확인했다.

390×844, 1024×768, 1920×1080에서 overflow와 카드/상세/파티/동행 그림을 확인했다. 얼굴/신체/화풍/직업 실루엣/BAS 프레임/이미지 비율과 전투 수학 UI 분리를 직접 검수했다. preview-v23-*.png에 기록했다.

지원 주변 requestAnimationFrame samples도 결과 JSON에 기록한다. 스크린샷 촬영과 여러 브라우저 동시 실행은 측정에 큰 간섭을 주므로, 별도 tests/mercenary-performance.cjs에서 브라우저 하나/기본 연출 속도/스크린샷 없이 각 지원 60 frames를 측정했다. MERCENARY-PERFORMANCE-RESULTS.json의 중앙값은 전원 약 4.2ms, p95는 로웬 8.2ms/나머지 4.3ms다. 단일 동료 아트는 실제 발동 전 HUD에서 로드되어 있으므로 프로파일에서도 decode 후 측정했다. 실제 학교 태블릿에서의 FPS나 학생 입력 시간을 측정한 결과는 아니다.

## 19. Production Build

node build.mjs 성공. dist/index.html에서 용병 길드/6개 자산/기존 저장 이어하기를 실제 브라우저로 검증한다. 신규 CSS와 src/assets가 상대경로로 빌드되어 기존 GitHub Pages 경로 규칙을 유지한다.

## 20. Git

작업 브랜치 update/v2.3. 최종 검증 후 완료 commit과 annotated v2.3 tag 생성. 정확한 commit은 최종 전달 메시지와 git rev-parse v2.3^{}로 확인할 수 있다. 기존 v2.0, v2.1, v2.2 tag 보존. push/공개 배포 없음.

## 21. 발견·수정한 문제

개발 중 용병 지원 ID가 기존 공격 ID와 충돌하여 지원 의뢰가 누락되는 문제를 발견하고 mercenary namespace로 분리했다. Luna가 비수치 utility scroll에 무의미한 강화 문구만 띄우지 않도록 보호막을 제공했다. 운석 주변 피해도 modifier를 반영한다. 지원 SFX가 존재하지 않는 이름을 사용하던 연결을 실제 기존 attack/guard/magic 자산으로 수정했다. 준비 스크린샷은 이미지 decode 후 촬영하도록 검증을 보강했다.

회귀 browser suites의 일부 시간 초과는 다수 브라우저 동시 실행 중 발생하여 개별 재실행했다. 기존 규칙이나 assertion을 제거하여 해결하지 않았다.

## 22. 밸런스와 후속 조정

MERCENARY-BALANCE-RESULTS.json: Lv4/같은 장비/5seeds × 7동행 선택 × 공격전략/혼합전략 × A/S = 140 실제 CombatSystem 시뮬레이션.

- 무용병 혼합 A: 5/5, 35턴, 최종 HP84. 무용병 공격만 A: 0/5.
- 로웬 혼합 A: 5/5, 30턴. 브람 혼합 A: 5/5, 31턴/HP88. 저렴한 B에도 역할이 있다.
- 세라 공격만 A: 5/5, 20턴/HP17. 같은 전략의 S급 카인/엘리아는 A에서 발동하지 않아 0/5. A급 전문성으로 S가 항상 정답이 아님을 확인했다.
- 루나 혼합 S: 5/5, 17–23턴. 스크롤을 쓰지 않는 A에서는 도움 없음.
- 카인 혼합 S: 5/5, 17–23턴. 엘리아 혼합 S: 5/5, 16–20턴/HP125. 강하지만 높은 고용비와 S 조건을 요구한다.
- 용병 없음에도 S와 방어를 조합하면 클리어 가능. 모든 동료는 PASS/시간 종료만으로 공격하지 않는다.

학생 실플레이 후 세라12HP의 숲 지속전 효율, S급 재고용 비용 부담, 루나 스크롤 보유량에 따른 가치를 추가 조정할 수 있다. 5개 고정 seed의 시뮬레이션이며 유저 최적화/실제 학생 체감에 대한 보장은 아니다. 신규 용병은 Data와 effect adapter를 확장할 수 있지만 친밀도/성장/사망/장비/로테이션/스토리는 이번에 구현하지 않았다.
