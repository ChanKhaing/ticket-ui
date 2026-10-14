import { useRef, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
  showDownload?: boolean
  fileName?: string
}

export function QRCodeDisplay({
  value,
  size = 200,
  className = '',
  showDownload = true,
  fileName = 'ticket-qr.png',
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // Clear background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Generate deterministic QR-like matrix from value
    const modules = 25
    const cellSize = (size - 24) / modules
    const offset = 12

    // Seeded pseudo-random generator from string value
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i)
      hash |= 0
    }

    const isFinder = (r: number, c: number) => {
      // Top-left
      if (r < 7 && c < 7) return true
      // Top-right
      if (r < 7 && c >= modules - 7) return true
      // Bottom-left
      if (r >= modules - 7 && c < 7) return true
      return false
    }

    const drawFinder = (startX: number, startY: number) => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(startX, startY, 7 * cellSize, 7 * cellSize)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize)
      ctx.fillStyle = '#000000'
      ctx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize)
    }

    drawFinder(offset, offset)
    drawFinder(offset + (modules - 7) * cellSize, offset)
    drawFinder(offset, offset + (modules - 7) * cellSize)

    // Draw alignment and data pattern
    ctx.fillStyle = '#000000'
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if (isFinder(r, c)) continue
        // pseudo data module
        const pseudo = Math.sin(hash + r * 31 + c * 17) * 10000
        const isBlack = (pseudo - Math.floor(pseudo)) > 0.45
        if (isBlack) {
          ctx.fillRect(
            offset + c * cellSize,
            offset + r * cellSize,
            cellSize,
            cellSize
          )
        }
      }
    }
  }, [value, size])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <canvas ref={canvasRef} className="block rounded" />
      </div>
      {showDownload && (
        <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download QR
        </Button>
      )}
    </div>
  )
}
