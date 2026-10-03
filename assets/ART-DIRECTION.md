# 원본 판타지 아트 제작 기록

이번 수정에는 **imagegen 스킬의 built-in image_gen 도구**를 사용했습니다. 외부 게임 이미지나 상용 캐릭터를 사용하지 않았습니다. 생성한 원본은 그대로 복사했고, 투명 알파를 보존했습니다. 재질·조명·팔레트는 동일한 스타일 지시로 통일했습니다.

## 파일

- dungeon-v2.png: 1인칭 전투용 깊은 던전 배경.
- skeleton-v2.png: 청동/강철 갑옷과 검·방패를 가진 스켈레톤 병사.
- goblin-v2.png: 자주색 후드, 단검, 시계를 가진 고블린 도적.
- orc-v2.png: 자주색 의례 복장과 수정 지팡이를 가진 오크 주술사.
- spider-v2.png: 청록/청동 룬과 호박색 눈을 가진 거대거미.
- golem-v2.png: 이끼 낀 돌·청동·빛나는 청록 핵을 가진 골렘.

AssetManager.js의 AssetPaths가 교체 지점입니다. 화면 앞 장비는 equipment(), 전투 효과는 VisualEffects.js와 combat-v2.css에 분리되어 있습니다.

## 실제 생성 프롬프트

아래 각 자산 프롬프트 끝에 공통 스타일 문장을 붙여 각각 한 번 생성했습니다. 몬스터 5종은 transparent_background=true, 던전은 false로 요청했습니다.

공통 스타일:

> Original high-quality painterly fantasy RPG game illustration, refined stylized animation concept art, detailed materials, emerald teal shadows and warm amber torch lighting, dramatic readable silhouettes, suitable for elementary school children, no horror, no gore, no franchise likeness, no text or watermark.

던전:

> Wide landscape 16:9 first-person dungeon battle BACKGROUND, no creatures or people. Deep vaulted ruined stone crypt corridor with massive carved pillars, layered archways receding to a luminous turquoise sealed door far back, warm braziers left and right, cool volumetric rays and floating motes, worn floor with perspective, battle staging open central floor. Camera eye height looking toward enemy position.

스켈레톤:

> Isolated full-body skeleton soldier enemy facing viewer in three-quarter front combat stance, ornate weathered bronze and dark steel armor, battered shield and longsword, amber glowing eye sockets, friendly adventurous menace without horror. Entire body, weapons and feet inside image, centered, slight low camera angle, transparent background, no scene or ground plane.

고블린:

> Isolated full-body green goblin rogue enemy facing viewer, expressive pointed ears, stitched plum leather hood and layered thief armor, brass pocket watch and curved dagger, agile dynamic three-quarter front combat stance. Entire body and weapons inside image, centered slight low camera angle, transparent background, no scene or ground plane.

오크:

> Isolated full-body sage green orc shaman enemy facing viewer, elaborate purple and bronze ritual robes, braided ornaments and tusks, staff topped with glowing violet crystal, dramatic three-quarter front combat stance. Entire body staff and feet inside image, centered slight low camera angle, transparent background, no scene or ground plane.

거미:

> Isolated full-body giant fantasy spider enemy facing viewer, eight elegant articulated legs, detailed blue-black chitin with emerald and bronze rune accents, glowing amber eyes, stylized readable adventurous rather than frightening, three-quarter front battle stance. Entire creature including legs inside image with generous margin, centered slight low camera angle, transparent background, no scene or ground plane.

골렘:

> Isolated full-body massive stone guardian golem enemy facing viewer, heavy interlocking ancient carved stone armor, moss and antique bronze bands, glowing emerald rune core in chest and eyes, floating stone joints, heroic monumental three-quarter front battle stance. Entire body and feet inside image, centered slight low camera angle, transparent background, no scene or ground plane.
