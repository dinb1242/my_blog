"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Post {
  id: number;
  title: string;
  content: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PostListClientProps {
  initialPosts: Post[];
}

export default function PostListClient({ initialPosts }: PostListClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "drafts">("all");

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        setIsAllowed(data.allowed);
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // URL에서 필터 모드 확인
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("filter") === "drafts" ? "drafts" : "all";
    setFilterMode(mode);
  }, []);

  useEffect(() => {
    if (!isAllowed) {
      // 허용되지 않은 IP는 임시 저장 게시글 필터링
      setPosts(initialPosts.filter((post) => !post.isDraft));
    } else {
      // 허용된 IP는 필터 모드에 따라 표시
      if (filterMode === "drafts") {
        setPosts(initialPosts.filter((post) => post.isDraft));
      } else {
        // "all" 모드: 모든 게시글 표시
        setPosts(initialPosts);
      }
    }
  }, [isAllowed, initialPosts, filterMode]);

  const handleFilterChange = (mode: "all" | "drafts") => {
    if (!isAllowed) return;
    
    setFilterMode(mode);
    const params = new URLSearchParams();
    if (mode === "drafts") {
      params.set("filter", "drafts");
    }
    router.push(`/?${params.toString()}`);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      {isAllowed && (
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            전체 게시글
          </button>
          <button
            onClick={() => handleFilterChange("drafts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === "drafts"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            임시 저장만 보기
          </button>
        </div>
      )}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">아직 작성된 글이 없습니다.</p>
          <Link
            href="/posts/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            첫 번째 글 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <Link href={`/posts/${post.id}`}>
                <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600">
                  {post.title || "(제목 없음)"}
                  {post.isDraft && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      임시 저장
                    </span>
                  )}
                </h2>
              </Link>
              <p className="text-gray-500 text-sm">
                {format(new Date(post.createdAt), "yyyy년 M월 d일", {
                  locale: ko,
                })}
              </p>
              <Link
                href={`/posts/${post.id}`}
                className="inline-block mt-2 text-blue-600 hover:underline"
              >
                더 읽기 →
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

