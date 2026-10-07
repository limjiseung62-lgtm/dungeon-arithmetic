# 던전탈출 사칙연산 v3.5.2 품질 패치

기준: 공개 v3.5.1 / main `c33b43b7fb2282e5e78c2e200727f89b68e64e4d`. 기존 체크아웃은 clean이었다. 기존 v3.5.1 태그를 이동하지 않고 `update/v3.5.2-quality`에서 후속 패치를 만들었다. 이전 20개 태그, v3.5 저장 스키마 5, 모든 전투 계산과 기존 콘텐츠를 보존한다.

## 공개판 감사와 원인

수정 전에 Windows Edge로 실제 HTTPS 공개판을 플레이했다. 360×800, 390×844, 412×915 시작/Scroll/Collection 이동/일반 전투/보스/저장/새로고침, 1920×1080 CLASS 네 패드 입력과 강화 선택, 390px Story 기록/Guild 퀘스트/Collection/Inventory/Mercenary/무기·방어구·장신구 상점 8개 페이지를 확인했다.

Run Buff 제목과 안내는 `rgb(244,234,211)`이 `rgb(243,238,225)` 위에 표시됐다. opacity는 1이었다. `remaster-v2.4.css`가 전역 `--ink`를 밝은색으로 바꿨고 기본 크림 `.modal`, 시작/스토리 카드와 금색 primary 버튼이 같은 변수를 계속 사용했다. dark art 테마를 `--ink-art`로 분리해 어두운 패널의 기존 외관을 보존하면서 크림 영역의 원래 어두운 `--ink`를 복구했다. 보조 안내색, 밝은 입력 패널 도움말, disabled 텍스트도 별도 대비를 확보했다. Story level modal은 기존 밝은 글자를 유지하고 배경을 명시적인 짙은색으로 맞췄다.

Run Buff 제목 대비 **11.92:1**, 본문·상단·15초 안내 **6.57:1**. 네 viewport에서 계산했다. 공용 cream/dark modal, 보상/전리품 disabled 카드, Story, Tutorial, Legendary CSS fixture의 표본도 4.5:1 이상이다. 실제 RPG 보스 처치 → 전설 획득 → 보상/전리품 화면도 캡처했다. 이는 모든 이미지 픽셀이나 전체 UI 요소에 대한 전수 접근성 인증은 아니다.

부모 작업은 사용자 Android 원본 `1000021584(1).jpg`를 직접 픽셀 검수했고 같은 현상을 확인했다. 이 작업의 Windows 원본 전송은 공식 Library helper에서 새 전송을 포함해 두 번 HTTP 403으로 실패했다. 직접 확인한 공개판 before 캡처와 원본 검수 사실을 구분한다.

## 카드·이동·목표 숫자

기존 v3.5.1의 모바일 CLASS → RPG 한 열, 이미지/희귀도/이름/효과/횟수 분리, 긴 비전투 화면의 마을/맨 위 버튼, safe-area 여백, 전투/모달에서 빠른 이동 숨김을 보존하고 세 모바일 크기에서 재검증했다. Scroll/Reward modal의 95vw가 overlay 안쪽 폭을 넘는 문제를 원래 규칙의 `width:100%`로 고쳤다. Reward의 기존 폭 `!important`도 제거했다. 제목은 단어 단위로 줄바꿈한다. 새 `!important`를 추가하지 않았다.

몬스터 크기와 숫자 크기는 유지했다. 기존 faceSafeZones/targetAnchors의 실제 DOM 충돌 검사를 일반 몬스터와 Golem/Tree Guardian/Fire Giant/Dark Knight/Chaos Mage/Dragon Guardian/Demon King, 다중 Royal Guard 전투까지 다시 통과했다. 얼굴/눈/골렘 핵을 피하고 갑옷·무기·몸 옆의 여백에 숫자를 둔다.

## 몬스터 공격

v3.5.1의 10개 아키타입 SLASH/STAB/HEAVY/MAGIC/FIRE/RANGED/BITE/CLAW/CHARGE/SHIELD_BASH와 34종 매핑, 크기/재질/특수기 및 반복 2 variants를 보존했다. 이번 패치에서 새 전투 엔진이나 능력을 만들지 않았다.

실제 2턴씩 검사한 14종: Skeleton, Goblin, Orc Shaman, Magma Guard, Dark Archer, Royal Guard, Shadow Wolf, Golem, Tree Guardian, Fire Giant, Dark Knight, Chaos Mage, Dragon Guardian, Demon King. 고블린 접근/단검, 스켈레톤 검격, 궁수 화살, 수호병 방패, 늑대 물기, 골렘/거인 팔 내려치기, 마법진/투사체, 용 발톱/물기를 구분했다. 게임의 오크는 실제 데이터가 주술사이므로 MAGIC 정체성을 유지했다. 큰 내려치기의 예고는 기본 550ms, 보스는 약 649ms로 빠른 고블린 예고 160ms와 다르다. 재질/종류별 SFX cue 경로도 실행했다.

별도 특수기 시간 훔치기/용 브레스/마왕의 검을 검사했다. 모든 적 공격의 판정 commit은 1회, 종료 뒤 소유 DOM/WAAPI는 0이다. 소리 설정을 켠 브라우저 실행과 cue 데이터 확인이며 물리 스피커 청취 평가를 주장하지 않는다.

## CLASS 학생별 공격

매 공격은 학생 Focus → 등급 → 예비 동작 → 무기/마법 궤적 → 접촉 → Hit Stop → 피격 → 피해 숫자 → 회복으로 진행한다. Focus 동안 관련 없는 HUD를 낮추고 `1P · C 공격 · 검격`처럼 학생/등급/무기를 표시한다. 4종 SWORD/STAFF/DAGGER/GREATSWORD의 원화·궤적·연타 차이는 유지한다. 접촉 시 기존 판정을 한 번 실행하고 Impact/SFX/카메라 충격/피격 명암을 맞춘다. 보스 이동량은 기존 질량 기준을 유지한다.

| 등급 | Focus | Hit Stop | 피해 읽기 단계 | 회복 | 실제 측정 Focus / Stop / 읽기 |
|---|---:|---:|---:|---:|---|
| C | 300ms | 50ms | 300ms | 130ms | 303 / 52 / 301ms |
| B | 300ms | 80ms | 320ms | 140ms | 302 / 82 / 321ms |
| A | 320ms | 110ms | 340ms | 150ms | 324 / 113 / 341ms |
| S | 350ms | 160ms | 360ms | 170ms | 351 / 163 / 364ms |

피해 숫자는 접촉부터 보이고 표의 읽기 단계 뒤 회복에서 사라진다. C→B→A→S의 네 공격/준비/결과 설계 합계 6.57초, 실제 측정은 약 6.69초다. S·S·A·S presentation fixture는 약 7.67초 설계이며 실제 일반 전투의 S 목표 독점 규칙을 우회하지 않았다. 네 S 이론값은 7.915초다. 마지막에는 450ms 그룹 총 피해만 표시하고 합체 거대 빔은 없다. 전역 애니메이션 배속은 변경하지 않았다.

실전 네 공격, 고등급 혼합, 1명 미완료, Attack 3명+Defense S, 다중 S presentation fixture를 통과했다. 실제 타임스탬프의 Focus/Stop/읽기 최소 시간도 별도 검증했다.

## Defense Focus와 중단

공유 방어막 계산은 그대로이며 실제 방어 기여 학생을 표시한다. 일반 적 공격 전 300ms 학생 Focus, 방패 → 접촉 → 정지 → 실제 흡수/남은 HP 피해를 보여준다. 방어 S 특수 차단은 `2P · S 방어` → 기존 특수기/방벽 충돌 → 160ms 정지 → `2P · 방어 성공!`이다. 일반 피해가 일부 남으면 성공으로 과장하지 않고 잔여 피해를 표시한다.

Focus/Contact/Damage 중 기존 UI의 설정→시작 화면으로 취소하고, 연출 DOM/학생 표시/타이머가 남지 않으며 reload 뒤 시작 화면으로 복귀함을 검사했다. 특수 연출 취소도 기존 cancel과 함께 소유 표시를 정리한다.

## 회귀 결과

- 변경 전 851/851 PASS. 최종 **859 PASS / 0 FAIL / 0 SKIP**: 기존 851 유지 + 신규 8.
- 원래 803 기준 테스트를 삭제/약화하지 않았다. v3.5.1의 production cache version 예상값 1곳만 새 버전 3.5.2로 변경했다. 기존 timing compatibility 함수/검사도 보존했다.
- 마왕 전투 **42개 결과 전체가 v3.5.1과 deepEqual**: HP/턴/phase/지역/저장 검증 동일.
- Production build 및 debug 차단 PASS. 최종 static site smoke: 3 mobile, boss, CLASS4, save/reload, asset hash, 404 0, fatal console 0.
- Save schema 5 유지. 기존 v3.5 fixture의 character/progress/run 전체 deepEqual 및 3회 save/load: Level/Gold/Equipment/Legendary/Pity/Mercenary/Affinity/Party/Quest/Collection/Story/Ending 보존.
- 원본 아트·저장/성장/공격/방어/보너스/대상 점유/보스 계산 변경 없음. Cafe/Voca/공통 문제은행/AssetBank/블로그 변경 없음.

브라우저는 Windows Edge headless의 viewport 재현이다. 물리 Android 및 실제 전자칠판 체감 검증은 사용자 재시험으로 남긴다. 일부 예고/충돌 순간은 짧아서 screencast 또는 단계 관찰 후 실제 screenshot을 사용했다. 제품 화면을 합성해 성공 근거로 만들지 않았다. 대비용 컴포넌트 fixture는 보고서에 별도로 표시했다.

## 증거와 배포

검증 JSON: `QUALITY-MOBILE/ENEMY/COOP/DEFENSE/MULTI-S/INTERRUPT/SURFACES/TIMING/PRODUCTION-v352.json` 및 `qa-v352-review/FINAL-BALANCE-v352.json`.

대표 실제 캡처는 `qa-v352-review/`, 전체 141개 로컬 원본은 `qa-v352/`에 보존한다. 원본 전체는 재생성 가능한 검수 산출물이므로 Git에서 제외하고 대표 컷만 보관한다. Run Buff component fixture 캡처는 파일명 `run-buff-*`, 실제 공개판 통과 후 캡처/commit/Actions/asset fingerprint는 외부 `outputs/v352-release/DEPLOYMENT.json`에 별도 기록한다.

배포는 기존 GitHub Pages Actions와 같은 공개 주소 https://limjiseung62-lgtm.github.io/dungeon-arithmetic/ 를 사용한다. 배포 성공과 실제 HTTPS 재검증 전에는 완료로 간주하지 않는다. 새 블로그 게시물은 만들지 않는다.
