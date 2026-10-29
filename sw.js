// AI 영어 친구 서비스 워커
// 역할: 설치 조건(PWA)만 맞추고, 모든 요청은 네트워크로 그대로 보내요.
// 일부러 캐시하지 않아요: 대화 연결과 서버 호출은 항상 최신 상태여야 하기 때문이에요.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* 응답을 가로채지 않아요 (네트워크 그대로) */ });
