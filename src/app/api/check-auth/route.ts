import { NextRequest, NextResponse } from 'next/server';
import { isIpAllowed } from '@/lib/allowed-ips';

/**
 * 클라이언트의 IP를 확인하고 권한이 있는지 체크하는 API
 */
export async function GET(request: NextRequest) {
  try {
    // 다양한 헤더에서 IP 확인
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    let clientIp: string | null = null;
    
    // 우선순위: Cloudflare > X-Real-IP > X-Forwarded-For
    if (cfConnectingIp) {
      clientIp = cfConnectingIp.trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    } else if (forwardedFor) {
      // X-Forwarded-For는 여러 IP가 있을 수 있음 (프록시 체인)
      clientIp = forwardedFor.split(',')[0].trim();
    }
    
    // 로컬 개발 환경을 위해 request.ip도 확인
    if (!clientIp && request.ip) {
      clientIp = request.ip;
    }
    
    const allowed = isIpAllowed(clientIp);
    
    return NextResponse.json({
      allowed,
      ip: clientIp,
    });
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json(
      { allowed: false, ip: null },
      { status: 500 }
    );
  }
}

