import { ShopItemIds } from '../side-panel/shop/constants'
import { BlogPosts } from './constants'

type BlogProps = {
  purchasedIds: Array<ShopItemIds>
}

export const Blog = ({ purchasedIds }: BlogProps) => {
  const blogCount = purchasedIds.filter((id) => id === ShopItemIds.postRepeatable).length + 1
  return (
    <div className="mt-8">
      <h4 className="text-2xl">The Meaning Behind the Meme</h4>
      {!purchasedIds.includes(ShopItemIds.firstPost) && <h5>0 posts</h5>}
      {purchasedIds.includes(ShopItemIds.firstPost) && (
        <div className="my-4">
          {BlogPosts.slice(0, blogCount).map((post, idx) => (
            <div key={idx} className="py-2 border-b">
              <div>{post.title}</div>
              <div className="text-black/60 text-xs uppercase">{`${post.type} * ${post.duration} read`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
