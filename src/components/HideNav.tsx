"use client";

import { usePathname } from "next/navigation";

export default function HideNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPostForm = pathname?.includes("/posts/new") || pathname?.match(/\/posts\/\d+\/edit/);

  if (isPostForm) {
    return null;
  }

  return <>{children}</>;
}

