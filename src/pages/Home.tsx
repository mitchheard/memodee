import { Link } from 'react-router-dom'
import { useImport } from '@/hooks/useImport'
import { DropZone } from '@/components/import/DropZone'
import { ImportProgress } from '@/components/import/ImportProgress'
import { ImportSuccessStats } from '@/components/import/ImportSuccessStats'
import { Button } from '@/components/ui/button'

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
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">ChatGPT Archive</h1>
        <p className="text-muted-foreground">
          Import your exported conversations to browse, search, and export.
        </p>
      </div>

      {progress.stage === 'done' ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-3xl">
          <p className="text-lg text-primary font-medium text-center">{progress.message}</p>
          <ImportSuccessStats className="animate-in fade-in slide-in-from-bottom-2 duration-300" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link to="/library">
              <Button size="lg">Go to Library</Button>
            </Link>
            <Button type="button" variant="ghost" onClick={reset}>
              Import another file
            </Button>
          </div>
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
