# 스마틱스 UI 도우미

호스트 프로젝트를 수정하지 않고 로컬 웹 애플리케이션에 `agent-ui-annotation`을 주입하는 내부 전용 독립 도구입니다.

## 요구사항

- Node.js 20 이상
- 북마클릿 실행이 가능한 브라우저

## 사용 방법

```bash
cd ..\agent-ui-sidecar
npm install
npm run dev
```

실행 후 다음 순서로 사용합니다.

1. `http://127.0.0.1:4174`를 엽니다.
2. 북마클릿을 복사합니다.
3. 주석을 남기고 싶은 로컬 웹 페이지를 엽니다.
4. 북마클릿을 실행해 annotation 툴바를 주입합니다.

## 참고

- 이 도구는 로컬 개발 환경 전용입니다.
- 호스트 프로젝트에는 `npm`이나 코드 수정이 필요하지 않습니다.
- 주입된 툴바는 annotation context에 `route`, `url`, `title`, `timestamp`를 추가합니다.
- CSP가 강한 페이지는 외부 module script 주입을 차단할 수 있어 툴바가 로드되지 않을 수 있습니다.

## 제작

- made in hajune
