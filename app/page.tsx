import Image from "@/node_modules/next/image"
import Link from "@/node_modules/next/link"
import { NovaProject } from "./components/NovaProject"
import Project from "./components/Project"
import { TechStackLogo } from "./components/TechStackLogo"
import { NovaProjects, Projects } from "./constants"

export default function Home() {
  const imageClassName = "rounded-lg"
  return (
    <>
      <div className="p-6 mb-8">
        <h2 className="text-4xl font-bold text-center text-[#7851A9] mt-4">
          Hello! I'm Connor, a Full Stack Developer
        </h2>
        <p className="text-xl text-center text-gray-700 mt-2">
          For over 3 years I've been delivering high quality products to real
          users
        </p>
      </div>

      <section className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-3xl font-semibold border-b-2 pb-2">
          Hummingbird Drones
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-gray-800">
          Since September 2022, my sole focus has been the Nova platform while
          working as a Full Stack Developer at Hummingbird Drones. I've had the
          incredible opportunity of transforming this platform from a proof of
          concept to a widely adopted industry standard.
        </p>
        <div className="flex justify-around my-4">
          <Image
            className={imageClassName}
            src={"/workspace_view.webp"}
            alt="Nova Workspace View"
            width={350}
            height={200}
          />
          <Image
            className={imageClassName}
            src={"/map_view.webp"}
            alt="Nova Map View"
            width={350}
            height={200}
          />
        </div>
        <div className="flex items-center gap-6 my-9 justify-center">
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
        <p className="mt-2 text-lg leading-relaxed text-gray-800">
          Nova is a Next.js web application made for emergency response teams
          that use drones for data collection. Nova is used across the US and
          Canada, but notably, we helped the LA County Fire Department fight the
          LA Palisades fires in January of 2025.
        </p>
        <p className="mt-2 text-lg leading-relaxed text-gray-800">
          Nova not only aims to provide easy mapping tools to anyone who needs
          them, but it's also the only platform in existence to map hotspots
          using machine learning.
        </p>
        <h4 className="text-3xl font-semibold mt-24">My Nova Projects</h4>
        <p className="mt-2 text-lg leading-relaxed">
          I've worked on a ton of projects I'm super proud of for Nova, here are
          a few highlights:
        </p>
        <div className="flex mt-8 justify-evenly mb-4">
          {NovaProjects.map((project, idx) => (
            <NovaProject key={idx} {...project} />
          ))}
        </div>
      </section>
      <section className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-3xl font-semibold border-b-2 pb-2">Projects</h3>
        <p className="mt-4 text-lg leading-relaxed text-gray-800">
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
      <section className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-3xl font-semibold border-b-2 pb-2">Blog</h3>
        <p className="mt-4 text-lg leading-relaxed text-gray-800">
          I have a passion for television, creative writing, and the reality
          show Survivor. Since 2020, I've kept a blog as an outlet to dump my
          thoughts. Most of it's television reviews, a lot of it's Survivor
          related, but I love having this time capsule to look back on.
        </p>
        <div className="bloglink flex justify-end mt4">
          <Link
            className="text-white bg-[#9b5094] p-4 py-2 text-center text-xl rounded-md hover:bg-[#863c7f]"
            title="blog"
            href="/blog"
          >
            {"Check it out!"}
          </Link>
        </div>
      </section>
    </>
  )
}
