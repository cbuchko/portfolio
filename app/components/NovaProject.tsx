import Image from '@/node_modules/next/image'

export type NovaProjectProps = {
  title: string
  points: string[]
  imageUrl: string
}

export const NovaProject = ({ title, points, imageUrl }: NovaProjectProps) => {
  return (
    <div className="w-max">
      <h4 className="text-lg font-semibold text-center mb-1 text-blue-400">{title}</h4>
      <div className="br2 project-container">
        <div className="w-max block">
          <Image
            className="project-image br5 z-4"
            src={imageUrl}
            width={400}
            height={400}
            alt="project"
          />
          <div className="project-info p-4 flex h-full w-full">
            <div className="h-full flex justify-center items-center">
              <ul className="list-disc ml-4 text-gray-700 lh-title text-white text-left space-y-1">
                {points.map((point, idx) => {
                  return <li key={idx}>{point}</li>
                })}
              </ul>
            </div>
          </div>
          <Image className="gif br5" src={imageUrl} alt="project gif" width={400} height={400} />
        </div>
      </div>
    </div>
  )
}
