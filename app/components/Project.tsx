import Image from '@/node_modules/next/image'
import React from 'react'

export type ProjectProps = {
  img: string
  body: string
  link: string
}
export default function Project({ img, body, link }: ProjectProps) {
  const mobile = false

  return (
    <div className="br2 project-container">
      <a className="no-underline disabled" href={link} target="_blank" rel="noreferrer">
        <Image className="project-image z-4" src={img} alt="project" width={400} height={400} />
        <div className="project-info p-4 h-full ">
          <div className="project-spacing h-full flex flex-col justify-center items-center">
            <div className="f5 lh-title">{body}</div>
            {!mobile && (
              <Image
                className="project-link my-3"
                src={'/itch.png'}
                alt="github link"
                width={400}
                height={400}
              />
            )}
          </div>
        </div>
        <Image className="gif text-center" src={img} alt="project gif" width={400} height={400} />
      </a>
    </div>
  )
}
