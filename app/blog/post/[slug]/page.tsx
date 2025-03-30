import Image from "@/node_modules/next/image"
import Link from "@/node_modules/next/link"

export default function Blog() {
  const primaryHeaderClass =
    "text-4xl font-bold text-center text-[#9b5094] mt-4 tracking-wide"
  const sectionClass = "bg-white p-8 rounded-lg shadow-lg shadow-blue-100 mb-16"
  const headerClass = "text-3xl tracking-wide font-semibold"
  const paragraphClass =
    "mt-4 text-lg tracking-lg leading-relaxed text-gray-800"
  return (
    <>
      <div className="py-14">
        <h2 className={primaryHeaderClass}>Welcome to my Blog!</h2>
        <h4 className="text-xl text-center tracking-lg leading-relaxed text-gray-800 mt-2">
          This is where I obsess about Survivor and have semi-interesting
          opinions about TV shows
        </h4>
      </div>

      <div className="p-6 mb-16">
        <h2 className={primaryHeaderClass}>Thanks for Visiting!</h2>
        <h4 className="text-xl text-center tracking-lg leading-relaxed text-gray-800 mt-2">
          If you still wanna learn about me, check out my{" "}
          <a
            className="homelink"
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
          >
            Resume
          </a>
          , my{" "}
          <a
            className="homelink"
            href="https://www.linkedin.com/in/connor-buchko-17932116a/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>{" "}
          or my{" "}
          <a
            className="homelink"
            href="https://github.com/cbuchko"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </h4>
      </div>
    </>
  )
}
