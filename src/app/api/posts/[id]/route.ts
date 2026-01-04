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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(params.id) },
    });

    if (!post) {
      return NextResponse.json(
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "게시글을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // IP 기반 권한 체크
    const clientIp = getClientIp(request);
    if (!isIpAllowed(clientIp)) {
      return NextResponse.json(
        { error: "게시글 수정 권한이 없습니다." },
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

    const post = await prisma.post.update({
      where: { id: Number(params.id) },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "게시글 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // IP 기반 권한 체크
    const clientIp = getClientIp(request);
    if (!isIpAllowed(clientIp)) {
      return NextResponse.json(
        { error: "게시글 삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "게시글이 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "게시글 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}

