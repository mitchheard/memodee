import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function DropZoneUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 15 15"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7.5 2v7M7.5 2L5 4.5M7.5 2L10 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 10v2.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface DropZoneProps {
  onFile: (file: File) => void
  disabled?: boolean
  className?: string
}

export function DropZone({ onFile, disabled, className }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (disabled) return
      const file = e.dataTransfer.files[0]
      if (file?.name.endsWith('.zip')) {
        onFile(file)
      }
    },
    [onFile, disabled]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFile(file)
      e.target.value = ''
    },
    [onFile]
  )

  return (
    <Card
      className={cn(
        'border-2 border-dashed transition-colors',
        isDragOver && !disabled && 'border-primary bg-muted/50',
        disabled && 'opacity-60 pointer-events-none',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 px-8">
        <DropZoneUploadIcon className="size-12 text-primary" />
        <div className="text-center space-y-1">
          <p className="text-lg font-medium">
            Drop your ChatGPT export ZIP here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse — supports <code className="rounded bg-muted px-1">conversations.json</code> and similar
            formats
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="sr-only"
          onChange={handleInputChange}
          aria-hidden
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Choose ZIP file
        </Button>
      </CardContent>
    </Card>
  )
}
