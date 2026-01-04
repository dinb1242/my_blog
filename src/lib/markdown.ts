/**
 * 마크다운 텍스트에서 마크다운 문법을 제거하고 순수 텍스트만 추출
 */
export function stripMarkdown(markdown: string): string {
  let text = markdown;

  // 코드 블록 제거 (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // 인라인 코드 제거 (`...`)
  text = text.replace(/`[^`]*`/g, '');

  // 헤더 제거 (# ## ### 등)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 굵게, 기울임 제거 (**text**, *text*, __text__, _text_)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // 취소선 제거 (~~text~~)
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // 링크 제거 ([text](url) -> text)
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // 이미지 제거 (![alt](url))
  text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

  // 리스트 마커 제거 (-, *, +, 1.)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // 인용구 마커 제거 (>)
  text = text.replace(/^>\s+/gm, '');

  // 수평선 제거 (---, ***)
  text = text.replace(/^[-*]{3,}$/gm, '');

  // HTML 태그 제거
  text = text.replace(/<[^>]+>/g, '');

  // 여러 개의 공백을 하나로
  text = text.replace(/\s+/g, ' ');

  // 앞뒤 공백 제거
  text = text.trim();

  return text;
}

