'use client'

import Image from '@/node_modules/next/image'
import React from 'react'
import { useIsMobile } from '../utils/useIsMobile'

export type ProjectProps = {
  img: string
  body: string
  link: string
  isItch?: boolean
}

export default function Project({ img, body, link, isItch }: ProjectProps) {
  const mobile = useIsMobile()

  if (mobile)
    return (
      <div className="br2 project-container">
        <Image className="project-image z-4" src={img} alt="project" width={400} height={400} />
        <div className="project-info p-4 h-full ">
          <div className="project-spacing h-full flex flex-col justify-center items-center">
            <div className="f5 lh-title">{body}</div>
            {!mobile && isItch && (
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
      </div>
    )

  return (
    <div className="br2 project-container">
      <a className="no-underline" href={link} target="_blank" rel="noreferrer">
        <Image className="project-image z-4" src={img} alt="project" width={400} height={400} />
        <div className="project-info p-4 h-full ">
          <div className="project-spacing h-full flex flex-col justify-center items-center">
            <div className="f5 lh-title">{body}</div>
            {!mobile && isItch && (
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
