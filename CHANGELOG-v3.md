# 2차 연출 개선 변경 사항

기존 프로젝트의 수학·전투 판정 파일은 그대로 유지하고, 연출과 소리의 관리 계층을 추가했습니다.

- AudioManager: 던전/전투/골렘/승리/게임오버 음악, UI·전투·마법 효과음, BGM/SFX/VOICE 채널, 페이드와 음량 설정.
- MonsterData: 화자·문장·지속 시간·음성 자산·이벤트를 가진 대사 데이터.
- SequencePlayer / DialogueSystem: 자동 진행, 터치로 다음, SKIP, 취소 처리.
- MonsterSpecialSequence: 고블린 시간 절단, 오크 저주, 거미줄/독니, 골렘 재조립/석화와 공통 방어 S 차단 흐름.
- TimerSystem: 입력 중 연출을 위해 pause/resume과 잔여 밀리초 보존.
- BattleDirector: 검격 준비/충돌, 스크롤 펼침/충전/발사/폭발, 특수기 시점과 실제 효과를 연결.
- presentation-v3.css: 말풍선, HUD 축소, 몬스터 클로즈업, 투사체·파편·방어막·시간 절단 효과.
- 브라우저 테스트와 검증 문서 확장.

실행: START.cmd → http://127.0.0.1:4173/. 기존 실행 화면에서는 새로고침하세요.
현재 음원은 자체 Web Audio 합성 placeholder입니다. 음성 더빙은 없습니다.
