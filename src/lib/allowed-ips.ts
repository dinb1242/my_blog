/**
 * 게시글 작성이 허용된 IP 주소 목록
 */
export const ALLOWED_IPS = [
    '121.157.203.98',
    '::1'
    // 필요한 경우 여기에 추가 IP 주소를 입력하세요
];

/**
 * IP 주소가 허용 목록에 있는지 확인
 */
export function isIpAllowed(ip: string | null | undefined): boolean {
    if (!ip) return false;
    return ALLOWED_IPS.includes(ip);
}

