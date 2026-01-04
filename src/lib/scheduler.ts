import cron from "node-cron";
import { cleanupUnusedImages } from "./cleanup-images";

let cleanupJob: cron.ScheduledTask | null = null;

/**
 * 이미지 정리 스케줄러를 시작합니다.
 * 매일 새벽 3시에 실행됩니다.
 */
export function startImageCleanupScheduler() {
  // 이미 실행 중이면 중지
  if (cleanupJob) {
    cleanupJob.stop();
  }

  // 매일 새벽 3시에 실행 (cron: 0 3 * * *)
  // 개발 모드에서는 5분마다 테스트할 수 있도록 환경 변수로 제어 가능
  const schedule = process.env.IMAGE_CLEANUP_SCHEDULE || "0 3 * * *";

  cleanupJob = cron.schedule(
    schedule,
    async () => {
      console.log(`[${new Date().toISOString()}] 이미지 정리 작업 시작...`);
      const result = await cleanupUnusedImages();
      
      if (result.error) {
        console.error("이미지 정리 중 오류:", result.error);
      } else {
        console.log(
          `[${new Date().toISOString()}] 이미지 정리 완료: ${result.deletedCount}개 파일 삭제`
        );
        if (result.deletedFiles.length > 0) {
          console.log("삭제된 파일:", result.deletedFiles.join(", "));
        }
      }
    },
    {
      scheduled: false, // 시작하지 않음 (수동으로 start 호출 필요)
      timezone: "Asia/Seoul",
    }
  );

  // 프로덕션 모드에서만 자동 시작
  // 개발 모드에서는 API를 통해 수동 실행 가능
  if (process.env.NODE_ENV === "production") {
    cleanupJob.start();
    console.log(`이미지 정리 스케줄러가 시작되었습니다. (스케줄: ${schedule})`);
  } else {
    console.log(
      `이미지 정리 스케줄러가 준비되었습니다. (스케줄: ${schedule})`
    );
    console.log("개발 모드에서는 API 엔드포인트(/api/cleanup-images)를 통해 수동 실행할 수 있습니다.");
  }
}

/**
 * 이미지 정리 스케줄러를 중지합니다.
 */
export function stopImageCleanupScheduler() {
  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    console.log("이미지 정리 스케줄러가 중지되었습니다.");
  }
}

