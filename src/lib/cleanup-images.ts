import { prisma } from "@/lib/prisma";
import { readdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * 게시글 내용에서 이미지 URL을 추출합니다.
 */
function extractImageUrls(content: string): string[] {
  const imageUrls: string[] = [];
  
  // 마크다운 이미지 형식: ![alt](url)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^\)]+)\)/g;
  let match;
  while ((match = markdownImageRegex.exec(content)) !== null) {
    const url = match[2];
    imageUrls.push(url);
  }
  
  // HTML img 태그 형식: <img src="url" />
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    const url = match[1];
    imageUrls.push(url);
  }
  
  return imageUrls;
}

/**
 * URL에서 파일명을 추출합니다.
 * 예: /uploads/1234567890-image.jpg -> 1234567890-image.jpg
 */
function getFilenameFromUrl(url: string): string | null {
  try {
    // 상대 경로 처리
    if (url.startsWith("/uploads/")) {
      return url.replace("/uploads/", "");
    }
    // 전체 URL 처리
    if (url.includes("/uploads/")) {
      const parts = url.split("/uploads/");
      if (parts.length > 1) {
        return parts[1].split("?")[0]; // 쿼리 스트링 제거
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 사용되지 않는 이미지 파일을 정리합니다.
 * @returns 삭제된 파일 수와 삭제된 파일 목록
 */
export async function cleanupUnusedImages(): Promise<{
  deletedCount: number;
  deletedFiles: string[];
  error?: string;
}> {
  try {
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // 업로드 디렉토리가 없으면 빈 결과 반환
    if (!existsSync(uploadDir)) {
      return {
        deletedCount: 0,
        deletedFiles: [],
      };
    }

    // 모든 게시글 가져오기
    const posts = await prisma.post.findMany({
      select: {
        content: true,
      },
    });

    // 사용 중인 이미지 URL 추출
    const usedImageUrls = new Set<string>();
    posts.forEach((post) => {
      const imageUrls = extractImageUrls(post.content);
      imageUrls.forEach((url) => {
        const filename = getFilenameFromUrl(url);
        if (filename) {
          usedImageUrls.add(filename);
        }
      });
    });

    // 업로드 디렉토리의 모든 파일 가져오기
    const files = await readdir(uploadDir);
    
    // 사용되지 않는 파일 필터링 (.gitkeep 제외)
    const unusedFiles = files.filter(
      (file) => file !== ".gitkeep" && !usedImageUrls.has(file)
    );

    // 사용되지 않는 파일 삭제
    const deletedFiles: string[] = [];
    for (const file of unusedFiles) {
      try {
        const filePath = join(uploadDir, file);
        await unlink(filePath);
        deletedFiles.push(file);
      } catch (error) {
        console.error(`파일 삭제 실패: ${file}`, error);
      }
    }

    return {
      deletedCount: deletedFiles.length,
      deletedFiles,
    };
  } catch (error) {
    console.error("이미지 정리 중 오류 발생:", error);
    return {
      deletedCount: 0,
      deletedFiles: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

