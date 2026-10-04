# v2.3 용병 아트

제작 방식: built-in image_gen. 상업 게임 이미지나 외부 캐릭터를 복사하지 않은 새 캐릭터 6개. 각 전신 원본 하나를 길드 카드에서 CSS crop, 상세/파티/전투에서는 contain으로 재사용한다. 원본 PNG는 생성 도구의 기본 폴더에 보존한다.

프로젝트 최종 경로:

| ID | 최종 파일 | 용도 |
|---|---|---|
| rowen | assets/mercenaries/rowen.webp | 녹색/갈색 궁수 |
| bram | assets/mercenaries/bram.webp | 중년 중갑 기사/큰 방패 |
| sera | assets/mercenaries/sera.webp | 흰색/금색 성직자/치유 |
| luna | assets/mercenaries/luna.webp | 남색/보라 마법사 |
| kain | assets/mercenaries/kain.webp | 검정/붉은 검성 |
| elia | assets/mercenaries/elia.webp | 흰색/금색/푸른 마력 대현자 |

최종 크기: 667×1000px. 투명 alpha 유지. 6종 합계 1,303,990 bytes(약 1.30MB). [MERCENARY-ASSET-CHECKS.json](MERCENARY-ASSET-CHECKS.json)에 실제 크기/용량/alpha 검증을 기록했다. Sharp는 높이 1000px 축소와 WebP quality88 인코딩에만 사용했다. 얼굴/신체/배경을 프로그램으로 수정하지 않았다. 카드 lazy loading, 전투는 고용한 캐릭터 한 명만 eager loading, 이미지 비율은 object-fit으로 유지한다.

정확한 6개 생성 프롬프트와 원본 PNG 경로는 [MERCENARY-ASSETS-v2.3.json](MERCENARY-ASSETS-v2.3.json)에 기록했다. 코드 연결 위치는 src/MercenaryData.js의 portraitAsset/battleAsset이며, UI는 src/MercenaryPresentation.js에서 사용한다. 교체 시 이 두 필드만 바꾸면 된다.

직접 검수: 여섯 원본의 얼굴/손/신체/장비, 통일된 판타지 화풍, 카드/상세/전투 화면을 확인했다. 고어·선정적 노출·로고·텍스트 없는 초등학생용 캐릭터. 등급은 프레임과 B/A/S 텍스트로 구분한다.
