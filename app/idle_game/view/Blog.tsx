import Image from 'next/image'
import { ShopItemIds } from '../side-panel/shop/constants'
import { BlogPost as BlogPostType, BlogPosts } from './constants'
import { useEffect, useRef, useState } from 'react'
import { BlogViewProps } from './useBlogViews'

type BlogProps = {
  purchasedIds: Array<ShopItemIds>
  handleBlogView: () => void
  blogViewProps: BlogViewProps
}

export const Blog = ({ purchasedIds, blogViewProps, handleBlogView }: BlogProps) => {
  const blogCount = purchasedIds.filter((id) => id === ShopItemIds.postRepeatable).length + 1
  return (
    <div className="mt-16">
      <h4 className="text-2xl">The Meaning Behind the Meme</h4>
      {!purchasedIds.includes(ShopItemIds.firstPost) && <h5>0 posts</h5>}
      {purchasedIds.includes(ShopItemIds.firstPost) && (
        <div className="my-4">
          {BlogPosts.slice(0, blogCount).map((post, idx) => (
            <BlogPost
              key={idx}
              post={post}
              purchasedIds={purchasedIds}
              handleBlogView={handleBlogView}
              blogViewProps={blogViewProps}
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
  handleBlogView: () => void
  blogViewProps: BlogViewProps
}

const BlogPost = ({ post, purchasedIds, blogViewProps, handleBlogView }: BlogPostProps) => {
  const [viewCount, setViewCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>(null)

  const { viewFrequencyInMs, viewOdds, viewScoreGain } = blogViewProps
  useEffect(() => {
    if (!purchasedIds.includes(ShopItemIds.blogViewBots)) return

    console.log('running effect', post.title, viewFrequencyInMs, viewOdds, viewScoreGain)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    //every 4.5 seconds randomly decide if the post should gain a view (1/10 chance)
    //if it does, gain score
    const interval = setInterval(() => {
      const result = Math.floor(Math.random() * viewOdds)
      if (result !== 1) return
      setViewCount((prevCount) => prevCount + viewScoreGain)
      handleBlogView()
    }, viewFrequencyInMs)
    intervalRef.current = interval
  }, [purchasedIds, viewFrequencyInMs, viewOdds, viewScoreGain])

  return (
    <div className="py-2 border-b border-gray-400">
      <div>{post.title}</div>
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
  )
}
