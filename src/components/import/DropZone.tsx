import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileArchive } from 'lucide-react'

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
        <FileArchive className="size-12 text-muted-foreground" />
        <div className="text-center space-y-1">
          <p className="text-lg font-medium">
            Drop your ChatGPT export ZIP here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse. The file should contain <code className="rounded bg-muted px-1">conversations.json</code>.
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
