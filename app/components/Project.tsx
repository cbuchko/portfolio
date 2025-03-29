import React from "react"

export type ProjectProps = {
  img: string
  body: string
  link: string
}
export default function Project({ img, body, link }: ProjectProps) {
  const mobile = false

  return (
    <div className="br2 project-container">
      <a
        className="no-underline disabled"
        href={link}
        target="_blank"
        rel="noreferrer"
      >
        <img className="project-image z-4" src={img} alt="project" />
        <div className="project-info p-4 h-full ">
          <div className="project-spacing h-full flex flex-col justify-center items-center">
            <div className="f5 lh-title">{body}</div>
            {!mobile && (
              <img
                className="project-link my-3"
                src={"/itch.png"}
                alt="github link"
              />
            )}
          </div>
        </div>
        <img className="gif text-center" src={img} alt="project gif" />
      </a>
    </div>
  )
}
