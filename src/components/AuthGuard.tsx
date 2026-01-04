"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch("/api/check-auth");
                const data = await response.json();

                if (!data.allowed) {
                    // 권한이 없으면 홈으로 리다이렉트
                    router.push("/");
                    return;
                }

                setIsAllowed(true);
            } catch (error) {
                console.error("Error checking auth:", error);
                router.push("/");
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        );
    }

    if (!isAllowed) {
        return null;
    }

    return <>{children}</>;
}

