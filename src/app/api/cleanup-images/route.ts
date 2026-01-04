import { NextRequest, NextResponse } from "next/server";
import { cleanupUnusedImages } from "@/lib/cleanup-images";
import { isIpAllowed } from "@/lib/allowed-ips";

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  } else if (realIp) {
    return realIp.trim();
  } else if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  } else if (request.ip) {
    return request.ip;
  }

  return null;
}

/**
 * 사용되지 않는 이미지 파일을 정리하는 API
 * 허용된 IP에서만 접근 가능
 */
export async function POST(request: NextRequest) {
  try {
    // IP 기반 권한 체크
    const clientIp = getClientIp(request);
    if (!isIpAllowed(clientIp)) {
      return NextResponse.json(
        { error: "이미지 정리 권한이 없습니다." },
        { status: 403 }
      );
    }

    const result = await cleanupUnusedImages();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error cleaning up images:", error);
    return NextResponse.json(
      {
        success: false,
        error: "이미지 정리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

