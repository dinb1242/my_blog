"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostActionsProps {
  postId: number;
}

export default function PostActions({ postId }: PostActionsProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "게시글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || !isAllowed) {
    return null;
  }

  return (
    <div className="flex gap-3">
      <Link
        href={`/posts/${postId}/edit`}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        수정
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? "삭제 중..." : "삭제"}
      </button>
    </div>
  );
}

