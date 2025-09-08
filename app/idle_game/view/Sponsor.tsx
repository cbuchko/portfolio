import { useEffect, useState } from 'react'
import { brands } from './constants'

export const Sponsorships = () => {
  const [sponsorBank, setSponsorBank] = useState(brands)
  return (
    <>
      <h2 className="mt-8">Thank you to our Sponsors!</h2>
      <div className="flex gap-3 mt-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Sponsor key={i} sponsorBank={sponsorBank} setSponsorBank={setSponsorBank} />
        ))}
      </div>
    </>
  )
}

export const Sponsor = ({
  sponsorBank,
  setSponsorBank,
}: {
  sponsorBank: string[]
  setSponsorBank: React.Dispatch<React.SetStateAction<string[]>>
}) => {
  const [url, setUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!!url) return
    //select a random brand to fetch from the logodev api
    const idx = Math.floor(Math.random() * brands.length)
    const brandDomain = sponsorBank[idx]
    const logoUrl = `https://img.logo.dev/${brandDomain}?token=pk_c7WqEA3OQN-C8z6J2BB-QQ&format=png`
    setUrl(logoUrl)

    //remove the brand from the bank so it doesn't get selected again
    setSponsorBank((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  if (!url) return
  return <img className="rounded-2xl" src={url} height={48} width={48} />
}
