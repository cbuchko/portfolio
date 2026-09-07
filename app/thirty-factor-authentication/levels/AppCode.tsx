import { useCallback, useEffect, useRef, useState } from 'react'
import { ContentProps, ControlProps } from './types'
import { makeAuthCode, shuffle } from '../utils'
import { PinInput } from '../components/PinInput'
import { ExtrasPortal } from '../components/ExtrasPortal'
import classNames from 'classnames'

export const AppCodeContent = ({
  validateAdvance,
  cancelAdvance,
  handleLevelAdvance,
  layout,
}: ContentProps) => {
  const { isCompact, isMobile } = layout
  const [targetCode, setTargetCode] = useState(makeAuthCode(6))
  const [codeInput, setCodeInput] = useState('')

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

  const [apps] = useState(() => {
    const decoys = shuffle([...appNames])
    const maxIndex = Math.max(1, Math.floor((decoys.length + 1) * 0.75))
    decoys.splice(Math.floor(Math.random() * maxIndex), 0, TARGET_APP)
    return decoys
  })

  // Short/narrow screens (phones, landscape Kindles) get more time to hunt.
  const duration = isCompact ? 16 : 8
  return (
    <>
      <p className="text-lg">Enter the code from your Authenticator App.</p>
      <PinInput value={codeInput} onChange={handleInputChange} onSubmit={handleLevelAdvance} />
      <ExtrasPortal>
        <div
          className={classNames({
            'grid w-[var(--tfa-auth-width,100%)] grid-cols-4 overflow-hidden': isMobile,
            'flex w-full flex-wrap justify-center': !isMobile,
          })}
        >
          {apps.map((app, idx) => {
            const isTarget = app === TARGET_APP
            return (
              <AppCode
                key={idx}
                title={app}
                codeDefault={targetCode}
                isTarget={isTarget}
                setTargetCode={handleTargetSet}
                duration={duration}
                isDelayed
                compact={isMobile}
              />
            )
          })}
        </div>
      </ExtrasPortal>
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
  compact?: boolean
}

export const AppCode = ({
  title,
  codeDefault,
  isTarget,
  setTargetCode,
  duration,
  isDelayed,
  compact,
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

  const size = compact ? 32 : 40
  const radius = compact ? 12 : 20
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
    <div
      className={classNames('border select-none', {
        'w-full min-w-0 px-1 py-0.5 -mb-px -mr-px': compact,
        'flex items-center justify-between p-2 gap-4': !compact,
      })}
    >
      {compact ? (
        <div className="min-w-0">
          <div className="text-xs leading-none break-words mt-2">{title}</div>
          <div className="flex min-w-0 items-center justify-between gap-0.5">
            <div className="mono text-lg tabular-nums leading-none" style={{ color }}>
              {code}
            </div>
            <svg width={size} height={size} className="block shrink-0">
              <path d={pathData} fill={color} />
            </svg>
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="text-xs">{title}</div>
            <div className="mono text-3xl tabular-nums" style={{ color }}>
              {code}
            </div>
          </div>
          <svg width={size} height={size}>
            <path d={pathData} fill={color} />
          </svg>
        </>
      )}
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

const TARGET_APP = 'Thirty Factor Auth'

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
