# 던전탈출 사칙연산 v2.4 — 비주얼 리마스터

## 1. 교체한 이미지 전체 목록

신규 원화 28종을 11개 WebP로 묶었다. 썸네일 4개를 추가하여 배포 파일은 15개, 총 5,115,832 bytes다. 상세 크기와 용량은 ASSETS-v2.4.json, 모든 최종 생성 프롬프트는 ASSET-PROMPTS-v2.4.md에 기록했다.

| 그룹 | 자산 ID / 내용 | 파일 |
|---|---|---|
| 마을 | town · 바람빛 마을 | assets/remaster/town.webp |
| 무기점 | weapon · 대장간 | assets/remaster/weapon.webp |
| 방어구점 | armorShop | assets/remaster/armorShop.webp |
| 장신구점 | accessory | assets/remaster/accessory.webp |
| 모험가 길드 | guild | assets/remaster/guild.webp |
| 용병 길드 | mercenaries | assets/remaster/mercenaries.webp |
| 주인공 | hero | assets/remaster/hero.webp |
| 무기 4종 | old_sword, steel_sword, rogue_dagger, sage_staff | assets/remaster/weapons.webp |
| 갑옷 4종 | leather_armor, iron_armor, guardian_armor, mage_armor | assets/remaster/armor.webp |
| 장신구 4종 | power_ring, life_necklace, guardian_charm, sage_ring | assets/remaster/accessories.webp |
| 스크롤 9종 | fire, ice, iceStorm, shield, heal, lightning, cleanse, meteor, time | assets/remaster/scrolls.webp |

무기/갑옷/장신구는 2×2, 스크롤은 3×3 투명 래스터 아틀라스다. SVG는 사각 뷰포트를 잘라 보여주는 용도로만 사용하며 그림 자체는 생성 원화다. 대응하는 `*-thumb.webp` 네 파일은 목록용이다. 장비 크게 보기와 스크롤 펼침은 원본 해상도를 사용한다.

## 2. 유지한 고품질 기존 이미지

v2.3 로웬·브람·세라·루나·카인·엘리아의 6개 WebP 원본을 유지했다. 기존 지하감옥·숲 환경, 스켈레톤·고블린·오크·거미·골렘과 숲 몬스터 5종도 유지했다. 기존 1인칭 검·방패 동작과 전투 효과의 타이밍을 유지했다.

## 3. Art Bible

ART-BIBLE-v2.4.md를 원화 제작 전에 작성했다. v2.3 용병을 기준으로 painterly fantasy, 애니메이션 영향을 받은 인물, 호박색 조명·남색/청록 그림자, 중세 목재·금속·가죽 재질을 정의했다. 모든 새 프롬프트에 같은 STYLE PREFIX/SUFFIX를 적용했다. 이미지에 한글 UI를 굽지 않고 실제 HTML 텍스트를 사용한다.

## 4. 마을

기존 단순 SVG 마을을 종탑·돌길·성·산·길드 게시판·대장간·보석 가게·여관·숲길이 보이는 황혼 원화로 교체했다. 시설 메뉴에 해당 환경 그림을 연결하고 실제 장신구 상점의 준비 중 표기를 바로잡았다.

## 5. 상점과 길드

무기점·방어구점·장신구점·모험가 길드·용병 길드가 각자의 공간 원화를 사용한다. 어두운 청록 패널, 금속 테두리와 금색 버튼을 공유한다. 이름·효과·가격은 HTML로 읽히고 기존 구매/고용/의뢰 동작을 유지한다.

## 6. 장신구

붉은 보석 은반지, 녹색 생명 목걸이, 방패형 푸른 수호 부적, 보라 수정 현자 반지를 제작했다. 재질·형태·보석이 다른 네 자산을 상점·인벤토리·장착 슬롯·드롭에서 공유한다.

## 7. 스크롤

불꽃·얼음창·얼음폭풍·방패·치유·번개·정화·운석·시계장치 유물로 구분한다. 선택 카드, 가방, 획득 카드, 보유 요약, 펼침 연출은 같은 자산 ID를 사용한다. 이름·효과·사용 횟수와 스크롤 발동 규칙은 그대로다.

## 8. 장비·인벤토리·전리품

기존 12종에 실제 판타지 원화를 연결했다. 목록에 큰 그림과 희귀도 테두리를 표시하고, 크게 보기에서 원본 그림을 불러온다. 캐릭터 화면은 무기·갑옷·장신구 세 슬롯을 그림과 함께 표시한다. 전리품은 획득 유물 카드와 희귀도 표시를 사용한다. 확률·가격·능력치·지급 처리는 변경하지 않았다.

## 9. 던전 카드

고품질 기존 환경을 카드 상단에 명시적인 풍경 그림으로 배치했다. 지하감옥/숲의 몬스터, 권장 레벨, 해금 조건, 클리어 보상과 입장 버튼을 유지했다.

## 10. 플레이어·몬스터

새 주인공은 푸른 망토와 실용적인 강철·가죽 장비를 입은 친근한 모험가다. 생성/이어하기/캐릭터/파티/상태 표시에서 재사용한다. 몬스터와 용병은 기존 고품질 원화를 보존했다.

## 최적화와 검증

신규 경로는 src/AssetManifest.js 한 곳에서 관리한다. 환경은 lazy loading과 async decode를 사용하고 RPG 입장 시 마을·주인공을 preload한다. 아이템은 네 공유 썸네일 아틀라스로 요청을 합치며, 상세 그림은 열 때 로드한다. 이미지 로딩 실패 시 읽을 수 있는 대체 표시를 제공한다.

- 기존 293개를 포함한 단위 테스트 303개 통과.
- 구매/장착/해제/판매, RPG 성장·보상·재접속·저장 거부, CLASS 분리 브라우저 검증 통과.
- 지하감옥 반복 탐험, 퀘스트 보고, 숲 해금, 숲 5전투와 보스, 보상 재접속 검증 통과.
- 용병 6명의 실제 계산 지원, 비용·계약·재접속·퀘스트·전투 동행 검증 통과.
- 신규 시각 검수 25개 캡처와 숲 플레이 캡처를 저장했다. 390×844, 1024×768, 1920×1080에서 가로 넘침 없이 확인했다. 터치로 확대 창을 열고 닫으며 원화와 화면 안쪽 배치를 확인했다.
- 의도적으로 원화 요청을 차단하여 주인공/아이템 대체 표시를 브라우저에서 확인했다.
- Production Build와 dist/index.html에서 화면·원화 로딩을 확인했다.
- 기존 브라우저 검증 전부 통과: browser-ui, presentation, quality, update-v11, encounter, balance, balance-targets, rpg, equipment, adventure, mercenary, mercenary-performance, release.
- 전략 시뮬레이션 280회와 용병/무용병 숲 시뮬레이션 140회를 수행했다. 검증 결과는 REMASTER-REGRESSION-RESULTS.json과 REMASTER-*-RESULTS.json에 보관했다.
- 규칙/데이터 43개 파일을 v2.3과 비교하여 동일함을 확인했다. 용병 6개 원화는 바이트 단위 SHA-256이 같다. 근거는 REMASTER-INVARIANTS.json에 기록했다.
- Edge headless에서 화면 크기와 터치 입력을 검증했다. 용병 기본 속도 연출의 p95 프레임 간격은 4.3~8.3ms였다. 실제 학교 전자칠판·태블릿 하드웨어 측정은 포함하지 않는다.

게임 규칙/밸런스/경제/저장 처리 파일은 v2.3에서 변경하지 않았다. SaveData는 기존 saveVersion=4와 저장 키를 사용한다. CLASS 계산 입력 영역은 기존 읽기 쉬운 양피지 디자인을 유지한다.

## Git

작업 브랜치 update/v2.4. 로컬 완료 커밋과 v2.4 태그로 보관한다. v2.0/v2.1/v2.2/v2.3 태그를 보존하고 원격 push와 공개 배포는 수행하지 않는다.
