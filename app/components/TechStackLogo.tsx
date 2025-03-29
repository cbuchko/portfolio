import Image from "@/node_modules/next/image"

export const TechStackLogo = ({ url, alt }: { url: string; alt: string }) => {
  return (
    <div className="relative group">
      <Image src={url} width={48} height={48} alt={alt} />
      <div className="absolute -bottom-8  px-2 pt-1 rounded-lg shadow-lg capitalize opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {alt}
      </div>
    </div>
  )
}
