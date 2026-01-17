// valkey.ts
// Windows 환경에서는 valkey-glide 네이티브 모듈이 지원되지 않음
const IS_WINDOWS = process.platform === 'win32';

// 타입만 가져오고, 실제 모듈은 조건부 로드
type GlideClient = import('@valkey/valkey-glide').GlideClient;
type GlideFt = typeof import('@valkey/valkey-glide').GlideFt;

const INDEX = 'sc_idx';
const DOC_PREFIX = 'sc:doc:';

// ====== 싱글톤 클라이언트 ======
let _client: GlideClient | null = null;
let _GlideFt: GlideFt | null = null;

async function loadValkeyModule() {
  if (IS_WINDOWS) return null;
  const mod = await import('@valkey/valkey-glide');
  _GlideFt = mod.GlideFt;
  return mod;
}

async function getValkeyClient(): Promise<GlideClient | null> {
  if (IS_WINDOWS) {
    console.warn('[Valkey] Skipped: Windows is not supported by valkey-glide');
    return null;
  }
  if (_client) return _client;

  const mod = await loadValkeyModule();
  if (!mod) return null;

  const host = process.env.VALKEY_HOST ?? '127.0.0.1';
  const port = Number(process.env.VALKEY_PORT ?? 6379);

  // 필요하면 TLS/인증 옵션을 여기서 추가
  _client = await mod.GlideClient.createClient({
    addresses: [{ host, port }],
  });

  return _client;
}

// ====== 인덱스 1회 생성 ======
let _indexReady = false;

async function ensureSemanticCacheIndex(client: GlideClient | null) {
  if (_indexReady || !client || !_GlideFt) return;

  // 이미 존재하면 create가 에러날 수 있어서 먼저 체크
  const indexes = await _GlideFt.list(client);
  if (indexes.includes(INDEX)) {
    _indexReady = true;
    return;
  }

  // HASH 문서: sc:doc:*  안의 vec 필드를 벡터로 인덱싱
  // COSINE 거리 기반
  await _GlideFt.create(
    client,
    INDEX,
    [
      {
        type: 'VECTOR',
        name: 'vec', // HASH field
        alias: 'VEC', // @VEC 로 검색
        attributes: {
          algorithm: 'HNSW',
          type: 'FLOAT32',
          dimensions: 1536,
          distanceMetric: 'COSINE',
          // 튜닝은 나중에. 일단 동작용 최소.
        },
      },
    ],
    {
      dataType: 'HASH',
      prefixes: [DOC_PREFIX], // sc:doc: 로 시작하는 키만 인덱싱
    },
  );

  _indexReady = true;
}

// ====== 앱 시작 시 1번만 호출 ======
export async function initValkeySemanticCache(): Promise<GlideClient | null> {
  if (IS_WINDOWS) {
    console.warn('[Valkey] Semantic cache disabled on Windows');
    return null;
  }
  const c = await getValkeyClient();
  await ensureSemanticCacheIndex(c);
  return c;
}
