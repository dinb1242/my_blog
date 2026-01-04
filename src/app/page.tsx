import { prisma } from "@/lib/prisma";
import PostListClient from "@/components/PostListClient";

async function getPosts() {
  // 모든 게시글 가져오기 (필터링은 클라이언트에서 처리)
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return posts;
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">최근 게시글</h1>
      </div>
      <PostListClient initialPosts={posts} />
    </div>
  );
}

