import classNames from 'classnames'
import Image from 'next/image'
import type { CSSProperties, ReactNode } from 'react'
import { forwardRef } from 'react'
import {
  DECO_ASSET_IDS,
  getAssetDisplay,
  getBushAssetId,
  getTrimmerAssetId,
  ITEM_ASSET_IDS,
  PROP_ASSETS,
  type PropAssetId,
  type ScenePropAssetId,
  type TrimmerVisualHalf,
} from './assets'
import { getCssItemDisplay } from './css-item-display'
import { DECO_VISUAL_CLASSES } from './prop-config'
import {
  propFrameClassName,
  propFrameStyle,
  type PropDisplayConfig,
  type PropDisplayContext,
  worldPropOuterStyle,
} from './prop-display'
import type { DecoCopyContext, DecoSpawnId, ItemId, TrimmerHalfId } from './types'

export const PropImage = ({ assetId, className }: { assetId: PropAssetId; className?: string }) => {
  const asset = PROP_ASSETS[assetId]
  return (
    <Image
      src={asset.src}
      alt=""
      width={asset.width}
      height={asset.height}
      className={classNames(
        'nm-prop-img',
        { 'nm-prop-img--pixel': 'pixelated' in asset && asset.pixelated },
        className
      )}
      draggable={false}
    />
  )
}

export const PropFrame = ({
  context,
  display,
  mobile,
  className,
  children,
}: {
  context: PropDisplayContext
  display: PropDisplayConfig
  mobile?: boolean
  className?: string
  children: ReactNode
}) => (
  <span
    className={classNames(propFrameClassName(context), className)}
    style={propFrameStyle(context, display, { mobile })}
    aria-hidden
  >
    {children}
  </span>
)

/** Shared world / inventory / cursor wrapper for any registered asset. */
export const AssetVisual = ({
  assetId,
  context,
  mobile,
  className,
}: {
  assetId: PropAssetId
  context: PropDisplayContext
  mobile?: boolean
  className?: string
}) => {
  if (context === 'world') {
    return (
      <span className={classNames('nm-prop-sprite', className)} aria-hidden>
        <PropImage assetId={assetId} />
      </span>
    )
  }

  return (
    <PropFrame
      context={context}
      display={getAssetDisplay(assetId)}
      mobile={mobile}
      className={className}
    >
      <PropImage assetId={assetId} />
    </PropFrame>
  )
}

export const TrimmersVisual = ({
  context,
  half = 'full',
  taped = false,
  mobile,
  className,
}: {
  context: PropDisplayContext
  half?: TrimmerVisualHalf
  taped?: boolean
  mobile?: boolean
  className?: string
}) => (
  <AssetVisual
    assetId={getTrimmerAssetId(half, taped)}
    context={context}
    mobile={mobile}
    className={className}
  />
)

export const ShovelVisual = ({
  context,
  mobile,
  className,
}: {
  context: PropDisplayContext
  mobile?: boolean
  className?: string
}) => (
  <AssetVisual assetId="shovel" context={context} mobile={mobile} className={className} />
)

export const BushVisual = ({
  boxFreed,
  boxTaken,
  mobile,
  className,
}: {
  boxFreed: boolean
  boxTaken: boolean
  mobile?: boolean
  className?: string
}) => (
  <AssetVisual
    assetId={getBushAssetId(boxFreed, boxTaken)}
    context="world"
    mobile={mobile}
    className={className}
  />
)

const CssItemVisual = ({
  id,
  context,
  mobile,
}: {
  id: ItemId
  context: PropDisplayContext
  mobile?: boolean
}) => (
  <PropFrame context={context} display={getCssItemDisplay(id)} mobile={mobile}>
    <span className={classNames('nm-prop', `nm-prop--${id}`)} />
  </PropFrame>
)

export const ScenePropVisual = ({
  assetId,
  mobile,
  className,
}: {
  assetId: ScenePropAssetId
  mobile?: boolean
  className?: string
}) => (
  <AssetVisual assetId={assetId} context="world" mobile={mobile} className={className} />
)

const renderItemVisual = (
  id: ItemId,
  context: PropDisplayContext,
  opts: { mobile?: boolean; tapedTrimmerHalf?: TrimmerHalfId | null }
) => {
  if (id === 'trimmers') {
    return <TrimmersVisual context={context} mobile={opts.mobile} half="full" />
  }

  if (id === 'trimmersPartA') {
    return (
      <TrimmersVisual
        context={context}
        mobile={opts.mobile}
        half="blade"
        taped={opts.tapedTrimmerHalf === 'trimmersPartA'}
      />
    )
  }

  if (id === 'trimmersPartB') {
    return (
      <TrimmersVisual
        context={context}
        mobile={opts.mobile}
        half="body"
        taped={opts.tapedTrimmerHalf === 'trimmersPartB'}
      />
    )
  }

  const assetId = ITEM_ASSET_IDS[id]
  if (assetId) {
    return <AssetVisual assetId={assetId} context={context} mobile={opts.mobile} />
  }

  return <CssItemVisual id={id} context={context} mobile={opts.mobile} />
}

type DecoPropVisualProps = {
  id: DecoSpawnId
  style: CSSProperties
  ctx: DecoCopyContext
  mobile?: boolean
}

export const DecoPropVisual = forwardRef<HTMLDivElement, DecoPropVisualProps>(
  function DecoPropVisual({ id, style, ctx, mobile }, ref) {
    const decoAssetId = DECO_ASSET_IDS[id]
    if (decoAssetId) {
      return (
        <div
          ref={ref}
          className={classNames('nm-prop-visual', 'nm-deco', 'nm-deco--sprite')}
          style={{
            ...style,
            ...worldPropOuterStyle(getAssetDisplay(decoAssetId), mobile),
          }}
          aria-hidden
        >
          <AssetVisual assetId={decoAssetId} context="world" mobile={mobile} />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={classNames('nm-prop-visual', 'nm-deco', DECO_VISUAL_CLASSES[id])}
        style={style}
        aria-hidden
      >
        {id === 'postItNote' && (
          <>
            <span className="nm-deco-postit-line">Recovery:</span>
            <span className="nm-deco-postit-code">{ctx.postItDecoy}</span>
          </>
        )}

        {id === 'zodiacChart' && (
          <>
            <span className="nm-deco-zodiac-wheel" />
            <span className="nm-deco-zodiac-row">
              <span className="nm-deco-zodiac-label">SUN</span>
              <span className="nm-deco-zodiac-sign">{ctx.zodiac.sun}</span>
            </span>
            <span className="nm-deco-zodiac-row">
              <span className="nm-deco-zodiac-label">MOON</span>
              <span className="nm-deco-zodiac-sign">{ctx.zodiac.moon}</span>
            </span>
            <span className="nm-deco-zodiac-row">
              <span className="nm-deco-zodiac-label">RISING</span>
              <span className="nm-deco-zodiac-sign">{ctx.zodiac.rising}</span>
            </span>
          </>
        )}

        {id === 'pizzaSlice' && (
          <>
            <span className="nm-deco-pizza-ticket">PIZZATRON</span>
            <span className="nm-deco-pizza-crust" />
            <span className="nm-deco-pizza-slice" />
            <span className="nm-deco-pizza-pep nm-deco-pizza-pep--1" />
            <span className="nm-deco-pizza-pep nm-deco-pizza-pep--2" />
            <span className="nm-deco-pizza-pep nm-deco-pizza-pep--3" />
          </>
        )}

      </div>
    )
  }
)

export const InventoryItemIcon = ({
  id,
  tapedTrimmerHalf = null,
  mobile,
}: {
  id: ItemId
  tapedTrimmerHalf?: TrimmerHalfId | null
  mobile?: boolean
}) => renderItemVisual(id, 'inventory', { mobile, tapedTrimmerHalf })

export const CursorHeldItem = ({
  holding,
  tapedTrimmerHalf = null,
  mobile,
}: {
  holding: ItemId
  tapedTrimmerHalf?: TrimmerHalfId | null
  mobile?: boolean
}) => renderItemVisual(holding, 'cursor', { mobile, tapedTrimmerHalf })
