# 던전탈출 사칙연산 v3.5.1 검증 보고서

## 버전과 Git

기준 공개 main c28cd99, v3.5 tag c219af7. 작업 branch update/v3.5.1-quality. 검증 완료 후 로컬 commit과 v3.5.1 tag를 만들고 main에 fast-forward 반영한다. 기존 v3.5와 이전18개 tag는 이동하지 않는다. 배포 후 정확한 commit/Actions/공개 검증 결과는 outputs/v351-release/DEPLOYMENT.json에 기록한다. 공개 URL은 https://limjiseung62-lgtm.github.io/dungeon-arithmetic/ 을 유지한다. 새 블로그 글은 발행하지 않는다.

## 사용자 문제별 판단

| 문제 | 결과 | 해결 |
|---|---|---|
| 모바일 첫 화면 깨짐 | PASS | 1열 미디어 규칙의 선택자 우선순위를 데스크톱 규칙과 맞추고 폭·글줄·CTA를 정리 |
| 두루마리 화면 겹침 | PASS | 이미지와 텍스트를 정상 흐름으로 분리, 사용 불가와 다음 이동 조건 안내 |
| 아래에서 마을 이동 어려움 | PASS | 긴 비전투 RPG 화면에서 마을/맨 위 빠른 이동, safe-area와 하단 여백 |
| 숫자가 얼굴을 가림 | PASS | 몬스터별 targetAnchors와 faceSafeZones, 실제 Badge 크기/컨테이너 좌표 보정, 숫자 위치 애니메이션 제거 |
| 몬스터 공격이 동일함 | PASS | 10개 아키타입·종족/크기/재질 modifier·반복 variant, 기존 특수기 별도 유지 |
| 네 공격이 빠르고 번잡함 | PASS | 개별 준비→접촉→멈춤→피격→피해→회복, 합체 에너지 연출 제거 |
| 타격감 부족 | PASS | 접촉에서 실제 판정/SFX/Impact, 멈춤 뒤 피격, 피해 숫자를 접촉부터 유지 |

실제 Android 파일은 이 Windows PC에서 접근되지 않는다. 사용자 최종 지시에 따라 재업로드를 요구하지 않고 알려진 실제 문제와 브라우저 viewport 재현으로 검증했다. 물리 Android/전자칠판 체감이 검증됐다는 뜻은 아니다.

## 모바일

360×800,390×844,412×915에서 시작 화면의 실제 Computed Style 한 열, 터치 진입, 가로 overflow 없음, 두루마리 원화/희귀도/이름/설명/횟수 분리, 긴 Story/Quest/Collection/Inventory/Guild/Shop 경로의 아래→맨 위→아래→마을을 확인했다. 카드가 짧은 화면에서는 bar를 띄우지 않는다. 전투와 필수 오프닝에는 마을 quick exit를 표시하지 않고 기존 UI 이동 함수를 사용한다. 모달이 있으면 quick bar를 숨긴다. 하단 safe-area와 추가 공간을 둔다. 큰 전자칠판의4패드 배치는 변경하지 않았다.

CSS 원인은 .start-v35 .start-worlds 데스크톱 선택자가 더 강했던 것이다. 모바일 media에서도 같은 scope를 사용해 cascade로 해결했다. 일괄 !important 추가로 시작 화면을 덮지 않았다. 기존 absolute 두루마리 그림에는 한정된 normal-flow 보정만 사용했다.

## 목표 배치

기존 MonsterPresentationData의 크기·crop·물리 타격점은 유지한다. 별도의 targetAnchors와 얼굴/골렘 핵 safe zone을 추가하고, Frame renderer가 실제 영역을 투영해 네 숫자를 배치한다. 다중 적은 공유된 네 공격 목표와 현재 대상 표시만 사용한다. 실제 DOM 중심과 좌표계 차이를 보정한다. 숫자 크기를 줄이지 않고 위치를 안정화했다.

Skeleton,Goblin,Golem,Tree Guardian,Fire Giant,Dark Knight,Chaos Mage,Dragon Guardian,Demon King 외 다중 Royal Guard 전투까지 실화면/사각형 충돌을 검사했다. 2·3마리 전투의 실제 registry 구성을 사용했다.

## 몬스터 공격

아키타입: SLASH,STAB,HEAVY,MAGIC,FIRE,RANGED,BITE,CLAW,CHARGE,SHIELD_BASH. 실제34종 데이터에 대응하며 새로운 몬스터/능력/전투 규칙은 없다. 오크는 실제 데이터의 ‘오크 주술사’ 정체성을 유지해 MAGIC으로 분류했다. 중량형은 광부/수호병/골렘/거인으로 검증했다.

빠른 고블린의 접근과 칼, 스켈레톤의 좌/아래 검격, 궁수 화살, 기사 금속 검격과 수호병 방패 충돌, 무거운 팔 crop/내려치기, 마법진의 집중/카메라 투사체, 늑대 송곳니, 용 발톱/물기를 구별했다. 기존 브레스/왕의 검과 단계/BREAK/약점 로직은 유지했다. 시간 훔치기는 별도로 카메라 접근과 실제 Timer의 절단 효과를 표시한다. CLASS 연출 중 Timer를 정지하고 기존 값에서 감소한 시간으로 재개한다. 일반 공격은 원래 resolveNext를 접촉에서 정확히 한 번 호출한다.

실제 검증: skeleton, goblin, orc, magmaGuard, darkArcher, royalGuard, shadowWolf, golem, treeGuardian, flameGiant, darkKnight, chaosMage, dragonGuardian, demonKing, goblin steal, dragonGuardian doomBreath, demonKing kingSword. 반복2턴의 variant와 단일 commit/노드/WAAPI 정리를 확인했다. 실제 원화와 기존 VFX/WAV를 재사용했으며 새 외부 자산은 없다. metadata와 held 이미지의 추가 대기는 캡처 전용이다. 실제 리듬 검사는 멈추지 않은 브라우저에서 별도로 기록했다.

## CLASS 리듬

| 등급 | 기본 공격 합계 | Hit Stop | 피해 표시 | 회복 |
|---|---:|---:|---:|---:|
| C | 775ms | 40ms | 150ms | 170ms |
| B | 900ms | 60ms | 160ms | 180ms |
| A | 1160ms | 90ms | 190ms | 210ms |
| S | 1490~1535ms | 140ms | 230ms | 240ms |

피해 숫자는 접촉부터 보여 Reaction/표시/회복 동안 유지한다. 전체 animation을 일정 배율로 느리게 늘이지 않았다. S cut-in은 대표 한 번45ms 정도로 압축했다. 다음 공격 전 모든 소유 VFX와 WAAPI를 정리한다. S BGM ducking은 대표 S 한 번만 사용한다. boss는 작은 밀림, 작은 적은 더 큰 피격으로 무게를 달리한다.

C→B→A→S 네 공격의 실제 시작~마지막 회복 진입: 4240ms. 회복과 준비/결과를 포함한 기본 합계는 약5.5~5.8초. v3.5의 400/500/650/700~950ms 압축안보다 접촉과 여운을 분리했다. 공격이 하나로 합쳐지는 VFX는 없다. 마지막에는 총 실제 피해와 기존 팀 보너스만 짧게 표시한다.

실전 C/B/A/S, 합법 고등급 혼합,3명 성공+미완료1명,Attack3명+Defense S를 확인했다. 같은 S 공격 목표는 여전히 먼저 점유한1명만 사용한다. S·S·A·S는 별도의 읽기 전용 Presentation fixture로 확인해 claim 규칙을 깨지 않았다. 공격/방어/Bonus/HP/Timer/Run Buff/Boss scaling/Resolution 계산은 바꾸지 않았다. 실제20턴4인 Run도 HP135로 클리어,7회 특수 차단,보상선택,시간 훔치기,새로고침 안전 복귀를 확인했다.

## 테스트·성능·배포

전체 **851 PASS /0 FAIL /0 SKIP**, 기존803 유지+신규48. 기존 assertion을 삭제/약화하지 않았다. 전투 비교42 PASS: qa-v351/regression/FINAL-BALANCE-v351.json. Production Build PASS, debug 쿼리도 차단. 기존 v3.5 코드로 만든 저장의 Level/Gold/장비/전설/천장/동료/각성/파티/Quest/도감/이야기/엔딩/진행중 Run을 정확히 보존했고3회 저장/불러오기했다. saveVersion5 유지.

CPU4×/1024×768에서 기본/간단히 각3턴. 실제 반복 기본은 약9940ms,간단히는 약7188ms. 모든 턴 잔여Node0/WAAPI0. 실제 기기 FPS 보장값이 아니다. 원화121개와 기존 생성 자산은 교체하지 않았다.

배포용 모든 CSS/JS 파일명에는 콘텐츠 지문을 붙이고 transitive JS import까지 연결했다. 실제 파일 존재, module entry, Production debug 차단을 새 검사로 확인한다. 기존 GitHub Pages workflow를 유지한다. 사용자에게 강제 캐시 삭제를 기본 해결책으로 요구하지 않는다. 배포 후 동일 공개 URL에서 위 세 모바일 크기, 두루마리/빠른 이동/전투/보스/4인 협동/저장/새로고침/404/Console을 다시 확인한다.

검증 JSON: QUALITY-MOBILE-v351,QUALITY-ENEMY-v351,QUALITY-COOP-v351,QUALITY-MULTI-S-v351,QUALITY-CLASS-RUN-v351,QUALITY-PERFORMANCE-v351,QUALITY-PRODUCTION-v351. 공개 결과는 QUALITY-PUBLIC-v351 및 외부 release 보고서에 기록한다.

## 사용자 확인5점

첫 화면 한 열 → S 후 두루마리 선택 → 긴 페이지 아래 마을/맨 위 → 일반/보스의 공격 차이 → 숫자가 얼굴을 가리는지. CLASS 최종 체감은 실제 전자칠판에서 확인할 수 있다. 새 던전/스토리/성장/직업/장비 등급을 추가하지 않았고 새 블로그 글은 발행하지 않는다.
