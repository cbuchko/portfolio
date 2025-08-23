'use client'

import classNames from 'classnames'
import Link from 'next/link'
import { useState } from 'react'

export const BlogButton = () => {
  const [isHovering, setIsHovering] = useState(false)
  return (
    <div className="bloglink flex justify-end mt4">
      <Link
        className={classNames(
          'text-white bg-[#9b5094] border-2 border-transparent hover:bg-transparent hover:text-black hover:border-blue-400 mt-4 p-4 py-2 rounded-md flex items-center gap-2',
          'transition-all ease-out'
        )}
        title="blog"
        href="/blog"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={classNames('flex items-center gap-2')}>
          <div className="tracking-wide mt-0.5 whitespace-nowrap">ENTER BLOG</div>
          <img
            src={isHovering ? '/black-arrow.svg' : '/white-arrow.svg'}
            className="h-5 w-5"
            alt="arrow"
          />
        </div>
      </Link>
    </div>
  )
}
