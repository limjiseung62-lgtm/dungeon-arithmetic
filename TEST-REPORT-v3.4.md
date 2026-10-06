# v3.4 검증 보고

기준 v3.3 / a87f18da4f98d802ff137282f66ac541efd743a1. 작업 브랜치 update/v3.4. 로컬 검증이며 원격 push·공개 배포는 수행하지 않습니다.

- 단위 검사 **705개 통과**, 실패/취소/건너뛰기 0. 기존 663개 포함, 전투 연출 4개 및 최종전/저장/엔딩/계약 38개를 추가했습니다.
- 전체 브라우저 회귀 **31종 모두 통과**. 기존 29종과 전투 연출 2.0, 최종전 전체 흐름 검사입니다. 변경된 C의 0.1초 준비에 맞춰 품질 검사의 예상 시간만 수정했습니다. 실제 SFX 준비→명중 간격 0.12초, 명중 시각/음향 차이 0을 관찰했습니다.
- 마왕전 실제 Edge UI 완주 **정규 전투 17턴 + 마지막 수식**. 생성된 목표의 수식을 직접 입력해 1/2/3단계, 4단계의 마지막 수식, 오답 재시도, 정답, 엔딩, 마을 복귀와 재전을 완료했습니다.
- Lv11/12/13 × 솔로/용병 6명 × A 중심/S 중심 **42개 전투 모두 클리어·저장 성공**. 17~29개 수식 라운드 (마지막 수식 포함), 종료 HP 117~160. 기본 장비, 준비한 두루마리, 우선 방어·회복 정책을 사용했고 각성 없이 통과했습니다. 모델의 전투 턴 수이며 실제 학생 플레이 시간 측정은 아닙니다.
- 각성한 고용 동료 **6명**과 실제 S 선택으로 두루마리 **9종**을 마왕 3단계에서 검증했습니다. 동료는 현재 고용한 1명만 지원하고 모든 두루마리는 정확히 1회 소모됩니다. 치유/방어/피해의 실제 수치와 저장 성공을 확인했습니다.
- 마지막 수식, 성공 직후, 단계별 전투, BREAK와 엔딩 장면 4의 저장 복원 및 실제 F5를 검증했습니다. 오답으로 HP/아이템이 줄지 않고 같은 보상/클리어/친밀도/엔딩 기록이 중복되지 않습니다.
- 390/768/1920 반응형과 가로 넘침, 최종 수식의 무제한 입력 시간, 배포 빌드의 기본 디버그 숨김을 확인했습니다. 실제 태블릿 하드웨어 검사는 아닙니다.
- 9종의 시각 렌더러와 100회 반복 검사도 별도로 통과했습니다. 일반 공격 테스트에서 Layer 1, Timer 2 이내, 정리 후 0, 게임 상태 불변. Headless Edge 렌더 호출 최대 약 1.8ms. 기존 용병 격리 렌더 및 품질/성능 검사를 통과했습니다.
- v3.3 자산 **113개 보존**. 이미지/오디오 107개는 바이트 동일, 텍스트 6개는 Git 줄바꿈 정규화 후 동일합니다. 수학·타이머·성장·장비·스크롤·퀘스트·기존 성 데이터 등 **20개 핵심 모듈 동일**. 기존 보스 6종, 장비 18종, 퀘스트 30개, 성장·경제·보상 및 기존 친밀도 수치를 보존했습니다.
- 새 WEBP **3개**, 각각 1MB 미만. 마왕/패배 포즈의 실제 투명 알파 확인. 새 오리지널 WAV **4개**, 24kHz/16bit mono, 18초 3개와 20초 엔딩, 클리핑 없음. 종료된 음악/음향 노드를 정리합니다.
- 기존 태그 **17개**의 객체 ID를 TAGS-BASELINE-v3.4.json으로 보존 검사합니다. Production Build의 모든 소스·CSS·자산을 원본과 바이트 비교합니다.

## 증빙

- UNIT-RESULTS-v3.4.txt / FINAL-UNIT-v3.4.txt
- REGRESSION-RESULTS-v3.4.json / RELEASE-CHECK-v3.4.json
- FINAL-BROWSER-v3.4.json / FINAL-EFFECTS-BROWSER-v3.4.json
- FINAL-BALANCE-v3.4.json / FINAL-BALANCE-LOG-v3.4.txt
- FINAL-INVARIANTS-v3.4.json / ASSETS-v3.4.json / TAGS-BASELINE-v3.4.json
- preview-v34-*.png / DESIGN-v3.4.md / ART-PROMPTS-v3.4.md

실행: node --test tests/*.test.mjs, node tests/final-browser.cjs, node tests/final-effects-browser.cjs, node tests/final-balance.mjs, node tests/final-regression-run.cjs, node tests/final-invariants.mjs, node tests/final-asset-audit.cjs, node tests/final-release-check.mjs, node build.mjs.
