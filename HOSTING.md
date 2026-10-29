# 웹 페이지 호스팅 (GitHub Pages, 무료)

마이크는 **https 주소**에서만 켜져요. 아래 방법으로 `index.html`을 https 주소에 올리세요.

## 0. 올리기 전에 꼭 확인
- **이 폴더(`web`)의 파일만 올리세요.** 아래 파일은 절대 올리지 마세요: `Code.gs`(서버 코드), 서명 키(`.jks`), `keystore.properties`, OpenAI 키.
- 무료 GitHub 계정은 **공개(Public) 저장소**에서만 Pages가 동작해요. 그래서 `index.html`은 누구나 볼 수 있어요. 그래도 index.html에는 비밀이 없어요. 가족 코드는 기기에서 입력하고, API 키는 Apps Script에만 있어요.
- 사내 네트워크에서 github.com이 막혀 있다면 개인 네트워크에서 작업하세요.

## 1. GitHub 계정 만들기
1. github.com 에서 Sign up 을 눌러요. 이메일 인증을 마쳐요.

## 2. 저장소(Repository) 만들기
1. 오른쪽 위 `+` > **New repository** 를 눌러요.
2. Repository name: `ai-english-friend` (아무 이름이나 괜찮아요).
3. **Public** 을 선택해요.
4. "Add a README file" 은 체크하지 않아요.
5. **Create repository** 를 눌러요.

## 3. 파일 올리기
1. 생성된 화면에서 **uploading an existing file** 링크를 눌러요 (또는 **Add file > Upload files**).
2. 탐색기에서 `AI_Eng\app\web` 안의 아래 5개 파일을 끌어다 놓아요.
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
   - (`HOSTING.md`는 올려도 되고 안 올려도 돼요)
3. 아래 **Commit changes** 버튼을 눌러요.

## 4. Pages 켜기
1. 저장소 위쪽 **Settings** 탭을 눌러요.
2. 왼쪽 메뉴의 **Pages** 를 눌러요.
3. Build and deployment > Source: **Deploy from a branch** 를 고르세요.
4. Branch: **main**, 폴더: **/ (root)** 을 고르고 **Save** 를 눌러요.
5. 1~3분 기다리면 상단에 주소가 나와요. 형태는 아래와 같아요.

```
https://<내 GitHub 아이디>.github.io/ai-english-friend/index.html
```

## 5. 확인하기
1. PC 크롬에서 위 주소를 열어요. 주소창에 자물쇠가 보이면 https가 맞아요.
2. 가족 코드 입력 칸이 뜨면 정상이에요. (서버 주소는 아직 안 넣었으니 "서버 주소를 설정해 주세요"라고 나오는 게 맞아요.)
3. 이 주소를 기록해 두세요. 다음 단계에서 쓰여요.
   - **Android 앱**: `MainActivity.kt`의 `APP_URL`에 넣어요.
   - **PWABuilder**: 주소를 그대로 입력해요.
   - **서버 주소(`CONFIG.EXEC_URL`)는 별개예요.** Apps Script 웹 앱 주소를 넣어요.

## 6. 파일을 고쳤을 때
GitHub 저장소에서 파일을 열고 연필 아이콘(Edit)으로 고친 뒤 Commit 하면 1~2분 뒤 반영돼요. 또는 같은 방법으로 파일을 다시 올리면 돼요. 앱에서는 바로 반영되지만, 이미 설치한 홈 화면 앱은 한 번 닫았다가 다시 열어야 바뀐 내용이 보여요.

## 대안 (GitHub 접속이 막혔을 때)
- **Netlify Drop** (app.netlify.com/drop): `web` 폴더를 브라우저에 끌어다 놓으면 https 주소가 바로 생겨요. 계정이 필요하고, 정책이 바뀔 수 있으니 공식 안내를 먼저 확인하세요.
- **Cloudflare Pages**: 계정을 만든 뒤 파일을 직접 업로드하는 방식이에요.
- 두 방법 모두 https 주소만 나오면 Android 앱이나 PWABuilder에 똑같이 쓸 수 있어요.
