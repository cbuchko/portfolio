import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeAuthCode, shuffle } from '../utils'
import { createPortal } from 'react-dom'
import { useEffectInitializer } from '@/app/utils/useEffectUnsafe'

export const AppCodeContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  isMobile,
}: ContentProps) => {
  const [targetCode, setTargetCode] = useState(makeAuthCode(6))
  const [codeInput, setCodeInput] = useState('')
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  const handleInputChange = (input: string) => {
    setCodeInput(input)
    if (targetCode.toLocaleLowerCase() === input.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }

  const handleTargetSet = useCallback(
    (code: string) => {
      setTargetCode(code)
      cancelAdvance()
    },
    [cancelAdvance]
  )

  useEffectInitializer(() => {
    const portalElement = document.getElementById('extras-portal')
    setPortalElement(portalElement)
  }, [])

  const apps = useMemo(() => {
    return shuffle([...appNames, 'Thirty Factor Auth'])
  }, [])

  //give them more time on mobile because it's way too hard otherwise
  const duration = isMobile ? 10 : 5
  return (
    <>
      <p className="text-lg">Enter the code from your Authenticator App.</p>
      <input
        className="border w-full rounded-md mt-1 px-2 py-1"
        placeholder="Enter code..."
        value={codeInput}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') handleLevelAdvance()
        }}
      />
      {portalElement &&
        createPortal(
          <div className="flex flex-wrap justify-center mt-6">
            {apps.map((app, idx) => {
              const isTarget = app === 'Thirty Factor Auth'
              return (
                <AppCode
                  key={idx}
                  title={app}
                  codeDefault={targetCode}
                  isTarget={isTarget}
                  setTargetCode={handleTargetSet}
                  duration={duration}
                  isDelayed
                />
              )
            })}
          </div>,
          portalElement
        )}
    </>
  )
}

type AppCodeProps = {
  title: string
  codeDefault?: string
  isTarget?: boolean
  setTargetCode?: (code: string) => void
  duration: number
  isDelayed?: boolean
}

export const AppCode = ({
  title,
  codeDefault,
  isTarget,
  setTargetCode,
  duration,
  isDelayed,
}: AppCodeProps) => {
  const [elapsed, setElapsed] = useState(0)
  const [code, setCode] = useState(isTarget ? codeDefault : makeAuthCode(6))
  const intervalRef = useRef<NodeJS.Timeout>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    const startDelay = isDelayed ? Math.random() * 5000 : 0

    timeoutRef.current = setTimeout(() => {
      const start = Date.now()
      intervalRef.current = setInterval(() => {
        const diff = (Date.now() - start) / 1000
        if (diff % duration <= 0.1) {
          const newCode = makeAuthCode(6)
          setCode(newCode)
          if (isTarget) setTargetCode?.(newCode)
        }

        setElapsed(diff % duration)
      }, 100)
    }, startDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isDelayed, isTarget, duration, setTargetCode])

  const progress = 0.999999 - elapsed / duration // 1 → 0

  const size = 40
  const radius = 20
  const cx = size / 2
  const cy = size / 2
  const angle = 360 * progress

  // Convert polar angle to cartesian coordinates
  const radians = ((angle - 90) * Math.PI) / 180
  const x = cx + radius * Math.cos(radians)
  const y = cy + radius * Math.sin(radians)
  const largeArc = angle > 180 ? 1 : 0
  const color = progress < 0.25 ? '#fb2c36' : '#2b7fff'

  // Path for the filled portion (pie wedge)
  const pathData = `
    M ${cx} ${cy}
    L ${cx} ${cy - radius}
    A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y}
    Z
  `

  return (
    <div className="p-2 border flex justify-between items-center gap-4 select-none">
      <div>
        <div className="text-xs">{title}</div>
        <div className="mono text-3xl" style={{ color }}>
          {code}
        </div>
      </div>
      <div>
        <div>
          <svg width={size} height={size}>
            <path d={pathData} fill={color} />
          </svg>
        </div>
      </div>
    </div>
  )
}

export const AppCodeControls = ({ handleLevelAdvance }: ControlProps) => {
  return (
    <>
      <div className="grow" />
      <button className="auth-button auth-button-primary" onClick={() => handleLevelAdvance()}>
        Submit
      </button>
    </>
  )
}

const appNames: string[] = [
  'Google',
  'Microsoft',
  'Apple',
  'Facebook',
  'Instagram',
  'X',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Slack',
  'Discord',
  'Twitch',
  'Reddit',
  'Amazon',
  'Zoom',
  'Notion',
  '1Password',
  'LastPass',
  'Dashlane',
  'Coinbase',
  'Binance',
  'Kraken',
  'PayPal',
  'Stripe',
  'Shopify',
  'Squarespace',
  'WordPress',
  'Cloudflare',
  'AWS',
  'Azure',
  'GCP',
  'DigitalOcean',
  'Heroku',
  'Okta',
  'Auth0',
  'Salesforce',
  'LinkedIn',
  'Netflix',
  'Adobe',
  'Steam',
  'Epic',
  'PlayStation',
  'Xbox',
  'EA',
  'Ubisoft',
  'ProtonMail',
  'Tutanota',
  'Yahoo',
  'Outlook',
  'Mega',
  'NordVPN',
  'ExpressVPN',
  'Crypto.com',
  'Gemini',
  'OpenAI',
  'Trello',
  'Asana',
  'Jira',
  'Bitwarden',
  'Fastmail',
  'Namecheap',
  'GoDaddy',
  'Linode',
  'Vercel',
  'Netlify',
  'Firebase',
  'HackerOne',
  'Bugcrowd',
  'Tesla',
  'Robinhood',
  'Wealthsimple',
  'Revolut',
  'Wise',
  'DoorDash',
  'Uber',
  'Airbnb',
  'Dropbox',
  'Canva',
  'Figma',
  'ClickUp',
  'Linear',
  'Render',
  'Cloudways',
]
