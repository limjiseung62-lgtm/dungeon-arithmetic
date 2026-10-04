# 던전탈출 사칙연산 — Art Bible v2.4

## 기준과 변경 범위

v2.3 용병 6명의 고품질 painterly/anime-influenced fantasy RPG 일러스트를 기준으로 삼는다. 어린이가 돌아오고 싶은 모험 세계. 기존 293 tests와 수학/전투/성장/SaveData/경제는 동결한다. 변경은 자산·표시 HTML·CSS·연출 이미지 연결에 한정한다.

## STYLE PREFIX — 모든 신규 이미지의 공통 시작

High-quality stylized fantasy RPG game art, anime-influenced character design but painterly, cinematic fantasy lighting, warm amber highlights and rich indigo-teal shadows, detailed readable medieval materials, cohesive premium game asset, same visual universe as polished v2.3 Rowen Bram Sera Luna Kain Elia companion illustrations.

## STYLE SUFFIX — 모든 신규 이미지의 공통 끝

 Suitable for elementary-school students, adventurous rather than frightening, original design, no gore, no sexualization, no photorealism, no childish cartoon, no flat clip art or generic stock mobile icons, no letters or numbers, no Korean text, no logos, no watermark. All labels will be HTML UI.

## 미술 규칙

- 팔레트: 청록/남색 그림자, 황혼의 따뜻한 황금빛. 붉은 불/푸른 서리/보라 마력은 역할별 강조색.
- 환경: 붓 질감, 풍부한 목재·석재·천막·중세 금속, 영화적 빛. 너무 어둡게 만들지 않으며 화면에 텍스트를 합성하지 않는다.
- 허브: 성/산/숲 뒤편의 석조 광장, 여관과 길드, 대장간과 보석 상점, 등불, 퀘스트 보드, 소수 NPC 실루엣. 전체 세계의 귀환 장소.
- 아이템: 실루엣이 먼저 읽히는 실제 물건. 낡은 철, 정제된 강철, 가죽, 판금, 룬, 보석을 재질로 구분. 희귀도는 실용→세공→룬/보석→특별한 마력. 과도한 가챠/별빛 폭발 금지.
- 스크롤: 같은 양피지 계열/봉인 재질, 서로 다른 룬의 모양과 주변 마법 요소. 인벤토리·선택·펼침에서 같은 자산 ID 사용.
- 주인공: 파란 망토와 실용적인 강철/가죽 갑옷, 친근하고 자신감 있는 청년 모험가. 완전한 의복, 안정적인 얼굴과 손, 투명 전신.
- UI: 어두운 목재/가죽 패널, 절제된 금속·금빛 테두리, 밝은 양피지 글자. 숫자와 가격은 단색 고대비 영역에 표시. 장식으로 클릭 영역을 가리지 않는다.

## 규격·관리

환경 16:9 landscape WebP, 시설 동일 landscape 카드 crop. 장비/장신구/스크롤 1:1 셀의 투명 고해상도 atlas를 사용하여 세트별 통일과 다운로드 공유를 보장한다. 주인공 portrait 투명 WebP. 원본은 생성 폴더에 보존하고 배포용만 축소/인코딩한다.

주요 자산은 AssetManifest/기존 AssetManager를 통해 관리한다. Atlas 셀은 raster 원본을 SVG viewport로 표시하는 방식으로 개별 아이템처럼 보여준다. SVG는 프레임/클리핑 컨테이너이며 아이템 자체는 생성 일러스트다.

우선순위: 마을 → 시설/상점 → 장신구 → 스크롤 → 무기/갑옷 → 전리품/인벤토리 → 던전 카드 → 주인공 → 기존 몬스터 검수. 이미 좋은 용병/몬스터/던전 환경은 재생성하지 않는다.
