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
  const { isCompact, isNarrow, viewportWidth } = layout
  const [targetCode, setTargetCode] = useState(makeAuthCode(6))
  const [codeInput, setCodeInput] = useState('')

  const handleInputChange = (input: string) => {
    setCodeInput(input)
  }

  useEffect(() => {
    if (targetCode.toLocaleLowerCase() === codeInput.toLocaleLowerCase()) {
      validateAdvance()
    } else {
      cancelAdvance()
    }
  }, [targetCode, codeInput, validateAdvance, cancelAdvance])

  const handleTargetSet = useCallback((code: string) => {
    setTargetCode(code)
  }, [])

  const [apps] = useState(() => {
    const decoys = shuffle([...appNames])
    const maxIndex = Math.max(1, Math.floor((decoys.length + 1) * 0.75))
    decoys.splice(Math.floor(Math.random() * maxIndex), 0, TARGET_APP)
    return decoys
  })

  // Extra hunt time is phone-only; short desktops keep the 8s cadence.
  const duration = isNarrow ? 16 : 8
  // 4 columns on a 360–390 phone makes 6-digit codes collide with the timer.
  const phoneCols = viewportWidth > 0 && viewportWidth < 420 ? 3 : 4
  const dense = isNarrow && phoneCols === 3
  return (
    <>
      <p className="text-lg">Enter the code from your Authenticator App.</p>
      <PinInput value={codeInput} onChange={handleInputChange} onSubmit={handleLevelAdvance} />
      <ExtrasPortal>
        <div
          className={classNames({
            'grid w-[var(--tfa-auth-width,100%)]': isNarrow,
            'grid-cols-3': isNarrow && phoneCols === 3,
            'grid-cols-4': isNarrow && phoneCols === 4,
            'flex w-full flex-wrap justify-center': !isNarrow,
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
                compact={isCompact}
                fill={isNarrow}
                dense={dense}
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
  /** Stretch to the grid cell (phone columns). Desktop tiles hug their content. */
  fill?: boolean
  /** Fewer columns on a small phone — slightly smaller type so the code still fits. */
  dense?: boolean
}

export const AppCode = ({
  title,
  codeDefault,
  isTarget,
  setTargetCode,
  duration,
  isDelayed,
  compact,
  fill,
  dense,
}: AppCodeProps) => {
  const [elapsed, setElapsed] = useState(0)
  const [code, setCode] = useState(isTarget ? codeDefault : makeAuthCode(6))
  const intervalRef = useRef<NodeJS.Timeout>(null)
  const timeoutRef = useRef<NodeJS.Timeout>(null)
  const periodRef = useRef(0)

  useEffect(() => {
    const startDelay = isDelayed ? Math.random() * 5000 : 0

    timeoutRef.current = setTimeout(() => {
      const start = Date.now()
      periodRef.current = 0
      intervalRef.current = setInterval(() => {
        const diff = (Date.now() - start) / 1000
        const period = Math.floor(diff / duration)
        if (period > periodRef.current) {
          periodRef.current = period
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

  const size = dense ? 20 : compact ? 24 : 40
  const radius = dense ? 7 : compact ? 9 : 20
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
        'flex flex-col justify-center px-1.5 py-1.5': compact,
        'h-full w-full min-w-0': compact && fill,
        'w-max': compact && !fill,
        'flex items-center justify-between p-2 gap-4': !compact,
      })}
    >
      {compact ? (
        <>
          <div className={classNames('truncate leading-none', dense ? 'text-[10px]' : 'text-xs')}>
            {title}
          </div>
          <div className="flex min-w-0 items-center justify-between gap-1">
            <div
              className={classNames('mono tabular-nums leading-none', dense ? 'text-sm' : 'text-lg')}
              style={{ color }}
            >
              {code}
            </div>
            <svg width={size} height={size} className="block shrink-0">
              <path d={pathData} fill={color} />
            </svg>
          </div>
        </>
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
