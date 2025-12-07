import Image from 'next/image'
import { ShopItemIds } from '../side-panel/shop/constants'
import { BlogPost as BlogPostType, BlogPosts } from './constants'
import { useEffect, useRef, useState } from 'react'
import { BlogViewProps } from './useBlogViews'
import classNames from 'classnames'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

type BlogProps = {
  purchasedIds: Array<ShopItemIds>
  handleBlogView: (viewGain: number) => void
  blogViewProps: BlogViewProps
  userName: string
}
export const Blog = ({ purchasedIds, blogViewProps, handleBlogView, userName }: BlogProps) => {
  const blogCount = purchasedIds.filter((id) => id === ShopItemIds.postRepeatable).length + 1
  return (
    <div
      className={classNames('mt-16', {
        '!bg-[#ffebeb] rounded-lg pt-8 px-4 text-black shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),_inset_-2px_-2px_5px_rgba(255,255,255,0.7)]':
          purchasedIds.includes(ShopItemIds.blogContainer),
      })}
    >
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
        <div
          className={classNames('my-4 overflow-y-auto max-h-[55vh] my-scrollable', {
            'grid gap-3 grid-cols-[repeat(auto-fit,minmax(225px,1fr))] !max-h-[50vh]':
              purchasedIds.includes(ShopItemIds.blogLayout),
          })}
        >
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
  useEffectInitializer(() => {
    fetchImage()
  }, [])

  const { viewFrequencyInMs, viewOdds, viewGain } = blogViewProps
  ///increments blog view count based on the various blog view props
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

  if (!imageUrl) return null
  if (purchasedIds.includes(ShopItemIds.blogLayout))
    return (
      <BlogLayoutV2
        post={post}
        purchasedIds={purchasedIds}
        userName={userName}
        imageUrl={imageUrl}
        viewCount={viewCount}
      />
    )
  return (
    <BlogLayoutV1
      post={post}
      purchasedIds={purchasedIds}
      userName={userName}
      imageUrl={imageUrl}
      viewCount={viewCount}
    />
  )
}

const BlogLayoutV1 = ({
  post,
  purchasedIds,
  userName,
  imageUrl,
  viewCount,
}: Omit<BlogPostProps, 'handleBlogView' | 'blogViewProps'> & {
  imageUrl: string
  viewCount: number
}) => {
  return (
    <div className="py-2 border-b border-gray-400">
      <div className="flex justify-between">
        <div>
          <div className="text-lg">{post.title}</div>
          {purchasedIds.includes(ShopItemIds.blogAuthor) && (
            <div className="flex items-center gap-1 mb-1 text-black/60">
              <div className="rounded-full pt-px pb-0.5 pl-px pr-px border w-max">
                <Image src="/idle_game/icons/author.svg" alt="author" height={10} width={10} />
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
                <Image src="/idle_game/icons/eye.svg" alt="eye" height={12} width={12} />
                <small className="text-xs">{viewCount}</small>
              </div>
            )}
          </div>
        </div>
        {imageUrl && purchasedIds.includes(ShopItemIds.blogImage) && (
          <img src={imageUrl} className="rounded-lg" alt="thumbnail" height={150} width={300} />
        )}
      </div>
    </div>
  )
}

const BlogLayoutV2 = ({
  post,
  purchasedIds,
  userName,
  imageUrl,
  viewCount,
}: Omit<BlogPostProps, 'handleBlogView' | 'blogViewProps'> & {
  imageUrl: string
  viewCount: number
}) => {
  const height = 150
  return (
    <div className="relative">
      <img src={imageUrl} className="rounded-lg h-[150px] w-full" alt="thumbnail" height={height} />
      <div
        className="absolute top-0 z-5 bg-black/70 rounded-lg p-2 text-white flex flex-col w-full"
        style={{ height }}
      >
        <div className="">
          <div className="text-lg">{post.title}</div>
          {purchasedIds.includes(ShopItemIds.blogAuthor) && (
            <div className="flex items-center gap-1 text-white mt-1">
              <div className="rounded-full pt-px pb-0.5 pl-px pr-px border w-max">
                {/** TODO: IMAGE BROKE FROM NEXTJS UPDATE */}
                <Image src={'/idle_game/icons/author.svg'} width={10} height={10} alt="author" />
              </div>
              <h5 className="text-xs">{userName}</h5>
            </div>
          )}
        </div>
        <div className="grow" />
        {purchasedIds.includes(ShopItemIds.blogDetails) && (
          <div className="flex justify-between items-center text-[10px]">
            <div className=" capitalize">{`${post.type} * ${post.duration} read`}</div>
            <div className="flex gap-1 items-center">
              {/** TODO: IMAGE BROKE FROM NEXTJS UPDATE */}
              <Image src={'/idle_game/icons/eye.svg'} width={12} height={12} alt="view" />
              <small className="text-xs">{viewCount}</small>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
