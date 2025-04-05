import getPostMetadata from "@/app/utils/getPostMetadata"
import matter from "gray-matter"
import Link from "@/node_modules/next/link"
import fs from "fs"
import Markdown from "markdown-to-jsx"
import "./blog.css"

const getPostContent = (slug: string) => {
  const folder = "posts/"
  const file = folder + `${slug}.md`
  const content = fs.readFileSync(file, "utf8")

  const matterResult = matter(content)
  return matterResult
}

export const generateStaticParams = async () => {
  const posts = getPostMetadata("posts")
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostContent(slug)
  const primaryHeaderClass =
    "!text-4xl font-bold text-[#9b5094] mt-4 mb-8 tracking-wide"
  return (
    <>
      <article className="py-14 blog md:mr-[20%]">
        <Link className="hover:underline text-sm absolute top-12" href="/blog">
          {"< Back"}
        </Link>
        <h2 className={primaryHeaderClass}>{post.data.title}</h2>
        <Markdown>{post.content}</Markdown>
      </article>
    </>
  )
}
