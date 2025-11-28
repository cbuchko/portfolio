import Image from '@/node_modules/next/image'
import { NovaProject } from './components/NovaProject'
import Project from './components/Project'
import { NovaProjects, Projects, WebsiteProjects } from './constants'
import { BlogButton } from './components/BlogButton'

export default function Home() {
  const primaryHeaderClass =
    'text-3xl md:text-4xl font-bold text-center text-[#9b5094] mt-4 tracking-wide'
  const sectionClass =
    'md:bg-white md:p-8 rounded-lg md:shadow-lg md:shadow-blue-400/20 md:mb-16 mb-32 mx-1 md:mx-0 mt-8 md:mt-0'
  const headerClass = 'text-2xl md:text-3xl tracking-wide font-semibold'
  const paragraphClass = 'mt-4 text-lg tracking-lg leading-relaxed text-gray-800'
  return (
    <div className="portfolio-content">
      <div className="py-14">
        <h2 className={primaryHeaderClass}>{`Hello! I'm Connor, a Full Stack Developer`}</h2>
        <h4 className="text-md md:text-xl text-center tracking-lg leading-relaxed text-gray-800 mt-2">
          {`I'm currently searching for my next adventure, wherever that may be`}
        </h4>
      </div>

      <section className={sectionClass}>
        <h3 className={headerClass}>{`Hummingbird Drones`}</h3>
        <p className={paragraphClass}>
          From September 2022 to August 2025, my sole focus was the{' '}
          <a className="homelink" href="https://www.mapnova.com/" target="_blank" rel="noreferrer">
            Nova
          </a>{' '}
          platform while working as a Full Stack Developer at Hummingbird Drones. During my time
          there I transformed the platform from a proof of concept to a celebrated industry
          standard.
        </p>
        <a
          className="flex justify-around my-6"
          href="https://www.mapnova.com/"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            className={'rounded-lg'}
            src={'/nova.png'}
            alt="Nova Workspace View"
            width={900}
            height={200}
          />
        </a>
        <p className={paragraphClass}>
          {`Nova is a Next.js web application made for emergency responders
          that use drones for data collection. Nova is used across the US and
          Canada, but notably, we helped the LA County Fire Department fight the
          LA Palisades fires in January of 2025.`}
        </p>
        <p className={paragraphClass}>
          {`Nova not only aims to provide easy mapping tools to anyone who needs
          them, but it's also the only platform in existence to map hotspots
          using machine learning.`}
        </p>
        <p className={paragraphClass}>
          {`I worked on a ton of projects I'm super proud of for Nova, here are
          a few highlights:`}
        </p>
        <div className="flex flex-col md:grid md:grid-cols-3 mt-8 gap-12 md:gap-x-4 mb-8 place-items-center">
          {NovaProjects.map((project, idx) => (
            <NovaProject key={idx} {...project} />
          ))}
        </div>
      </section>
      <section className={sectionClass}>
        <h3 className={headerClass}>Personal Projects</h3>
        <p className={paragraphClass}>
          {`My current focus has been developing web-based games. These are fun and interactive experiences built with React and TypeScript.`}
        </p>
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-center mt-8 justify-evenly mb-16">
          {WebsiteProjects.map((project, idx) => (
            <Project key={idx} {...project} isItch={false} />
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 items-center mt-8 justify-evenly mb-4">
          {Projects.map((project, idx) => (
            <Project key={idx} {...project} isItch={true} />
          ))}
        </div>
      </section>
      <section className={sectionClass}>
        <h3 className={headerClass}>My Blog</h3>
        <p className={paragraphClass}>
          {`I have a passion for television, creative writing, and the reality
          show Survivor. Since 2020, I've kept a blog as an outlet to dump my
          thoughts. Most of it's television reviews, a lot of it's Survivor
          related, but I love having this time capsule to look back on.`}
        </p>
        <BlogButton />
      </section>
      <div className="md:py-6 mb-16">
        <h2 className={primaryHeaderClass}>{`Thanks for Visiting!`}</h2>
        <h4 className="text-md md:text-xl text-center tracking-lg leading-relaxed text-gray-800 mt-2">
          {`If you still wanna learn about me, check out my `}
          <a className="homelink" href="/connor_resume.pdf" target="_blank" rel="noreferrer">
            Resume
          </a>
          ,{' '}
          <a
            className="homelink"
            href="https://www.linkedin.com/in/connor-buchko-17932116a/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>{' '}
          or{' '}
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
    </div>
  )
}
