import { useImport } from '@/hooks/useImport'
import { DropZone } from '@/components/import/DropZone'
import { ImportProgress } from '@/components/import/ImportProgress'

export function Home() {
  const { importFile, progress, error, reset } = useImport()

  const handleFile = async (file: File) => {
    try {
      await importFile(file)
    } catch {
      // Error state is set in useImport
    }
  }

  const isBusy = progress.stage !== 'idle' && progress.stage !== 'done' && progress.stage !== 'error'

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">ChatGPT Archive</h1>
        <p className="text-muted-foreground">
          Import your exported conversations to browse, search, and export.
        </p>
      </div>

      {progress.stage === 'done' ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <p className="text-lg text-primary font-medium">{progress.message}</p>
          <button
            type="button"
            onClick={reset}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Import another file
          </button>
        </div>
      ) : (
        <>
          <DropZone onFile={handleFile} disabled={isBusy} className="w-full max-w-lg" />
          <ImportProgress progress={progress} />
          {error && (
            <p className="text-sm text-destructive max-w-md text-center">{error}</p>
          )}
        </>
      )}
    </div>
  )
}
