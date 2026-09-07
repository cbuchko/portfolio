import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ContentProps, ControlProps } from './types'
import './ups-finish/night-manor.css'
import classNames from 'classnames'
import { useMusic, playSfx } from '@/app/utils/audio'
import { PlayerInformation } from '../player-constants'
import {
  ACTION_COPY,
  getDecoText,
  getSessionExamine,
  getUseOnFailure,
  INTRO_COPY,
  itemLabel,
  parsePlayerZodiac,
  POST_IT_DECOY_CODES,
  SCENE_PROP_COPY,
  UI_COPY,
  WORLD_PICKUPS,
} from './ups-finish/copy'
import { useTypewriter } from './ups-finish/hooks'
import {
  atCursor,
  clampMobilePan,
  generateDecoLayout,
  generateMobilePropLayout,
  generatePropLayout,
  getMobilePanMetrics,
  layoutOverlapsAuth,
  layoutPropsTooDense,
  measureAuthExclusion,
  spawnPosStyle,
} from './ups-finish/spawn-layout'
import {
  CONE_DESKTOP,
  CONE_MOBILE,
  DECO_PROP_ORDER,
  FLASHLIGHT_ENABLED,
  MOBILE_PAN_THRESHOLD,
  shuffleOrder,
} from './ups-finish/prop-config'
import type {
  DecoSpawnId,
  ItemId,
  KioskState,
  MobilePanMetrics,
  Point,
  PropSpawnId,
  SpawnPos,
  TargetId,
  TrimmerHalfId,
} from './ups-finish/types'
import { setSharedKioskState, useKioskState } from './ups-finish/kiosk-state'
import { getAssetDisplay, getBushAssetId, prefetchPropImages, SFX } from './ups-finish/assets'
import { worldPropOuterStyle } from './ups-finish/prop-display'
import {
  BushVisual,
  CursorHeldItem,
  DecoPropVisual,
  InventoryItemIcon,
  ScenePropVisual,
  ShovelVisual,
  TrimmersVisual,
  PropImage,
} from './ups-finish/visuals'

const isTrimmerHalf = (id: ItemId | TargetId): id is TrimmerHalfId =>
  id === 'trimmersPartA' || id === 'trimmersPartB'

export const UPSFinishContent = ({
  handleLevelAdvance,
  validateAdvance,
  setIsLoading,
  setUPSTrackingCode,
  setUPSTrackingTime,
  isMobile,
  playerId,
}: ContentProps) => {
  const mobile = !!isMobile
  const coneRadius = mobile ? CONE_MOBILE : CONE_DESKTOP
  const kiosk = useKioskState()
  const flashlightOn = FLASHLIGHT_ENABLED && kiosk !== 'cut'

  // Generate desktop layouts once — never inside the render body (flashlight moves every frame).
  const [desktopLayouts] = useState(() => {
    if (mobile) return null
    const puzzle = generatePropLayout()
    return { puzzle, deco: generateDecoLayout(puzzle, false) }
  })

  const dvdTitles = useMemo(() => {
    const answers = PlayerInformation[playerId].imdb.map((entry) => entry.answer)
    const [filmDvd, nightManorDvd] = shuffleOrder(answers)
    return {
      filmDvd: filmDvd ?? 'Unknown Title',
      nightManorDvd: nightManorDvd ?? filmDvd ?? 'Unknown Title',
    }
  }, [playerId])
  const postItDecoy = useMemo(
    () => POST_IT_DECOY_CODES[Math.floor(Math.random() * POST_IT_DECOY_CODES.length)],
    []
  )
  const zodiac = useMemo(() => parsePlayerZodiac(PlayerInformation[playerId].zodiac), [playerId])

  const decoCopyContext = useMemo(
    () => ({ dvdTitles, postItDecoy, zodiac }),
    [dvdTitles, postItDecoy, zodiac]
  )

  const [mounted, setMounted] = useState(false)
  const [pointer, setPointer] = useState<Point>({ x: -200, y: -200 })
  const [cone, setCone] = useState<Point>({ x: -200, y: -200 })
  const [inventory, setInventory] = useState<ItemId[]>([])
  const [holding, setHolding] = useState<ItemId | null>(null)
  const [toolboxOpen, setToolboxOpen] = useState(false)
  const [boxFreed, setBoxFreed] = useState(false)
  const [dirtDug, setDirtDug] = useState(false)
  const [garbageRummaged, setGarbageRummaged] = useState(false)
  const [tapedTrimmerHalf, setTapedTrimmerHalf] = useState<TrimmerHalfId | null>(null)
  const [packageOpened, setPackageOpened] = useState(false)
  const [worldGone, setWorldGone] = useState<Partial<Record<ItemId, boolean>>>({})
  const [message, setMessage] = useState<string>(INTRO_COPY.body)
  const [showText, setShowText] = useState(true)
  const [cursorReady, setCursorReady] = useState(false)
  const [overHotspot, setOverHotspot] = useState(false)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [mobileMetrics, setMobileMetrics] = useState<MobilePanMetrics | null>(null)
  const [propLayout, setPropLayout] = useState<Record<PropSpawnId, SpawnPos> | null>(
    () => desktopLayouts?.puzzle ?? null
  )
  const [decoLayout, setDecoLayout] = useState<Record<DecoSpawnId, SpawnPos> | null>(
    () => desktopLayouts?.deco ?? null
  )

  const sceneRef = useRef<HTMLDivElement>(null)
  const matRef = useRef<HTMLDivElement>(null)
  const toolboxRef = useRef<HTMLDivElement>(null)
  const hedgeRef = useRef<HTMLDivElement>(null)
  const dirtRef = useRef<HTMLDivElement>(null)
  const garbageCanRef = useRef<HTMLDivElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const decoRefs = useRef<Partial<Record<DecoSpawnId, HTMLDivElement | null>>>({})
  const itemRefs = useRef<Partial<Record<ItemId, HTMLDivElement | null>>>({})
  const wonRef = useRef(false)
  const pointerRef = useRef(pointer)
  const coneRef = useRef(cone)
  const musicStartedRef = useRef(false)
  const panRef = useRef(pan)
  const mobileMetricsRef = useRef(mobileMetrics)
  const mobileLayoutReadyRef = useRef(false)
  const lastTapRef = useRef<Point>({ x: -1, y: -1 })
  const messageSourceRef = useRef<string | null>(null)
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    moved: false,
  })
  const inventoryRef = useRef(inventory)
  const holdingRef = useRef(holding)
  inventoryRef.current = inventory
  holdingRef.current = holding
  pointerRef.current = pointer
  coneRef.current = cone
  panRef.current = pan
  mobileMetricsRef.current = mobileMetrics

  const {
    play: playSoundtrack,
    stop: stopSoundtrack,
    isPlaying: isMusicPlaying,
  } = useMusic('nightManor')

  const dismissText = useCallback(() => {
    // Never reveal an empty inventory — keep the opening message up until the player has items.
    if (inventoryRef.current.length === 0) {
      messageSourceRef.current = null
      setMessage(INTRO_COPY.body)
      setShowText(true)
      return
    }
    setShowText(false)
  }, [])

  const { visible: typedMessage, done: typingDone, complete: completeTyping } = useTypewriter(
    message,
    showText
  )

  const say = useCallback((text: string, source?: string) => {
    messageSourceRef.current = source ?? null
    setMessage(text)
    setShowText(true)
  }, [])

  /** Same object that opened the line: finish typewriter, then dismiss, then replay. */
  const consumePromptClick = (source: string) => {
    if (!showText || messageSourceRef.current !== source) return false
    if (!typingDone) completeTyping()
    else dismissText()
    return true
  }

  /** Start music on a real user gesture; safe to call repeatedly until it sticks. */
  const ensureMusic = useCallback(() => {
    if (wonRef.current) return
    if (isMusicPlaying()) {
      musicStartedRef.current = true
      return
    }
    // Do not latch on failed autoplay — browsers block play() outside a gesture.
    musicStartedRef.current = false
    playSoundtrack()
  }, [isMusicPlaying, playSoundtrack])

  const handleTextClick = useCallback(() => {
    ensureMusic()
    if (!typingDone) {
      completeTyping()
      return
    }
    dismissText()
  }, [typingDone, completeTyping, dismissText, ensureMusic])

  useEffect(() => {
    setMounted(true)
    setIsLoading(false)
    setUPSTrackingCode('')
    setUPSTrackingTime(0)
  }, [setIsLoading, setUPSTrackingCode, setUPSTrackingTime])

  useEffect(() => {
    if (!mounted) return
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      putAwayHeld()
    }
    window.addEventListener('contextmenu', onContextMenu)
    return () => window.removeEventListener('contextmenu', onContextMenu)
  }, [mounted])

  useEffect(() => {
    prefetchPropImages()
  }, [])

  const updateKiosk = (next: KioskState) => setSharedKioskState(next)

  useEffect(() => {
    return () => {
      setSharedKioskState('plate')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (mobile) {
      setCursorReady(true)
      return
    }
    const uiFraction = 0.25
    const syncPointer = (e: PointerEvent) => {
      const next = { x: e.clientX, y: e.clientY }
      pointerRef.current = next
      setPointer(next)
      setCursorReady(true)

      if (FLASHLIGHT_ENABLED) {
        if (next.y < window.innerHeight * (1 - uiFraction)) {
          coneRef.current = next
          setCone(next)
        }
      } else {
        coneRef.current = next
        setCone(next)
      }
    }
    // pointermove is NOT a user gesture — only start music from pointerdown.
    const onPointerDown = (e: PointerEvent) => {
      syncPointer(e)
      ensureMusic()
    }
    window.addEventListener('pointermove', syncPointer)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('pointermove', syncPointer)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [mounted, mobile, ensureMusic])

  useEffect(() => {
    if (!mounted || !mobile) return
    const scene = sceneRef.current
    if (!scene) return

    const root = document.documentElement
    root.style.setProperty('--nm-pan-x', `${panRef.current.x}px`)
    root.style.setProperty('--nm-pan-y', `${panRef.current.y}px`)
    root.style.setProperty('--nm-ui-h', '28vh')
    document.body.classList.add('nm-mobile-pan')

    const syncScene = () => {
      const w = scene.clientWidth
      const h = scene.clientHeight
      if (w < 1 || h < 1) return

      const base = getMobilePanMetrics(w, h)
      const authExclusion = measureAuthExclusion(scene, base, panRef.current)
      const metrics: MobilePanMetrics = { ...base, authExclusion }
      setMobileMetrics(metrics)

      if (!mobileLayoutReadyRef.current) {
        let layout = generateMobilePropLayout(metrics)
        for (
          let attempt = 0;
          attempt < 12 &&
          (layoutOverlapsAuth(layout, metrics) || layoutPropsTooDense(layout, metrics));
          attempt += 1
        ) {
          layout = generateMobilePropLayout(metrics)
        }
        setPropLayout(layout)
        setDecoLayout(generateDecoLayout(layout, true, metrics))
        mobileLayoutReadyRef.current = true
      }

      const next = clampMobilePan(panRef.current.x, panRef.current.y, metrics.R)
      panRef.current = next
      setPan(next)
    }

    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(syncScene)
    })

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(syncScene)
    })
    observer.observe(scene)

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      observer.disconnect()
      mobileLayoutReadyRef.current = false
    }
  }, [mounted, mobile])

  useEffect(() => {
    if (!mounted || !mobile) return
    const root = document.documentElement
    root.style.setProperty('--nm-pan-x', `${pan.x}px`)
    root.style.setProperty('--nm-pan-y', `${pan.y}px`)
    root.style.setProperty('--nm-ui-h', '28vh')
    document.body.classList.add('nm-mobile-pan')
    return () => {
      root.style.removeProperty('--nm-pan-x')
      root.style.removeProperty('--nm-pan-y')
      root.style.removeProperty('--nm-ui-h')
      document.body.classList.remove('nm-mobile-pan')
    }
  }, [mounted, mobile, pan.x, pan.y])

  const getAimPoint = useCallback((): Point => {
    if (mobile) return lastTapRef.current
    return flashlightOn ? coneRef.current : pointerRef.current
  }, [mobile, flashlightOn])

  /** Mobile flashlight is fixed at the center of the playfield (above the UI band). */
  const getMobileFlashlightCenter = useCallback((): Point => {
    const scene = sceneRef.current
    if (!scene) return { x: -1, y: -1 }
    const rect = scene.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }, [])

  /** Soft radius — inside the fully black ring so only reasonably lit taps count. */
  const isTapInFlashlight = useCallback(
    (tap: Point) => {
      if (!flashlightOn || !mobile) return true
      const center = getMobileFlashlightCenter()
      if (center.x < 0) return false
      const softRadius = coneRadius * 0.82
      return Math.hypot(tap.x - center.x, tap.y - center.y) <= softRadius
    },
    [flashlightOn, mobile, coneRadius, getMobileFlashlightCenter]
  )

  const takeItem = (id: ItemId, label: string) => {
    setInventory((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setWorldGone((prev) => ({ ...prev, [id]: true }))
    playSfx(SFX.pickup, { volume: 0.4 })
    say(UI_COPY.taken(label), id)
  }

  const holdItem = (id: ItemId) => {
    setHolding(id)
    say(UI_COPY.holdItem(itemLabel(id)), id)
  }

  const putAwayHeld = () => {
    const id = holdingRef.current
    if (!id) return false
    setHolding(null)
    say(UI_COPY.putAway, id)
    return true
  }

  const examineDeco = (id: DecoSpawnId) => {
    if (holding) {
      say(UI_COPY.useless, id)
      return
    }
    say(getDecoText(id, decoCopyContext), id)
  }

  const openToolboxWithKey = () => {
    if (toolboxOpen || !inventoryRef.current.includes('toolboxKey')) return
    setToolboxOpen(true)
    setInventory((prev) => (prev.includes('cutter') ? prev : [...prev, 'cutter']))
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(SCENE_PROP_COPY.toolbox.unlocked, 'toolbox')
  }

  const openPackageWithCutter = () => {
    if (!inventoryRef.current.includes('box') || packageOpened) return
    setPackageOpened(true)
    setInventory((prev) => {
      const next: ItemId[] = prev.filter((i) => i !== 'box')
      if (!next.includes('screwdriver')) next.push('screwdriver')
      if (!next.includes('packingSlip')) next.push('packingSlip')
      return next
    })
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(ACTION_COPY.openPackage, 'box')
  }

  const cutBoxFree = () => {
    if (boxFreed) {
      say(
        boxFreed && worldGone.box ? SCENE_PROP_COPY.hedge.emptied : SCENE_PROP_COPY.hedge.freed,
        'hedge'
      )
      return
    }
    setBoxFreed(true)
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(ACTION_COPY.cutHedge, 'hedge')
  }

  const unscrewKeyhole = () => {
    if (kiosk !== 'plate') return
    updateKiosk('exposed')
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(SCENE_PROP_COPY.session.unscrewed, 'session')
  }

  const cutKioskWire = () => {
    if (kiosk !== 'exposed') return
    updateKiosk('cut')
    setHolding(null)
    wonRef.current = true
    stopSoundtrack()
    playSfx(SFX.wireCut, { volume: 0.2 })
    say(SCENE_PROP_COPY.session.wireCut, 'session')
    validateAdvance()
  }

  const getAuthSubmitRects = () =>
    [...document.querySelectorAll<HTMLElement>('#auth-controls .auth-button')].map((el) =>
      el.getBoundingClientRect()
    )

  const atSubmit = (cursor: Point, pad: number) =>
    getAuthSubmitRects().some((rect) => atCursor(cursor, rect, pad))

  const digDirtMound = () => {
    if (dirtDug) return
    setDirtDug(true)
    setInventory((prev) =>
      prev.includes('trimmersPartA') ? prev : [...prev, 'trimmersPartA']
    )
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(SCENE_PROP_COPY.dirtMound.dugOutcome, 'dirtMound')
  }

  const combineTrimmers = () => {
    const inv = inventoryRef.current
    if (!inv.includes('trimmersPartA') || !inv.includes('trimmersPartB')) return false

    if (!tapedTrimmerHalf) {
      say(ACTION_COPY.trimmersNeedTape, 'trimmers')
      return true
    }

    setInventory((prev) => {
      const withoutParts = prev.filter((i) => i !== 'trimmersPartA' && i !== 'trimmersPartB')
      return withoutParts.includes('trimmers') ? withoutParts : [...withoutParts, 'trimmers']
    })
    setTapedTrimmerHalf(null)
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(ACTION_COPY.combineTrimmers, 'trimmers')
    return true
  }

  const tapeTrimmerHalf = (half: TrimmerHalfId) => {
    const inv = inventoryRef.current
    if (!inv.includes('ductTape') || !inv.includes(half) || tapedTrimmerHalf) return false
    setTapedTrimmerHalf(half)
    setHolding(null)
    playSfx(SFX.use, { volume: 0.35 })
    say(ACTION_COPY.tapeTrimmer, 'ductTape')
    return true
  }

  const rummageGarbageCan = () => {
    if (garbageRummaged) return
    setGarbageRummaged(true)
    setInventory((prev) => (prev.includes('ductTape') ? prev : [...prev, 'ductTape']))
    playSfx(SFX.pickup, { volume: 0.4 })
    say(SCENE_PROP_COPY.garbageCan.foundTape, 'garbageCan')
  }

  const takeBoxFromHedge = () => {
    if (worldGone.box || !boxFreed) return
    setInventory((prev) => (prev.includes('box') ? prev : [...prev, 'box']))
    setWorldGone((prev) => ({ ...prev, box: true }))
    playSfx(SFX.pickup, { volume: 0.4 })
    say(SCENE_PROP_COPY.hedge.taken, 'hedge')
  }

  const useOn = (target: TargetId) => {
    if (!holding) return false

    const openingPackage =
      (holding === 'cutter' && target === 'box') || (holding === 'box' && target === 'cutter')
    if (openingPackage) {
      openPackageWithCutter()
      return true
    }

    if (holding === 'toolboxKey' && target === 'toolbox') {
      openToolboxWithKey()
      return true
    }

    if (holding === 'trimmers' && target === 'hedge') {
      cutBoxFree()
      return true
    }

    if (holding === 'shovel' && target === 'dirtMound') {
      digDirtMound()
      return true
    }

    const tapingWithTape = holding === 'ductTape' && isTrimmerHalf(target)
    if (tapingWithTape) {
      tapeTrimmerHalf(target)
      return true
    }

    const tapingWithPart = isTrimmerHalf(holding) && target === 'ductTape'
    if (tapingWithPart) {
      tapeTrimmerHalf(holding)
      return true
    }

    const joiningTrimmers =
      (holding === 'trimmersPartA' && target === 'trimmersPartB') ||
      (holding === 'trimmersPartB' && target === 'trimmersPartA')
    if (joiningTrimmers) {
      combineTrimmers()
      return true
    }

    if (target === 'session') {
      if (holding === 'screwdriver') {
        if (kiosk === 'plate') unscrewKeyhole()
        else say(SCENE_PROP_COPY.session.nothingToUnscrew, 'session')
        return true
      }
      if (holding === 'trimmers') {
        if (kiosk === 'exposed') cutKioskWire()
        else if (kiosk === 'cut') say(SCENE_PROP_COPY.session.alreadyDead, 'session')
        else say(SCENE_PROP_COPY.session.plateStillOn, 'session')
        return true
      }
    }

    const failure = getUseOnFailure(holding, target)
    if (failure) {
      say(failure, target)
      return true
    }

    say(UI_COPY.nothingHappens, target)
    return true
  }

  const activateTarget = (
    target: TargetId,
    opts: { examine: string; takeId?: ItemId; takeLabel?: string }
  ) => {
    if (holding) {
      useOn(target)
      return
    }

    const { takeId, takeLabel } = opts
    if (takeId && takeLabel && !worldGone[takeId]) {
      takeItem(takeId, takeLabel)
      return
    }

    say(opts.examine, target)
  }

  const onInventoryClick = (id: ItemId) => {
    if (id === 'packingSlip') {
      if (holding && holding !== 'packingSlip') {
        useOn('packingSlip')
        return
      }
      setHolding(null)
      say(ACTION_COPY.readSlip, id)
      return
    }
    if (holding) {
      if (holding === id) {
        putAwayHeld()
        return
      }
      useOn(id as TargetId)
      return
    }
    holdItem(id)
  }

  const isOverInteractable = useCallback(
    (cursor: Point) => {
      if (cursor.x < 0) return false
      const hitPad = mobile ? 14 : 8
      const sessionPad = mobile ? 18 : 10

      for (const pickup of WORLD_PICKUPS) {
        if (worldGone[pickup.id]) continue
        if (atCursor(cursor, itemRefs.current[pickup.id]?.getBoundingClientRect(), hitPad)) {
          return true
        }
      }

      const sceneRects = [
        hedgeRef.current,
        matRef.current,
        toolboxRef.current,
        dirtRef.current,
        garbageCanRef.current,
      ]
      if (sceneRects.some((el) => atCursor(cursor, el?.getBoundingClientRect(), hitPad))) {
        return true
      }
      if (atCursor(cursor, dropzoneRef.current?.getBoundingClientRect(), sessionPad)) {
        return true
      }
      if (kiosk === 'cut' && atSubmit(cursor, sessionPad)) {
        return true
      }
      return DECO_PROP_ORDER.some((decoId) =>
        atCursor(cursor, decoRefs.current[decoId]?.getBoundingClientRect(), hitPad)
      )
    },
    [mobile, worldGone, kiosk]
  )

  useEffect(() => {
    if (!cursorReady) return
    const cursor = mobile ? getMobileFlashlightCenter() : pointer
    const next = isOverInteractable(cursor)
    setOverHotspot((prev) => (prev === next ? prev : next))
  }, [
    cursorReady,
    mobile,
    pointer,
    pan.x,
    pan.y,
    worldGone,
    propLayout,
    decoLayout,
    isOverInteractable,
    getMobileFlashlightCenter,
  ])

  const handlePlayClick = () => {
    ensureMusic()

    const cursor = getAimPoint()
    if (!cursorReady || cursor.x < 0) {
      if (showText) {
        if (!typingDone) completeTyping()
        else dismissText()
      }
      return
    }

    // Mobile: only interact with what you can see in the flashlight.
    // Tap position still aims the click; the cone stays centered.
    if (!isTapInFlashlight(cursor)) {
      if (showText) {
        if (!typingDone) completeTyping()
        else dismissText()
      }
      return
    }

    const hitPad = mobile ? 14 : 8
    let acted = false

    for (const pickup of WORLD_PICKUPS) {
      if (worldGone[pickup.id]) continue
      const rect = itemRefs.current[pickup.id]?.getBoundingClientRect()
      if (atCursor(cursor, rect, hitPad)) {
        if (!consumePromptClick(pickup.id)) {
          if (holding) useOn(pickup.id as TargetId)
          else takeItem(pickup.id, itemLabel(pickup.id))
        }
        acted = true
        break
      }
    }

    if (!acted && atCursor(cursor, hedgeRef.current?.getBoundingClientRect(), hitPad)) {
      if (!consumePromptClick('hedge')) {
        if (holding) useOn('hedge')
        else if (worldGone.box) say(SCENE_PROP_COPY.hedge.emptied, 'hedge')
        else if (boxFreed) takeBoxFromHedge()
        else say(SCENE_PROP_COPY.hedge.blocked, 'hedge')
      }
      acted = true
    }

    if (!acted && atCursor(cursor, matRef.current?.getBoundingClientRect(), hitPad)) {
      if (!consumePromptClick('mat')) {
        if (holding) useOn('mat')
        else if (!worldGone.toolboxKey) {
          setInventory((prev) => (prev.includes('toolboxKey') ? prev : [...prev, 'toolboxKey']))
          setWorldGone((prev) => ({ ...prev, toolboxKey: true }))
          playSfx(SFX.pickup, { volume: 0.4 })
          say(SCENE_PROP_COPY.mat.foundKey, 'mat')
        } else {
          activateTarget('mat', { examine: SCENE_PROP_COPY.mat.examine })
        }
      }
      acted = true
    }

    if (!acted && atCursor(cursor, toolboxRef.current?.getBoundingClientRect(), hitPad)) {
      if (!consumePromptClick('toolbox')) {
        if (holding) useOn('toolbox')
        else {
          activateTarget('toolbox', {
            examine: toolboxOpen
              ? SCENE_PROP_COPY.toolbox.open
              : SCENE_PROP_COPY.toolbox.locked,
          })
        }
      }
      acted = true
    }

    if (!acted && atCursor(cursor, dirtRef.current?.getBoundingClientRect(), hitPad)) {
      if (!consumePromptClick('dirtMound')) {
        if (holding) useOn('dirtMound')
        else {
          activateTarget('dirtMound', {
            examine: dirtDug ? SCENE_PROP_COPY.dirtMound.dug : SCENE_PROP_COPY.dirtMound.buried,
          })
        }
      }
      acted = true
    }

    if (!acted && atCursor(cursor, garbageCanRef.current?.getBoundingClientRect(), hitPad)) {
      if (!consumePromptClick('garbageCan')) {
        if (holding) useOn('garbageCan')
        else if (!garbageRummaged) rummageGarbageCan()
        else activateTarget('garbageCan', { examine: SCENE_PROP_COPY.garbageCan.rummaged })
      }
      acted = true
    }

    if (
      !acted &&
      atCursor(cursor, dropzoneRef.current?.getBoundingClientRect(), mobile ? 18 : 10)
    ) {
      if (!consumePromptClick('session')) {
        if (holding) useOn('session')
        else activateTarget('session', { examine: getSessionExamine(kiosk, packageOpened) })
      }
      acted = true
    }

    if (!acted && kiosk === 'cut' && atSubmit(cursor, mobile ? 18 : 10)) {
      handleLevelAdvance()
      acted = true
    }

    if (!acted) {
      for (const decoId of DECO_PROP_ORDER) {
        const rect = decoRefs.current[decoId]?.getBoundingClientRect()
        if (atCursor(cursor, rect, hitPad)) {
          if (!consumePromptClick(decoId)) examineDeco(decoId)
          acted = true
          break
        }
      }
    }

    if (acted) return

    // Blank space: advance/dismiss narrative only
    if (showText) {
      if (!typingDone) completeTyping()
      else dismissText()
    }
  }

  const handlePlayPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    ensureMusic()
    if (!mobile) return
    lastTapRef.current = { x: e.clientX, y: e.clientY }
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePlayPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!mobile || !dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (!dragRef.current.moved && Math.hypot(dx, dy) < MOBILE_PAN_THRESHOLD) return
    dragRef.current.moved = true
    const metrics = mobileMetricsRef.current
    if (!metrics) return
    const next = clampMobilePan(
      dragRef.current.startPanX + dx,
      dragRef.current.startPanY + dy,
      metrics.R
    )
    panRef.current = next
    setPan(next)
  }

  const handlePlayPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!mobile || !dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return
    const moved = dragRef.current.moved
    dragRef.current.active = false
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (!moved) {
      lastTapRef.current = { x: e.clientX, y: e.clientY }
      handlePlayClick()
    }
  }

  const posStyle = (id: PropSpawnId) => spawnPosStyle(propLayout?.[id])
  const decoStyle = (id: DecoSpawnId) => spawnPosStyle(decoLayout?.[id])

  const invRows = mobile && inventory.length >= 6 ? 2 : 1
  const inventoryStyle = {
    '--nm-inv-count': Math.max(inventory.length, 1),
    '--nm-inv-rows': invRows,
    '--nm-inv-cols': Math.ceil(Math.max(inventory.length, 1) / invRows),
  } as CSSProperties

  const worldTransform =
    mobile && mobileMetrics
      ? {
          width: mobileMetrics.worldW,
          height: mobileMetrics.worldH,
          transform: `translate(${mobileMetrics.baseX + pan.x}px, ${mobileMetrics.baseY + pan.y}px)`,
        }
      : undefined

  return (
    <>
      <p className="text-lg">{INTRO_COPY.headline}</p>
      <div
        ref={dropzoneRef}
        className={classNames('nm-key-dropzone', {
          'nm-key-dropzone--holding':
            (holding === 'screwdriver' && kiosk === 'plate') ||
            (holding === 'trimmers' && kiosk === 'exposed'),
          'nm-key-dropzone--mobile': mobile,
          'nm-key-dropzone--exposed': kiosk === 'exposed',
          'nm-key-dropzone--cut': kiosk === 'cut',
        })}
        aria-hidden
      >
        {kiosk === 'plate' ? (
          <>
            <PropImage assetId="keyhole" />
            <span className="nm-key-screws" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
          </>
        ) : (
          <span className="nm-key-wires" aria-hidden>
            {(['r', 'b', 'y'] as const).map((color) => (
              <span key={color} className={classNames('nm-key-wire', `nm-key-wire--${color}`)}>
                <i className="nm-key-wire-end" />
                <i className="nm-key-wire-run" />
                <i className="nm-key-wire-gap" />
                <i className="nm-key-wire-run nm-key-wire-run--lower" />
                <i className="nm-key-wire-end" />
              </span>
            ))}
          </span>
        )}
      </div>
      {mounted &&
        createPortal(
          <div
            className={classNames('nm-dark', {
              'nm-dark--mobile': mobile,
              'nm-dark--lit': !flashlightOn,
              'nm-dark--hot': overHotspot && !holding,
            })}
          >
            <div className="nm-scene" ref={sceneRef}>
              <div
                className={classNames('nm-world', { 'nm-world--mobile': mobile })}
                style={worldTransform}
              >
                {propLayout &&
                  WORLD_PICKUPS.map((pickup) => {
                    if (worldGone[pickup.id]) return null

                    if (pickup.visual === 'shovel') {
                      return (
                        <div
                          key={pickup.id}
                          ref={(el) => {
                            itemRefs.current.shovel = el
                          }}
                          className="nm-prop-visual nm-prop nm-prop--shovel"
                          style={{
                            ...posStyle(pickup.spawnId),
                            ...worldPropOuterStyle(getAssetDisplay('shovel'), mobile),
                          }}
                          aria-hidden
                        >
                          <ShovelVisual context="world" mobile={mobile} />
                        </div>
                      )
                    }

                    return (
                      <div
                        key={pickup.id}
                        ref={(el) => {
                          itemRefs.current.trimmersPartB = el
                        }}
                        className="nm-prop-visual nm-prop nm-prop--trimmers"
                        style={{
                          ...posStyle(pickup.spawnId),
                          ...worldPropOuterStyle(getAssetDisplay('trimmersPartB'), mobile),
                        }}
                        aria-hidden
                      >
                        <TrimmersVisual context="world" half="body" mobile={mobile} />
                      </div>
                    )
                  })}

                {propLayout && (
                  <>
                    <div
                      ref={dirtRef}
                      className={classNames('nm-prop-visual', 'nm-dirt-mound', {
                        'nm-dirt-mound--dug': dirtDug,
                      })}
                      style={posStyle('dirtMound')}
                      aria-hidden
                    />

                    <div
                      ref={hedgeRef}
                      className="nm-prop-visual nm-prop nm-prop--bush"
                      style={{
                        ...posStyle('hedge'),
                        ...worldPropOuterStyle(
                          getAssetDisplay(getBushAssetId(boxFreed, !!worldGone.box)),
                          mobile
                        ),
                      }}
                      aria-hidden
                    >
                      <BushVisual
                        boxFreed={boxFreed}
                        boxTaken={!!worldGone.box}
                        mobile={mobile}
                      />
                    </div>

                    <div ref={matRef} className="nm-prop-visual nm-mat" style={posStyle('mat')}>
                      <span className="nm-mat-label" aria-hidden>
                        {'WELCOME'.split('').map((letter, index) => (
                          <span key={index}>{letter}</span>
                        ))}
                      </span>
                    </div>

                    <div
                      ref={toolboxRef}
                      className={classNames('nm-prop-visual nm-prop nm-prop--toolbox', {
                        'nm-prop--toolbox-open': toolboxOpen,
                      })}
                      style={{
                        ...posStyle('toolbox'),
                        ...worldPropOuterStyle(getAssetDisplay('toolbox'), mobile),
                      }}
                      aria-hidden
                    >
                      <ScenePropVisual assetId="toolbox" mobile={mobile} />
                    </div>

                    <div
                      ref={garbageCanRef}
                      className={classNames('nm-prop-visual nm-prop nm-prop--garbage-can', {
                        'nm-prop--garbage-can-rummaged': garbageRummaged,
                      })}
                      style={{
                        ...posStyle('garbageCan'),
                        ...worldPropOuterStyle(getAssetDisplay('garbageCan'), mobile),
                      }}
                      aria-hidden
                    >
                      <ScenePropVisual assetId="garbageCan" mobile={mobile} />
                    </div>

                    {decoLayout &&
                      DECO_PROP_ORDER.map((decoId) => (
                        <DecoPropVisual
                          key={decoId}
                          id={decoId}
                          style={decoStyle(decoId)}
                          ctx={decoCopyContext}
                          mobile={mobile}
                          ref={(el) => {
                            decoRefs.current[decoId] = el
                          }}
                        />
                      ))}
                  </>
                )}
              </div>

              <button
                type="button"
                className="nm-playfield"
                onClick={mobile ? undefined : handlePlayClick}
                onPointerDown={mobile ? handlePlayPointerDown : undefined}
                onPointerMove={mobile ? handlePlayPointerMove : undefined}
                onPointerUp={mobile ? handlePlayPointerUp : undefined}
                onPointerCancel={mobile ? handlePlayPointerUp : undefined}
                aria-label="Search the dark"
              />
            </div>

            {flashlightOn && (
              <div
                className={classNames('nm-cone', { 'nm-cone--mobile-center': mobile })}
                aria-hidden
                style={
                  mobile
                    ? {
                        background: `radial-gradient(circle ${coneRadius}px at 50% 50%, transparent 0%, transparent 38%, rgba(0, 0, 0, 0.35) 62%, #000 86%, #000 100%)`,
                      }
                    : {
                        background: `radial-gradient(circle ${coneRadius}px at ${cone.x}px ${cone.y}px, transparent 0%, transparent 38%, rgba(0, 0, 0, 0.35) 62%, #000 86%, #000 100%)`,
                      }
                }
              />
            )}

            {cursorReady && (flashlightOn || !mobile || holding) && (
              <div
                className={classNames('nm-cursor', {
                  'nm-cursor--holding': !!holding,
                  'nm-cursor--hot': overHotspot,
                  'nm-cursor--mobile-center': mobile && flashlightOn,
                })}
                style={mobile ? undefined : { left: pointer.x, top: pointer.y }}
                aria-hidden
              >
                {holding && (
                  <CursorHeldItem
                    holding={holding}
                    tapedTrimmerHalf={tapedTrimmerHalf}
                    mobile={mobile}
                  />
                )}
              </div>
            )}

            <div className="nm-ui">
              {inventory.length > 0 && (
                <div
                  className="nm-inventory"
                  aria-label="Inventory"
                  style={inventoryStyle}
                  hidden={showText}
                >
                  <div className="nm-inventory-slots">
                    {inventory.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={classNames('nm-inventory-item', {
                          'nm-inventory-item--held': holding === id,
                        })}
                        aria-label={itemLabel(id)}
                        aria-pressed={holding === id}
                        onClick={() => onInventoryClick(id)}
                      >
                        <InventoryItemIcon id={id} tapedTrimmerHalf={tapedTrimmerHalf} mobile={mobile} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {showText && (
                <button
                  type="button"
                  className="nm-message"
                  role="status"
                  onClick={handleTextClick}
                  aria-label="Dismiss text"
                >
                  <span className="nm-message-body">
                    {typedMessage}
                    {!typingDone && <span className="nm-message-caret">|</span>}
                  </span>
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export const UPSFinishControls = ({ handleLevelAdvance, setUPSTrackingTime }: ControlProps) => {
  const kiosk = useKioskState()
  if (kiosk !== 'cut') return null

  return (
    <>
      <div className="grow" />
      <button
        className="auth-button auth-button-primary"
        onClick={() => {
          setUPSTrackingTime(0)
          handleLevelAdvance()
        }}
      >
        Submit
      </button>
    </>
  )
}
