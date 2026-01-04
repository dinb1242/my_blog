"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import AuthGuard from "@/components/AuthGuard";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        const post = await response.json();
        router.push(`/posts/${post.id}`);
      } else {
        alert("게시글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">새 게시글 작성</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              placeholder="게시글 제목을 입력하세요"
            />
          </div>

          {/* 에디터와 미리보기 영역 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                내용 (마크다운)
              </label>
              <p className="text-xs text-gray-500">
                왼쪽에 마크다운을 입력하면 오른쪽에서 실시간으로 미리보기를 확인할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 border border-gray-300 rounded-lg overflow-hidden">
              {/* 에디터 영역 */}
              <div className="flex flex-col">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-700">
                    에디터
                  </span>
                </div>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="flex-1 w-full px-4 py-4 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 font-mono text-sm resize-none"
                  placeholder="# 제목&#10;&#10;게시글 내용을 마크다운 형식으로 작성하세요...&#10;&#10;**굵게**, *기울임*, `코드`, [링크](url) 등을 사용할 수 있습니다."
                  style={{ minHeight: "600px" }}
                />
              </div>

              {/* 미리보기 영역 */}
              <div className="flex flex-col border-t border-gray-300 lg:border-t-0 lg:border-l">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-700">
                    미리보기
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4 bg-white prose prose-sm max-w-none markdown-body" style={{ minHeight: "600px" }}>
                  {title && (
                    <h1 className="text-3xl font-bold mb-4 pb-4 border-b border-gray-200">
                      {title}
                    </h1>
                  )}
                  {content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    >
                      {content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-400 italic">
                      마크다운을 입력하면 여기에 미리보기가 표시됩니다.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              마크다운 형식을 지원합니다. 자세한 문법은{" "}
              <a
                href="https://www.markdownguide.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                마크다운 가이드
              </a>
              를 참고하세요.
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "저장 중..." : "작성하기"}
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}

