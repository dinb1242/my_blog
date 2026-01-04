import { startImageCleanupScheduler } from "./scheduler";

/**
 * 서버 초기화 시 실행되는 함수
 */
export function initializeServer() {
  // 이미지 정리 스케줄러 시작
  startImageCleanupScheduler();
}

