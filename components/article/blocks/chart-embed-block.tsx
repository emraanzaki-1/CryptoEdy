'use client'

import { useRef, useEffect } from 'react'

interface ChartEmbedBlockProps {
  ticker: string
  interval: string
  chartType?: string | null
  height?: number | null
  showVolume?: boolean | null
  theme?: string | null
  caption?: string | null
}

export function ChartEmbedBlockComponent({
  ticker,
  interval,
  height = 450,
  showVolume = true,
  theme = 'dark',
  caption,
}: ChartEmbedBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous widget
    container.innerHTML = ''

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: ticker,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style: '1',
      locale: 'en',
      hide_side_toolbar: false,
      allow_symbol_change: false,
      hide_volume: !showVolume,
      support_host: 'https://www.tradingview.com',
    })

    const wrapper = document.createElement('div')
    wrapper.className = 'tradingview-widget-container__widget'
    wrapper.style.height = 'calc(100% - 32px)'
    wrapper.style.width = '100%'

    container.appendChild(wrapper)
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [ticker, interval, showVolume, theme])

  return (
    <figure className="my-8">
      <div
        ref={containerRef}
        className="border-outline-variant/15 overflow-hidden rounded-xl border"
        style={{ height: `${height ?? 450}px` }}
      />
      {caption && (
        <figcaption className="text-on-surface-variant text-micro mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
