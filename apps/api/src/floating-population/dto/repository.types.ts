/**
 * Repository 내부에서 사용하는 타입 정의
 */

/**
 * 시간대별 인구 데이터 JSON 형태
 */
export interface RawTimeSlotJson extends Record<string, unknown> {
  ts: string; // time_slot
  ap: number; // avg_pop
  sp: number; // sum_pop
}

/**
 * Raw SQL 쿼리 결과 타입
 */
export interface RawQueryResult {
  id: string; // cell_id
  geom: string; // geometry
  slots: RawTimeSlotJson[]; // time_slots
}

/**
 * MZ 랭킹 쿼리 결과 타입
 */
export interface MZRankingRow {
  code: string;
  name: string;
  mz_pop: number | bigint;
  total_pop: number | bigint;
  mz_ratio: number;
  change_type: string | null;
}

/**
 * 성별 랭킹 쿼리 결과 타입
 */
export interface GenderRankingRow {
  code: string;
  name: string;
  gender_pop: number | bigint;
  total_pop: number | bigint;
  gender_ratio: number;
  change_type: string | null;
}

/**
 * 1시간 단위 인구 데이터 JSON 형태
 */
export interface RawHourlyJson extends Record<string, unknown> {
  hour: number; // 0~23
  ap: number; // avg_pop
  sp: number; // sum_pop
}

/**
 * 1시간 단위 Raw SQL 쿼리 결과 타입
 */
export interface RawHourlyQueryResult {
  id: string; // cell_id
  geom: string; // geometry
  hours: RawHourlyJson[]; // hourly_data
}
