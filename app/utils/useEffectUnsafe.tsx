/**
 * The game at many points needs to initialize state based on randomness
 * These calls to Math.random() can not be ran during render, due to React componenets being idempotent
 * They also can't be ran during render due to SSR
 * This means that we need to run them in an Effect
 * However, this breaks another react rule where we shouldn't be setting state in an Effect
 * For our purposes, this pattern is extremely important and common, so this custom hook allows us to use it without the warnings
 */

import { DependencyList, EffectCallback, useEffect } from 'react'

export const useEffectUnsafe = (
  effectCallback: EffectCallback,
  effectDependencies: DependencyList
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effectCallback, effectDependencies)
}
