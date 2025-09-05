import Image from 'next/image'
import { ShopItemIds } from '../side-panel/shop/constants'
import { BlogPost as BlogPostType, BlogPosts } from './constants'
import { useEffect, useRef, useState } from 'react'
import { BlogViewProps } from './useBlogViews'

type BlogProps = {
  purchasedIds: Array<ShopItemIds>
  handleBlogView: (viewGain: number) => void
  blogViewProps: BlogViewProps
  userName: string
}
export const Blog = ({ purchasedIds, blogViewProps, handleBlogView, userName }: BlogProps) => {
  const blogCount = purchasedIds.filter((id) => id === ShopItemIds.postRepeatable).length + 1
  return (
    <div className="mt-16">
      <h4 className="text-4xl">The Meaning Behind the Meme</h4>
      {!purchasedIds.includes(ShopItemIds.firstPost) && <h5>0 posts</h5>}
      {purchasedIds.includes(ShopItemIds.blogBio) && (
        <>
          <h5 className="mt-4">About the Author</h5>
          <h5 className="text-sm text-black/80">
            {userName} is a human who grew up in a smallish largish area. They faced many struggles,
            but also experienced many more triumphs. After spending approximately 12 years in
            school, {userName} pursued their true passion which was of a academic/athletic/artistic
            variety. Despite their busy schedule, they still find time to write these blogs and
            spread joy to their dedicated readers.
          </h5>
        </>
      )}
      {purchasedIds.includes(ShopItemIds.firstPost) && (
        <div className="my-4 overflow-y-auto max-h-[60vh]">
          {BlogPosts.slice(0, blogCount).map((post, idx) => (
            <BlogPost
              key={idx}
              post={post}
              purchasedIds={purchasedIds}
              handleBlogView={handleBlogView}
              blogViewProps={blogViewProps}
              userName={userName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type BlogPostProps = {
  purchasedIds: Array<ShopItemIds>
  post: BlogPostType
  handleBlogView: (viewGain: number) => void
  blogViewProps: BlogViewProps
  userName: string
}

const BlogPost = ({
  post,
  purchasedIds,
  blogViewProps,
  handleBlogView,
  userName,
}: BlogPostProps) => {
  const [viewCount, setViewCount] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const fetchImage = async () => {
    const res = await fetch('https://picsum.photos/300/150')
    setImageUrl(res.url)
  }

  //fetch the image
  useEffect(() => {
    fetchImage()
  }, [])

  const { viewFrequencyInMs, viewOdds, viewGain } = blogViewProps
  useEffect(() => {
    if (!purchasedIds.includes(ShopItemIds.blogViewBots)) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const interval = setInterval(() => {
      const result = Math.floor(Math.random() * viewOdds)
      if (result !== 1) return
      setViewCount((prevCount) => prevCount + viewGain)
      handleBlogView(viewGain)
    }, viewFrequencyInMs)
    intervalRef.current = interval
  }, [purchasedIds, viewFrequencyInMs, viewOdds, viewGain])

  return (
    <div className="py-2 border-b border-gray-400">
      <div className="flex justify-between">
        <div>
          <div className="text-lg">{post.title}</div>
          {purchasedIds.includes(ShopItemIds.blogAuthor) && (
            <div className="flex items-center gap-1 mb-1 text-black/60">
              <div className="rounded-full pt-px pb-0.5 pl-px pr-px border w-max">
                <Image src="/idle_game/author.svg" alt="author" height={10} width={10} />
              </div>
              <h5 className="text-xs">{userName}</h5>
            </div>
          )}
          <div className="flex gap-2 items-center text-black/60">
            {purchasedIds.includes(ShopItemIds.blogDetails) && (
              <div className="text-xs uppercase">{`${post.type} * ${post.duration} read`}</div>
            )}

            {purchasedIds.includes(ShopItemIds.blogViewCount) && (
              <div className="flex gap-1">
                <Image src="/idle_game/eye.svg" alt="eye" height={12} width={12} />
                <small className="text-xs">{viewCount}</small>
              </div>
            )}
          </div>
        </div>
        {imageUrl && purchasedIds.includes(ShopItemIds.blogImage) && (
          <img src={imageUrl} className="rounded-lg" alt="eye" height={150} width={300} />
        )}
      </div>
    </div>
  )
}
