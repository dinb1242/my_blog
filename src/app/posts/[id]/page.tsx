import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import PostActions from "@/components/PostActions";

// 캐시 무효화: 항상 최신 데이터 가져오기
export const revalidate = 0;

async function getPost(id: number) {
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      isDraft: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return post;
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(Number(params.id));

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-block mb-6 text-blue-600 hover:underline"
      >
        ← 목록으로
      </Link>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {post.title || "(제목 없음)"}
          {post.isDraft && (
            <span className="ml-3 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              임시 저장
            </span>
          )}
        </h1>
        <p className="text-gray-500 text-sm">
          작성일: {format(new Date(post.createdAt), "yyyy년 M월 d일 HH:mm", {
            locale: ko,
          })}
        </p>
        {post.updatedAt.getTime() !== post.createdAt.getTime() && (
          <p className="text-gray-500 text-sm">
            수정일: {format(new Date(post.updatedAt), "yyyy년 M월 d일 HH:mm", {
              locale: ko,
            })}
          </p>
        )}
      </header>
      <div className="prose prose-lg max-w-none markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </Link>
          <PostActions postId={post.id} />
        </div>
      </div>
    </article>
  );
}

