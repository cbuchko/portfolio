import Link from "@/node_modules/next/link"
import formatDate from "../utils/formatDate"
import getPostMetadata from "../utils/getPostMetadata"

export const BlogContent = () => {
  const postMetadata = getPostMetadata("posts")

  const sectionClass = "bg-white p-8 rounded-lg shadow-lg shadow-blue-100 mb-16"
  const headerClass = "text-3xl tracking-wide font-semibold"
  const paragraphClass =
    "mt-4 text-lg tracking-lg leading-relaxed text-gray-800"
  return (
    <>
      {postMetadata.reverse().map((post, idx) => {
        return (
          <Link href={`blog/post/${post.slug}`} key={idx}>
            <section className={sectionClass}>
              <h3 className={headerClass}>{post.title}</h3>
              <p className={paragraphClass + " !mt-1"}>
                {formatDate(post.publishDate)}
              </p>
              <p className={paragraphClass}>{`${post.excerpt}...`}</p>
            </section>
          </Link>
        )
      })}
    </>
  )
}
