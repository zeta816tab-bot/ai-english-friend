/**
 * AI 영어 친구 - 서버 (Google Apps Script)
 * 역할: 진짜 OpenAI API 키는 여기에만 두고, 아이 기기에는 60초짜리 임시 키만 줍니다.
 * 뼈대 문서 부록 A-1 기준으로 만들었어요. 모델 이름과 목소리는 공식 문서에서 다시 확인하세요.
 *
 * [설정 방법]
 * 1. script.google.com 에서 새 프로젝트를 만들고 이 파일 내용을 붙여 넣어요.
 * 2. 왼쪽 톱니바퀴(프로젝트 설정) > 스크립트 속성에 아래 값을 추가해요.
 *    - OPENAI_API_KEY : OpenAI 프로젝트 API 키 (필수, 절대 공유하지 마세요)
 *    - FAMILY_CODE    : 가족만 아는 코드 (필수)
 *    - PERSONA        : 인격 지시문 (뼈대 2장, 영어 권장, 10~15줄) (필수)
 *    - MODEL          : 실시간 음성 모델 이름 (선택, 기본값은 아래 DEFAULT_MODEL)
 *    - VOICE          : 목소리 이름 (선택, 기본값은 아래 DEFAULT_VOICE)
 *    - FAMILY_ID      : 사용자 식별용 아무 글자 (선택, 이름·이메일은 넣지 마세요)
 * 3. 편집기 상단에서 testMint 를 한 번 실행해 권한을 승인해요. 로그에 OK 가 나와야 해요.
 * 4. 배포 > 새 배포 > 유형 "웹 앱", 실행 "나", 액세스 "모든 사용자" 로 배포해요.
 *    나온 웹 앱 주소를 웹 페이지(index.html)의 CONFIG.EXEC_URL 에 넣어요.
 * 5. 코드를 고칠 때마다 "새 배포"를 해야 바뀐 내용이 반영돼요.
 */

// 기본 설정값 (스크립트 속성에 없을 때 쓰는 값). 공식 문서에서 최신 이름을 확인하세요.
const DEFAULT_MODEL = 'gpt-realtime-2.1-mini';   // 뼈대 부록 A 기준 mini 모델 (확인 필요)
const DEFAULT_VOICE = 'alloy';                   // 목소리 (확인 필요)
const MAX_CONNECTS_PER_DAY = 20;                 // 하루 연결 횟수 상한 (뼈대 기본값)

// 웹 페이지가 POST 요청을 보내면 여기서 처리해요
function doPost(e) {
  try {
    const p = PropertiesService.getScriptProperties();
    const req = JSON.parse((e.postData && e.postData.contents) || '{}');

    // 가족 코드가 맞는지 확인 (코드가 틀리면 아무 키도 주지 않아요)
    if (!req.code || req.code !== p.getProperty('FAMILY_CODE')) {
      return out_({ error: 'NO_ACCESS' });
    }

    // 하루 연결 횟수 상한 (서울 기준 날짜로 세요)
    const day = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd');
    const n = Number(p.getProperty('COUNT_' + day) || 0);
    if (n >= MAX_CONNECTS_PER_DAY) return out_({ error: 'DAILY_LIMIT' });
    p.setProperty('COUNT_' + day, String(n + 1));

    return out_(mintSecret_(p));
  } catch (err) {
    console.error(err);
    return out_({ error: 'SERVER_ERROR' });
  }
}

// 편집기에서 직접 실행하는 시험 함수. 키 값은 로그에 남기지 않아요.
function testMint() {
  const r = mintSecret_(PropertiesService.getScriptProperties());
  console.log(r.error ? ('실패: ' + r.error) : ('OK, expires_at=' + r.expires_at));
}

// JSON 응답을 만드는 작은 도우미
function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// OpenAI에 60초짜리 임시 키를 요청하고, 세션 설정(인격·목소리·턴 방식)을 함께 넣어요
function mintSecret_(p) {
  const model = p.getProperty('MODEL') || DEFAULT_MODEL;
  const voice = p.getProperty('VOICE') || DEFAULT_VOICE;

  const session = {
    type: 'realtime',
    model: model,
    instructions: p.getProperty('PERSONA') || '',
    output_modalities: ['audio'],
    audio: {
      input: {
        // 아이 말 감지는 하되, 대답은 앱이 직접 요청해요 (턴제)
        turn_detection: { type: 'semantic_vad', eagerness: 'medium',
                          create_response: false, interrupt_response: false }
      },
      output: { voice: voice, speed: 0.8 }   // 아이용으로 조금 천천히
    },
    tools: [], tool_choice: 'none', tracing: null
  };

  // 사용자 식별값은 해시해서 보내요 (이름·이메일 원문 금지)
  const idText = p.getProperty('FAMILY_ID') || 'family';
  const safetyId = Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idText));

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,          // 오류도 받아서 우리가 처리해요
    headers: {
      Authorization: 'Bearer ' + p.getProperty('OPENAI_API_KEY'),
      'OpenAI-Safety-Identifier': safetyId
    },
    payload: JSON.stringify({ expires_after: { anchor: 'created_at', seconds: 60 }, session: session })
  });

  const code = res.getResponseCode();
  if (code >= 300) {
    // 자세한 오류 내용은 로그에만 남기고, 아이 기기에는 짧은 코드만 보내요
    console.error(code, res.getContentText().slice(0, 300));
    return { error: 'OPENAI_' + code };
  }
  const b = JSON.parse(res.getContentText());
  return { value: b.value, expires_at: b.expires_at };
}
