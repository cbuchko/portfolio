import Image from "@/node_modules/next/image"
import Link from "@/node_modules/next/link"
import { NovaProject } from "./components/NovaProject"
import Project from "./components/Project"
import { TechStackLogo } from "./components/TechStackLogo"
import { NovaProjects, Projects } from "./constants"

export default function Home() {
  const primaryHeaderClass =
    "text-4xl font-bold text-center text-[#9b5094] mt-4 tracking-wide"
  const sectionClass = "bg-white p-8 rounded-lg shadow-lg shadow-blue-100 mb-16"
  const headerClass = "text-3xl tracking-wide font-semibold"
  const paragraphClass =
    "mt-4 text-lg tracking-lg leading-relaxed text-gray-800"
  return (
    <>
      <div className="py-14">
        <h2 className={primaryHeaderClass}>
          Hello! I'm Connor, a Full Stack Developer
        </h2>
        <h4 className="text-xl text-center tracking-lg leading-relaxed text-gray-800 mt-2">
          For over 3 years I've been delivering high quality products at a
          global scale
        </h4>
      </div>

      <section className={sectionClass}>
        <h3 className={headerClass}>Hummingbird Drones</h3>
        <p className={paragraphClass}>
          Since September 2022, my sole focus has been the Nova platform while
          working as a Full Stack Developer at Hummingbird Drones. I've had the
          incredible opportunity of transforming this platform from a proof of
          concept to a widely adopted industry standard.
        </p>
        <a
          className="flex justify-around my-6"
          href="https://www.mapnova.com/"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            className={"rounded-lg"}
            src={"/nova.png"}
            alt="Nova Workspace View"
            width={900}
            height={200}
          />
        </a>
        <div className="flex items-center gap-7 my-8 justify-center">
          <TechStackLogo url="/stacks/react.png" alt="react" />
          <TechStackLogo url="/stacks/typescript.png" alt="TypeScript" />
          <TechStackLogo url="/stacks/tailwind.png" alt="tailwind" />
          <TechStackLogo url="/stacks/redux.svg" alt="redux" />
          <TechStackLogo url="/stacks/redis.png" alt="redis" />
          <TechStackLogo url="/stacks/graphql.png" alt="GraphQL" />
          <TechStackLogo url="/stacks/dynamodb.png" alt="DynamoDB" />
          <TechStackLogo url="/stacks/deckgl.png" alt="DeckGL" />
          <TechStackLogo url="/stacks/maplibre.png" alt="MapLibre" />
        </div>
        <p className={paragraphClass}>
          Nova is a Next.js web application made for emergency response teams
          that use drones for data collection. Nova is used across the US and
          Canada, but notably, we helped the LA County Fire Department fight the
          LA Palisades fires in January of 2025.
        </p>
        <p className={paragraphClass}>
          Nova not only aims to provide easy mapping tools to anyone who needs
          them, but it's also the only platform in existence to map hotspots
          using machine learning.
        </p>
        <p className={paragraphClass}>
          I've worked on a ton of projects I'm super proud of for Nova, here are
          a few highlights:
        </p>
        <div className="flex mt-6 justify-evenly mb-6">
          {NovaProjects.map((project, idx) => (
            <NovaProject key={idx} {...project} />
          ))}
        </div>
      </section>
      <section className={sectionClass}>
        <h3 className={headerClass}>Personal Projects</h3>
        <p className={paragraphClass}>
          Back in university I was super into game development and published a
          few small games online. I've honestly not pursued this in a while but
          I'm still super proud of what I've made!
        </p>
        <div className="flex mt-8 justify-evenly mb-4">
          {Projects.map((project, idx) => (
            <Project key={idx} {...project} />
          ))}
        </div>
      </section>
      <section className={sectionClass}>
        <h3 className={headerClass}>My Blog</h3>
        <p className={paragraphClass}>
          I have a passion for television, creative writing, and the reality
          show Survivor. Since 2020, I've kept a blog as an outlet to dump my
          thoughts. Most of it's television reviews, a lot of it's Survivor
          related, but I love having this time capsule to look back on.
        </p>
        <div className="bloglink flex justify-end mt4">
          <Link
            className="text-white bg-[#9b5094] mt-4 p-4 py-2 text-center text-xl rounded-md hover:bg-[#863c7f]"
            title="blog"
            href="/blog"
          >
            {"Check it out!"}
          </Link>
        </div>
      </section>
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
