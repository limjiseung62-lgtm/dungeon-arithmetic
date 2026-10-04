# v2.2 아트 제작 기록

내장 image_gen 도구로 생성했습니다. 새 몬스터는 기존 그림과 같이 회화적인 판타지 일러스트를 사용하며 공포·유혈·텍스트·UI를 배제했습니다. 제작 원본은 Codex generated_images에 보존하고, 실제 프로젝트는 아래 WebP를 사용합니다. Sharp로 WebP 인코딩(quality 85, alphaQuality 100)만 적용했으며 원본 크기와 알파를 유지했습니다.

| 프로젝트 경로 | 용도 |
|---|---|
| assets/forest-v22.webp | 거대한 나무·안개·유적·빛나는 버섯의 숲 배경 |
| assets/vineSlime-v22.webp | 덩굴 슬라임 |
| assets/shadowWolf-v22.webp | 그림자 늑대 |
| assets/mushroomSpirit-v22.webp | 독버섯 정령 |
| assets/forestSpirit-v22.webp | 타락한 숲의 정령 |
| assets/treeGuardian-v22.webp | 고대 나무수호자 |

최종 프롬프트 묶음:

숲 배경:

> Use case: stylized-concept. Asset type: fantasy RPG forest battle background, wide landscape. Primary request: mysterious enchanted forest for an elementary-school arithmetic RPG, enormous ancient trees and old stone ruins, luminous blue and violet mushrooms, cool mist and soft magical lights. Hand-painted storybook fantasy illustration with rich painterly texture and gentle dramatic lighting. Clear center ground for enemy sprites, no characters, no UI, no letters. Beautiful adventurous atmosphere, no horror, gore or frightening faces.

몬스터 공통 프롬프트에서 Subject는 아래 5문구로 각각 생성:

> Use case: stylized-concept. Asset type: single fantasy RPG enemy sprite illustration. Subject: [아래 각 캐릭터 문구]. Style: hand-painted storybook fantasy game illustration, rich painterly details, warm gold highlights against cool magical greens and blues, polished cohesive character design for children aged 8-12. Full body centered with generous margin, front three-quarter battle view, clearly readable silhouette. Transparent background. No scenery, text, UI, watermark, blood, gore or horror.

- vineSlime: a friendly but formidable translucent emerald slime wrapped in curling vines and leaves
- shadowWolf: a majestic dark blue wolf with glowing violet magical markings, agile standing pose
- mushroomSpirit: an animated mushroom forest spirit with a luminous violet cap, small leafy arms and floating turquoise spores
- forestSpirit: an elegant floating forest sprite with leafy robes and luminous blue violet magic, mysterious but not scary
- treeGuardian: a powerful ancient tree guardian, broad trunk body, branch arms, moss, glowing blue eyes and a bright turquoise heart

늑대와 정령은 내장 도구로 배경 추출을 한 번 더 진행했습니다:

> Use case: background-extraction. Remove the entire dark, blurry gradient backdrop and make it genuinely transparent. Keep the exact fantasy character, its pose, colors, painted detail and magical glows intact. Full character cutout with transparent surroundings; no new scenery or text.

알파 검사에서 늑대의 55.5%, 숲 정령의 51.7%, 보스의 44.4% 픽셀이 알파 128 미만이며 모서리는 알파 0입니다. 6개 WebP 합계는 약 2.72MB입니다. 별도 거대 애니메이션이나 신규 오디오 파일을 추가하지 않았습니다.
