"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function WriteButton() {
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  if (!isAllowed) {
    return null; // 권한이 없으면 버튼을 표시하지 않음
  }

  return (
    <Link
      href="/posts/new"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      글쓰기
    </Link>
  );
}

