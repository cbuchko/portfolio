import Link from '@/node_modules/next/link'
import { BlogContent } from './BlogContent'
import getPostMetadata from '../utils/getPostMetadata'

export default function Blog() {
  const postMetadata = getPostMetadata('posts')

  const primaryHeaderClass =
    'text-3xl md:text-4xl font-bold text-center text-[#9b5094] mt-4 tracking-wide'
  return (
    <div className="portfolio-content">
      <div className="py-14">
        <Link className="hover:underline text-sm absolute top-12" href="/">
          {'< Take me home'}
        </Link>
        <h2 className={primaryHeaderClass}>Welcome to my Blog!</h2>
        <h4 className="text-md md:text-xl text-center tracking-lg leading-relaxed text-gray-800 mt-2">
          This is where I obsess about Survivor and have semi-interesting opinions about TV shows
        </h4>
      </div>
      <BlogContent posts={postMetadata.reverse()} />
    </div>
  )
}
