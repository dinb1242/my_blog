import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

async function getPosts() {
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
      <h1 className="text-3xl font-bold mb-8">최근 게시글</h1>
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
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-500 text-sm mb-4">
                {format(new Date(post.createdAt), "yyyy년 M월 d일", {
                  locale: ko,
                })}
              </p>
              <p className="text-gray-700 line-clamp-3">
                {post.content.substring(0, 200)}
                {post.content.length > 200 ? "..." : ""}
              </p>
              <Link
                href={`/posts/${post.id}`}
                className="inline-block mt-4 text-blue-600 hover:underline"
              >
                더 읽기 →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

