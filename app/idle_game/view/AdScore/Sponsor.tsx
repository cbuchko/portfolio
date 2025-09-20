import { useEffect, useMemo, useState } from 'react'
import { brands } from '../constants'
import { ShopItemIds } from '../../side-panel/shop/constants'

export const Sponsorships = ({ purchasedIds }: { purchasedIds: Array<ShopItemIds> }) => {
  const extraSponsorAmount = purchasedIds.filter(
    (id) => id === ShopItemIds.repeatableSponsor
  ).length
  const sponsors = 5 + extraSponsorAmount * 10

  // shuffle brands once
  const shuffledBrands = useMemo(() => [...brands].sort(() => Math.random() - 0.5), [])
  const chosenSponsors = shuffledBrands.slice(0, sponsors)

  return (
    <div className="absolute top-16 z-0">
      <h2 className="mt-8 text-center">Thank you to our Sponsors!</h2>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {chosenSponsors.map((sponsor, idx) => (
          <Sponsor key={idx} sponsor={sponsor} />
        ))}
      </div>
    </div>
  )
}

export const Sponsor = ({ sponsor }: { sponsor: string }) => {
  const [url, setUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!!url) return
    const logoUrl = `https://img.logo.dev/${sponsor}?token=pk_c7WqEA3OQN-C8z6J2BB-QQ&format=png`
    setUrl(logoUrl)
  }, [sponsor])

  if (!url) return
  return <img className="rounded-2xl" src={url} height={48} width={48} />
}
