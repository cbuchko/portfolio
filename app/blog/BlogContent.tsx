"use client"
import Link from "@/node_modules/next/link"
import { useCallback, useMemo, useState } from "react"
import { SearchBar } from "../components/SearchBar"
import formatDate from "../utils/formatDate"
import classNames from "classnames"

type Post = {
  slug: string
  title: string
  publishDate: string
  excerpt: string
  body: string
  category: string
}
type BlogContentProps = {
  posts: Post[]
}
export const BlogContent = ({ posts }: BlogContentProps) => {
  const [searchValue, setSearchValue] = useState("")
  const [filterValue, setFilterValue] = useState<"survivor" | "tv" | undefined>(
    undefined
  )

  const filteredPosts = useMemo(() => {
    if (!searchValue && !filterValue) return posts
    return posts.filter((post) => {
      const searchTerm = `${post.title} ${post.excerpt}`.toLowerCase()
      return (
        searchTerm.includes(searchValue.toLowerCase()) &&
        (!!filterValue ? post.category === filterValue : true)
      )
    })
  }, [posts, filterValue, searchValue])

  const toggleFilterValue = useCallback(
    (value: "survivor" | "tv") => {
      if (value === filterValue) {
        setFilterValue(undefined)
        return
      }
      setFilterValue(value)
    },
    [filterValue]
  )

  const sectionClass = "bg-white p-8 rounded-lg shadow-lg shadow-blue-100 mb-16"
  const headerClass = "text-3xl tracking-wide font-semibold"
  const paragraphClass =
    "mt-4 text-lg tracking-lg leading-relaxed text-gray-800"
  return (
    <>
      <div className="flex gap-4 items-center mb-4">
        <SearchBar
          searchValue={searchValue}
          handleSearch={(value) => setSearchValue(value)}
          placeholderText="Search..."
        />
        <div className="flex items-center text-xl gap-4">
          <div
            className={classNames("hover:text-blue-500 cursor-pointer", {
              "text-blue-500": filterValue === "survivor",
            })}
            onClick={() => toggleFilterValue("survivor")}
          >
            Survivor
          </div>
          <div
            className={classNames("hover:text-blue-500 cursor-pointer", {
              "text-blue-500": filterValue === "tv",
            })}
            onClick={() => toggleFilterValue("tv")}
          >
            TV Reviews
          </div>
        </div>
      </div>
      {filteredPosts?.map((post, idx) => {
        return (
          <Link href={`blog/post/${post.slug}`} key={idx}>
            <section
              className={classNames(
                sectionClass,
                "transition-transform duration-300 ease-in-out hover:scale-[105%]"
              )}
            >
              <h3 className={headerClass}>{post.title}</h3>
              <p className={paragraphClass + " !mt-1"}>
                {formatDate(post.publishDate)}
              </p>
              <p className={paragraphClass}>{`${post.excerpt}...`}</p>
            </section>
          </Link>
        )
      })}
      {filteredPosts.length === 0 && (
        <h4>Uh... there's nothing here... sorry!</h4>
      )}
    </>
  )
}
