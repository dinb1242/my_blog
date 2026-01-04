"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import ImageUploadButton from "@/components/ImageUploadButton";

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const postId = Number(params.id);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isDraft, setIsDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cursorPosition, setCursorPosition] = useState(0);
    const formRef = useRef<HTMLFormElement>(null);

    const handleImageInsert = (markdown: string) => {
        const textarea = document.getElementById("content") as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent =
                content.substring(0, start) + markdown + content.substring(end);
            setContent(newContent);

            // 커서 위치 조정
            setTimeout(() => {
                const newPosition = start + markdown.length;
                textarea.setSelectionRange(newPosition, newPosition);
                textarea.focus();
            }, 0);
        } else {
            // fallback: 끝에 추가
            setContent(content + "\n\n" + markdown);
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setCursorPosition(e.target.selectionStart);
    };

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await fetch(`/api/posts/${postId}`);
                if (response.ok) {
                    const post = await response.json();
                    setTitle(post.title);
                    setContent(post.content);
                    setIsDraft(post.isDraft || false);
                } else {
                    alert("게시글을 불러올 수 없습니다.");
                    router.push("/");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                alert("게시글을 불러오는 중 오류가 발생했습니다.");
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        }

        if (postId) {
            fetchPost();
        }
    }, [postId, router]);

    const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    isDraft: saveAsDraft
                }),
            });

            if (response.ok) {
                if (saveAsDraft) {
                    alert("임시 저장되었습니다.");
                }
                router.push(`/posts/${postId}`);
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || "게시글 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("게시글 수정 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async (e: React.FormEvent) => {
        await handleSubmit(e, true);
    };

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="w-screen relative left-1/2 -translate-x-1/2 px-12 pb-20">
                    <p className="text-gray-500">게시글을 불러오는 중...</p>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="w-screen relative left-1/2 -translate-x-1/2 px-12 pb-20">
                <h1 className="text-3xl font-bold mb-8">게시글 수정</h1>
                <form ref={formRef} onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
                                <div className="bg-gray-50 px-4 border-b border-gray-300 flex items-center justify-between h-14">
                                    <span className="text-sm font-medium text-gray-700">
                                        에디터
                                    </span>
                                    <ImageUploadButton onImageInsert={handleImageInsert} />
                                </div>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={handleContentChange}
                                    onSelect={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        setCursorPosition(target.selectionStart);
                                    }}
                                    className="flex-1 w-full px-4 py-4 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 font-mono text-sm resize-none"
                                    placeholder="# 제목&#10;&#10;게시글 내용을 마크다운 형식으로 작성하세요..."
                                    style={{ minHeight: "600px" }}
                                />
                            </div>

                            {/* 미리보기 영역 */}
                            <div className="flex flex-col border-t border-gray-300 lg:border-t-0 lg:border-l">
                                <div className="bg-gray-50 px-4 border-b border-gray-300 flex items-center justify-between h-14">
                                    <span className="text-sm font-medium text-gray-700">
                                        미리보기
                                    </span>
                                    {/* 높이 일치를 위한 빈 공간 */}
                                    <div className="px-4 py-2 invisible pointer-events-none">
                                        <span className="text-sm">📷 이미지</span>
                                    </div>
                                </div>
                                <div
                                    className="flex-1 overflow-y-auto px-4 py-4 bg-white prose prose-sm max-w-none markdown-body"
                                    style={{ minHeight: "600px" }}
                                >
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
                            마크다운 형식을 지원합니다.{" "}
                            <span className="font-medium">📷 이미지</span> 버튼을 클릭하여 이미지를 업로드하거나,{" "}
                            외부 이미지 URL을 직접 입력할 수 있습니다 (예: <code className="bg-gray-100 px-1 py-0.5 rounded">![설명](https://example.com/image.jpg)</code>).
                            자세한 문법은{" "}
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
                </form>
            </div>

            {/* Fixed 버튼 바 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="w-screen relative left-1/2 -translate-x-1/2 px-12">
                    <div className="flex justify-between items-center h-16">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            나가기
                        </button>
                        <div className="flex gap-3">
                            {isDraft && (
                                <button
                                    type="button"
                                    onClick={(e) => handleSaveDraft(e)}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "저장 중..." : "임시 저장"}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => formRef.current?.requestSubmit()}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "저장 중..." : isDraft ? "등록하기" : "저장하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

