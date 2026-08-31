# Elementary Web App UX Audit

감사일: 2026-08-31
대상: `workflow-bottleneck-center` 로컬 Vite 앱
모드: `full`
브라우저 증거: Codex in-app browser, `http://127.0.0.1:5178/`

## 기준선

| 항목 | 관찰값 | 의미 |
|---|---:|---|
| 모바일 viewport | 375×812 | 초등학생이 작은 화면에서 시작하는 조건 |
| document client width | 360px | 브라우저 툴바를 제외한 CSS layout 폭 |
| document scroll width | 360px | 기준선에서 가로 overflow 없음 |
| document scroll height | 3,511px | 첫 행동까지 세로 탐색량이 큼 |
| `조건 확인` CTA y | 1,196.06px | 첫 viewport 밖에서 긴 요약을 지나야 함 |
| h1 수 | 1 | heading 계약 양호 |
| active `gi-pulse` 수 | 1 | 필수 행동 강조 계약 양호 |
| selected scenario card 높이 | 약 87px | `선택됨`이 별도 grid item이라 비선택 약 61px보다 큼 |
| 초기 네트워크 | same-origin HTML/JS/CSS | 외부 서비스 호출 없음 |

관계 오류 상태에서는 `role="alert"`가 오류 요약으로 포커스를 받고, 누락·순환 관계를 설명했습니다. 안전·품질 판정, 저장 기본 해제, 가상 시간 경계는 기준선에서 유지되었습니다.

## 초등학생 과업 패널

가상 사용자 `서윤`(초등학교 5학년, 작업 순서 게임 경험은 있으나 선행 관계 용어는 처음)을 기준으로 첫 5분 과업을 점검했습니다.

1. 미션 제목과 “기다림을 줄이는 순서”를 읽습니다.
2. 지금 해야 할 `조건 확인`을 찾아 관계 화면으로 갑니다.
3. 필수 관계 힌트를 읽고 두 작업을 연결합니다.
4. 두 번째 관계를 이어서 연결합니다.
5. 잘못 연결했을 때 오류 안내를 읽고 고칩니다.

기준선에서 1→2는 긴 overview·조건 요약 때문에 늦고, 3→4는 첫 관계를 추가한 뒤 select 값이 남아 다음 선택의 disabled 상태를 만들 수 있습니다. 5의 오류 문장과 포커스는 이해 가능한 수준이어서 도메인 메시지는 변경하지 않습니다.

## 우선순위 원장

### EDU-UX-001 — P1, 첫 행동 지연

- 학습자 영향: 무엇을 눌러야 하는지 몰라 설명을 모두 읽거나 화면을 여러 번 스크롤합니다.
- 관찰 경로: 초기 미션 → `조건 확인`, 375×812.
- 원인: overview와 조건 요약이 핵심 CTA보다 먼저 DOM에 있습니다.
- 개선: 미션 문장 직후 다음 행동 안내와 CTA를 둡니다.
- 검증: CTA `y < 900`, overview heading보다 DOM 선행, pulse 1개.

### EDU-UX-002 — P2, 관계 반복 입력 중단

- 학습자 영향: 첫 연결 뒤 이전 두 값이 남아 다음 관계의 한쪽 옵션이 비활성화되어 “왜 고를 수 없지?”라는 혼란이 생깁니다.
- 관찰 경로: 관계 화면에서 첫 관계 추가 후 반대 순서로 두 번째 관계 선택.
- 원인: `RelationEditor`가 `beforeTaskId`, `afterTaskId`를 제출 후 초기화하지 않습니다.
- 개선: 유효한 추가 후 두 값을 비우고 첫 select로 포커스를 돌립니다.
- 검증: 어느 select부터 고른 두 번째 관계도 연결되고 두 값은 빈 값입니다.

### EDU-UX-003 — P2, 선택 카드 행 높이 불일치

- 학습자 영향: 선택한 카드만 더 커져 목록의 리듬이 흔들리고 선택 상태가 별도 줄처럼 읽힙니다.
- 관찰 경로: 초기 375px 시나리오 네 카드.
- 원인: 선택 상태 span이 meta small 바깥의 별도 grid 자식입니다.
- 개선: meta 문장 안에서 `· 선택됨`을 출력합니다.
- 검증: 카드 높이 차이 16px 이하, `aria-current="page"`, accessible name `선택됨`.

### EDU-UX-004 — P2, 상단 문장 중복·길이

- 학습자 영향: eyebrow와 h1이 같은 서비스명을 반복하고 저장 안내가 학습 질문과 경쟁합니다.
- 개선: eyebrow를 `이번 미션 · …`, 저장 안내를 두 짧은 문장으로 줄입니다.
- 검증: 기존 “학생 이름이나 온라인 계정은 사용하지 않습니다.” 의미와 테스트 문자열 유지.

### EDU-UX-005 — P2, 입력 안내와 문자 판정 불일치

- 학습자 영향: “10자 이상”이라고 쓴 입력에 숫자나 영문을 섞으면 저장할 수 없습니다.
- 원인: 한글 음절만 세는 `koreanSyllableCount`.
- 개선: trim 후 공백을 제외한 code point 수를 셉니다.
- 검증: 10자 혼합 입력 활성화, 공백만 입력 비활성화, 제출 콜백 유지.

## 보존·비범위 확인

- 네 시나리오와 일곱 단계는 변경하지 않습니다.
- `validateRelationMap`, `simulateSchedule`, `evaluateSchedule`, `analyzeBottlenecks`, reducer, local storage schema는 변경하지 않습니다.
- 실제 학생·교사 인터뷰, VoiceOver, 배포 공개 URL 검증은 이 감사에서 실행하지 않았습니다.
- 기존 결정적 시뮬레이션은 학습 목표에 필요한 기능으로 보존하며 새 이미지·2D/3D 장면은 추가하지 않습니다.

## 구현 후 동일 경로 재검증

2026-08-31에 같은 로컬 과학 전시판 시작 경로를 다시 열어 확인했습니다.

| 항목 | 결과 |
|---|---|
| 375px title/lang | `작업 순서 병목 해결소` / `ko` |
| 375px overflow | client 360px, scroll 360px |
| 375px `조건 확인` 위치 | document `y=899.28px` (목표 900px 미만) |
| 시나리오 카드 높이 | 네 카드 모두 61.45px |
| active pulse | 1개 |
| 첫 관계 추가 뒤 입력 | 두 select 빈 값, `before-task` 포커스, 관계 1개 |
| 잘못된 관계 확인 | `role="alert"`에 포커스, 순환·누락 안내 표시 |
| 데스크톱 overflow | client 1265px, scroll 1265px |
| 자동 품질 | `npm run verify`: 19개 파일/193개 테스트, 파일 최대 499줄, build 통과 |
| E2E | Playwright Chromium 실행 파일 부재로 45개 중 39개 환경 오류; full pass 아님 |

## 구현 상태

- EDU-UX-001: `fixed` — 브리핑에서 CTA를 미션 문장 직후로 옮기고 모바일 여백을 조정했습니다.
- EDU-UX-002: `fixed` — 관계 추가 후 입력 초기화·첫 select 포커스를 추가했으며 목록 heading 포커스 회귀를 방지했습니다.
- EDU-UX-003: `fixed` — 선택 상태를 meta 문장 안에 배치했습니다.
- EDU-UX-004: `fixed` — eyebrow와 로컬 저장 안내를 짧게 정리했습니다.
- EDU-UX-005: `fixed` — 공백 제외 문자 수와 “10자 이상” 안내를 일치시켰습니다.

실제 초등학생·교사 사용성 패널, VoiceOver, Playwright full E2E는 실행하지 않았습니다. 따라서 구현 품질은 자동 테스트와 in-app browser 증거까지 확인되었고, 릴리스 수용은 `blocked` 상태입니다.
