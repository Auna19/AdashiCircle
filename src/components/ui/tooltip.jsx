'use client'

import * as React from 'react'

export function TooltipProvider({ children }) {
  return <>{children}</>
}

export function Tooltip({ children }) {
  return <>{children}</>
}

export function TooltipTrigger({ asChild, children, ...props }) {
  return React.cloneElement(children, props)
}

export function TooltipContent({ children }) {
  return null
}

export default Tooltip
