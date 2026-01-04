import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isIpAllowed } from "@/lib/allowed-ips";

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  } else if (realIp) {
    return realIp.trim();
  } else if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  } else if (request.ip) {
    return request.ip;
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // IP 기반 권한 체크
    const clientIp = getClientIp(request);
    if (!isIpAllowed(clientIp)) {
      return NextResponse.json(
        { error: "게시글 작성 권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "제목과 내용은 필수입니다." },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "게시글 작성에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "게시글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

