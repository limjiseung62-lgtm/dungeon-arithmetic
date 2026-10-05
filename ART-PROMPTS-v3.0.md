# v3.0 신규 아트 · 생성 기록

내장 image_gen 도구로 생성했다. CLI/API 키 경로를 사용하지 않았다. v2.4 Art Bible과 기존 카인 원화를 검수 기준으로 삼았다. 배포용은 WebP로 인코딩하여 `assets/fortress-v30/`에 저장했고, 생성 원본은 Codex 생성 폴더에 보존했다. 기존 75개 자산은 변경하지 않았다.

## 캐릭터 공통 프롬프트

High-quality stylized fantasy RPG game art, anime-influenced character design but painterly, cinematic fantasy lighting, warm amber highlights rich indigo-teal shadows, premium medieval materials. Full body transparent isolated portrait battle sprite, entire weapon and feet in frame. Black steel navy grey crimson accents. Elementary-school adventurous, no gore, no sexualization, no photorealism, no childish cartoon, no clip art, no text, logos or watermark.

각 프롬프트 끝에 아래 Subject를 붙였다. 투명 배경을 요청하고 알파 채널을 보존했다.

| 최종 파일 | Subject |
|---|---|
| assets/fortress-v30/demonSoldier.webp | demon army humanoid armored soldier, practical sword and large iron shield, closed dark helmet crimson crest |
| assets/fortress-v30/darkArcher.webp | dark army archer, hooded armored figure drawing elegant black bow with violet arrow, lean silhouette |
| assets/fortress-v30/demonCommander.webp | demon army armored commanding officer, red military cape ornate helmet, command baton and sword, powerful upright posture |
| assets/fortress-v30/darkPriest.webp | dark priest, fully robed navy and violet, face obscured under hood, staff and hovering dark blessing rune, elegant magical silhouette |

## 어둠의 기사

최종: `assets/fortress-v30/darkKnight.webp` / 투명 배경.

High-quality stylized fantasy RPG game art, anime-influenced character design but painterly, cinematic fantasy lighting, warm amber highlights and rich indigo-teal shadows, detailed readable medieval materials, cohesive premium game asset. Full body isolated transparent character, frontal three-quarter battle pose, entire weapon and feet within frame. Black steel navy grey crimson accents. Suitable for elementary-school students, adventurous rather than frightening, original design, no gore, no sexualization, no photorealism, no childish cartoon, no flat clip art, no letters or numbers, no logos, no watermark. Subject: imposing humanoid Dark Knight commander boss with massive dark plate armor, huge long two-handed greatsword, deep red glowing eyes under closed helmet, layered black cloak and demon army crest. Heavy elegant silhouette, clearly a swordsman, no golem. Portrait game sprite.

## 성채 배경

최종: `assets/fortress-v30/fortress.webp` / 불투명 16:9.

Landscape 16:9 wide fantasy RPG battle environment inside the Black Fortress: long readable spacious stone hall with black iron gate, crimson army banners with original angular crest, torchlight, armor fragments, armory alcoves, distant watchtowers visible under stormy sky, central clear ground for sprites. Black deep blue grey with red accents, cinematic painterly anime-influenced premium medieval materials, warm amber light, rich indigo teal shadows. Adventurous for elementary students, not horror, no people, no letters, no numbers, no text, no logos or watermark.

## 흑기사의 대검

최종: `assets/fortress-v30/dark_greatsword.webp` / 투명 배경.

High-quality stylized fantasy RPG painterly anime-influenced premium item art. Single Black Knight greatsword, long dark steel blade, elegant crimson gemstone on iron crossguard, subtly purple runic glow, physically readable heavy sword diagonal framed fully including pommel and tip. Isolated square transparent game inventory icon, warm amber edge light, indigo teal shadows, no text, no numbers, no logos, no watermark, no background.

## 마왕의 왕좌와 세 군단장

최종: `assets/fortress-v30/throne.webp` / 불투명 16:9.

High-quality stylized fantasy RPG game art, anime-influenced but painterly, cinematic fantasy lighting, warm amber highlights rich indigo shadows, premium medieval materials, original adventurous illustration appropriate for elementary-school students, no gore. Wide 16:9 interior of demon king castle throne room, distant commanding humanoid demon king silhouette seated on massive dark stone throne with long dark cape and subtle violet eyes, illuminated crimson hanging banners, foreground three imposing shadow silhouettes facing us: greatsword armored knight, robed chaos magician surrounded by violet magic circle, majestic dragon guardian with broad wings and long neck. King highest and centered far background, three commanders separate readable silhouettes across foreground with space between. Black navy grey crimson violet palette, no text no letters no numbers no logos no watermark.

## 음악

`assets/audio/knight-boss-suite.wav`는 프로젝트 자체 생성 음원이다. `tools/generate-knight-audio.cjs`로 재생성할 수 있다. 24초, 모노 PCM 22,050Hz. 기존 BGM/SFX/VOICE 분리와 음량 설정을 사용하며 최후의 결투에서는 기존 boss-final 믹스를 유지한다.

## 무릎 꿇은 기사 · 포즈 편집

최종: `assets/fortress-v30/knightDown.webp`. 원본 `darkKnight.webp`를 view_image로 검수한 뒤 내장 image_gen 편집 도구에 참조했다. 원래 갑옷·검·망토·화풍을 유지하고 한쪽 무릎을 꿇어 검을 지지대로 삼는 자세로 변경했다. 투명 배경, 부상·피·텍스트 없음. 전투용 원본은 보존했다.

프롬프트: Edit target: the provided Dark Knight game character illustration. Preserve exactly the same black armor, helmet red eyes, crimson undercloak, dark greatsword, painterly anime fantasy RPG style, silhouette identity and detailed materials. Change only pose to defeated but dignified one-knee kneeling: right knee rests on ground, left foot planted with bent leg, head lowered slightly, both armored hands resting on pommel of greatsword with its tip touching ground as support. Entire body, sword and cloak fully in frame, transparent background, centered game cutscene sprite. Appropriate for elementary-school adventure, no injuries, no blood, no text, logos or watermark.
