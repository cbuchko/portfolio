import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ContentProps, ControlProps } from './types'
import classNames from 'classnames'
import { useSound } from '@/app/utils/useSounds'
import { PlayerInformation } from '../player-constants'
import {
  ACTION_COPY,
  getDecoText,
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
  MobilePanMetrics,
  Point,
  PropSpawnId,
  SpawnPos,
  TargetId,
  TrimmerHalfId,
} from './ups-finish/types'
import { getAssetDisplay, getBushAssetId } from './ups-finish/assets'
import { getCssItemDisplay } from './ups-finish/css-item-display'
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
  setUPSTrackingTime,
  upsTrackingCode,
  isMobile,
  playerId,
}: ContentProps) => {
  const mobile = !!isMobile
  const coneRadius = mobile ? CONE_MOBILE : CONE_DESKTOP

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
  const [worldGone, setWorldGone] = useState<Partial<Record<ItemId, boolean>>>({})
  const [message, setMessage] = useState<string>(mobile ? INTRO_COPY.mobile : INTRO_COPY.desktop)
  const [showText, setShowText] = useState(true)
  const [cursorReady, setCursorReady] = useState(false)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [mobileMetrics, setMobileMetrics] = useState<MobilePanMetrics | null>(null)
  const [propLayout, setPropLayout] = useState<Record<PropSpawnId, SpawnPos> | null>(
    () => desktopLayouts?.puzzle ?? null
  )
  const [decoLayout, setDecoLayout] = useState<Record<DecoSpawnId, SpawnPos> | null>(
    () => desktopLayouts?.deco ?? null
  )

  const sceneRef = useRef<HTMLDivElement>(null)
  const envelopeRef = useRef<HTMLDivElement>(null)
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
  inventoryRef.current = inventory
  pointerRef.current = pointer
  coneRef.current = cone
  panRef.current = pan
  mobileMetricsRef.current = mobileMetrics

  const {
    playSound: playSoundtrack,
    stopSound: stopSoundtrack,
    isAudioPlayingRef: isMusicPlayingRef,
  } = useSound('/thirty-factor-authentication/sounds/night-manor-interior.mp3', 0.35, true)

  const tracking = upsTrackingCode || '1Z-AUTH-KEY'

  const dismissText = useCallback(() => setShowText(false), [])

  const { visible: typedMessage, done: typingDone, complete: completeTyping } = useTypewriter(
    message,
    showText
  )

  /** Start music on a real user gesture; safe to call repeatedly until it sticks. */
  const ensureMusic = useCallback(() => {
    if (wonRef.current) return
    if (isMusicPlayingRef.current) {
      musicStartedRef.current = true
      return
    }
    // Do not latch on failed autoplay — browsers block play() outside a gesture.
    musicStartedRef.current = false
    playSoundtrack()
  }, [isMusicPlayingRef, playSoundtrack])

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
  }, [setIsLoading])

  useEffect(() => {
    return () => {
      stopSoundtrack()
    }
  }, [stopSoundtrack])

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
    root.style.setProperty('--nm-ui-h', '24vh')
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
    root.style.setProperty('--nm-ui-h', '24vh')
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
    return FLASHLIGHT_ENABLED ? coneRef.current : pointerRef.current
  }, [mobile])

  const say = useCallback((text: string) => {
    setMessage(text)
    setShowText(true)
  }, [])

  const takeItem = (id: ItemId, label: string) => {
    setInventory((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setWorldGone((prev) => ({ ...prev, [id]: true }))
    say(UI_COPY.taken(label))
  }

  const holdItem = (id: ItemId) => {
    setHolding(id)
    say(UI_COPY.holdItem(itemLabel(id)))
  }

  const examineDeco = (id: DecoSpawnId) => {
    if (holding) {
      say(UI_COPY.useless)
      return
    }
    say(getDecoText(id, decoCopyContext))
  }

  const openToolboxWithKey = () => {
    if (toolboxOpen || !inventoryRef.current.includes('toolboxKey')) return
    setToolboxOpen(true)
    setInventory((prev) => {
      const withoutKey = prev.filter((i) => i !== 'toolboxKey')
      return withoutKey.includes('cutter') ? withoutKey : [...withoutKey, 'cutter']
    })
    setHolding(null)
    say(SCENE_PROP_COPY.toolbox.unlocked)
  }

  const openPackageWithCutter = () => {
    if (!inventoryRef.current.includes('box')) return
    setInventory((prev) => {
      const next = prev.filter((i) => i !== 'box' && i !== 'cutter')
      return next.includes('key') ? next : [...next, 'key']
    })
    setHolding(null)
    say(ACTION_COPY.openPackage)
  }

  const cutBoxFree = () => {
    if (boxFreed) return
    setBoxFreed(true)
    setInventory((prev) => prev.filter((i) => i !== 'trimmers'))
    setHolding(null)
    say(ACTION_COPY.cutHedge)
  }

  const digDirtMound = () => {
    if (dirtDug) return
    setDirtDug(true)
    setInventory((prev) => {
      const withoutShovel = prev.filter((i) => i !== 'shovel')
      return withoutShovel.includes('trimmersPartA')
        ? withoutShovel
        : [...withoutShovel, 'trimmersPartA']
    })
    setHolding(null)
    say(SCENE_PROP_COPY.dirtMound.dugOutcome)
  }

  const combineTrimmers = () => {
    const inv = inventoryRef.current
    if (!inv.includes('trimmersPartA') || !inv.includes('trimmersPartB')) return false

    if (!tapedTrimmerHalf) {
      say(ACTION_COPY.trimmersNeedTape)
      return true
    }

    setInventory((prev) => {
      const withoutParts = prev.filter((i) => i !== 'trimmersPartA' && i !== 'trimmersPartB')
      return withoutParts.includes('trimmers') ? withoutParts : [...withoutParts, 'trimmers']
    })
    setTapedTrimmerHalf(null)
    setHolding(null)
    say(ACTION_COPY.combineTrimmers)
    return true
  }

  const tapeTrimmerHalf = (half: TrimmerHalfId) => {
    const inv = inventoryRef.current
    if (!inv.includes('ductTape') || !inv.includes(half) || tapedTrimmerHalf) return false
    setInventory((prev) => prev.filter((i) => i !== 'ductTape'))
    setTapedTrimmerHalf(half)
    setHolding(null)
    say(ACTION_COPY.tapeTrimmer)
    return true
  }

  const rummageGarbageCan = () => {
    if (garbageRummaged) return
    setGarbageRummaged(true)
    setInventory((prev) => (prev.includes('ductTape') ? prev : [...prev, 'ductTape']))
    say(SCENE_PROP_COPY.garbageCan.foundTape)
  }

  const takeBoxFromHedge = () => {
    if (worldGone.box || !boxFreed) return
    takeItem('box', itemLabel('box'))
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

    if (holding === 'key' && target === 'session') {
      if (wonRef.current) return true
      wonRef.current = true
      setHolding(null)
      setInventory((prev) => prev.filter((i) => i !== 'key'))
      say(SCENE_PROP_COPY.session.win)
      validateAdvance()
      stopSoundtrack()
      setUPSTrackingTime(0)
      window.setTimeout(() => handleLevelAdvance(true), 700)
      return true
    }

    const failure = getUseOnFailure(holding, target)
    if (failure) {
      say(failure)
      return true
    }

    say(UI_COPY.nothingHappens)
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

    say(opts.examine)
  }

  const onInventoryClick = (id: ItemId) => {
    if (holding) {
      if (holding === id) {
        setHolding(null)
        say(UI_COPY.putAway)
        return
      }
      useOn(id as TargetId)
      return
    }
    holdItem(id)
  }

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

    const hitPad = mobile ? 14 : 8
    let acted = false

    for (const pickup of WORLD_PICKUPS) {
      if (worldGone[pickup.id]) continue
      const rect = itemRefs.current[pickup.id]?.getBoundingClientRect()
      if (atCursor(cursor, rect, hitPad)) {
        if (holding) useOn(pickup.id as TargetId)
        else takeItem(pickup.id, itemLabel(pickup.id))
        acted = true
        break
      }
    }

    if (!acted && atCursor(cursor, hedgeRef.current?.getBoundingClientRect(), hitPad)) {
      if (holding) useOn('hedge')
      else if (worldGone.box) say(SCENE_PROP_COPY.hedge.emptied)
      else if (boxFreed) takeBoxFromHedge()
      else say(SCENE_PROP_COPY.hedge.blocked)
      acted = true
    }

    if (!acted && atCursor(cursor, envelopeRef.current?.getBoundingClientRect(), hitPad)) {
      activateTarget('envelope', {
        examine: SCENE_PROP_COPY.envelope(tracking),
      })
      acted = true
    }

    if (!acted && atCursor(cursor, matRef.current?.getBoundingClientRect(), hitPad)) {
      if (holding) useOn('mat')
      else if (!worldGone.toolboxKey) {
        setInventory((prev) => (prev.includes('toolboxKey') ? prev : [...prev, 'toolboxKey']))
        setWorldGone((prev) => ({ ...prev, toolboxKey: true }))
        say(SCENE_PROP_COPY.mat.foundKey)
      } else {
        activateTarget('mat', { examine: SCENE_PROP_COPY.mat.examine })
      }
      acted = true
    }

    if (!acted && atCursor(cursor, toolboxRef.current?.getBoundingClientRect(), hitPad)) {
      if (holding) useOn('toolbox')
      else {
        activateTarget('toolbox', {
          examine: toolboxOpen
            ? SCENE_PROP_COPY.toolbox.open
            : SCENE_PROP_COPY.toolbox.locked,
        })
      }
      acted = true
    }

    if (!acted && atCursor(cursor, dirtRef.current?.getBoundingClientRect(), hitPad)) {
      if (holding) useOn('dirtMound')
      else {
        activateTarget('dirtMound', {
          examine: dirtDug ? SCENE_PROP_COPY.dirtMound.dug : SCENE_PROP_COPY.dirtMound.buried,
        })
      }
      acted = true
    }

    if (!acted && atCursor(cursor, garbageCanRef.current?.getBoundingClientRect(), hitPad)) {
      if (holding) useOn('garbageCan')
      else if (!garbageRummaged) rummageGarbageCan()
      else activateTarget('garbageCan', { examine: SCENE_PROP_COPY.garbageCan.rummaged })
      acted = true
    }

    if (
      !acted &&
      atCursor(cursor, dropzoneRef.current?.getBoundingClientRect(), mobile ? 18 : 10)
    ) {
      if (holding) useOn('session')
      else activateTarget('session', { examine: SCENE_PROP_COPY.session.examine })
      acted = true
    }

    if (!acted) {
      for (const decoId of DECO_PROP_ORDER) {
        const rect = decoRefs.current[decoId]?.getBoundingClientRect()
        if (atCursor(cursor, rect, hitPad)) {
          examineDeco(decoId)
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
          'nm-key-dropzone--holding': holding === 'key',
          'nm-key-dropzone--mobile': mobile,
        })}
        aria-hidden
      >
        <PropImage assetId="keyhole" />
      </div>
      {mounted &&
        createPortal(
          <div
            className={classNames('nm-dark', {
              'nm-dark--mobile': mobile,
              'nm-dark--lit': !FLASHLIGHT_ENABLED,
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

                    if (pickup.visual === 'trimmers-body') {
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
                    }

                    return (
                      <div
                        key={pickup.id}
                        ref={(el) => {
                          itemRefs.current[pickup.id] = el
                        }}
                        className={classNames('nm-prop-visual', 'nm-prop', `nm-prop--${pickup.id}`)}
                        style={{
                          ...posStyle(pickup.spawnId),
                          ...worldPropOuterStyle(getCssItemDisplay(pickup.id), mobile),
                        }}
                        aria-hidden
                      />
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

                    <div
                      ref={envelopeRef}
                      className="nm-prop-visual nm-envelope"
                      style={posStyle('envelope')}
                    >
                      <span className="nm-envelope-code">{tracking}</span>
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

            {FLASHLIGHT_ENABLED && (
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

            {cursorReady && (
              <div
                className={classNames('nm-cursor', {
                  'nm-cursor--holding': !!holding,
                  'nm-cursor--mobile-center': mobile,
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
              {showText ? (
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
              ) : (
                <div className="nm-inventory" aria-label="Inventory">
                  <div className="nm-inventory-slots">
                    {inventory.length === 0 && <span className="nm-inventory-empty">—</span>}
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
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export const UPSFinishControls = (_props: ControlProps) => {
  return null
}
