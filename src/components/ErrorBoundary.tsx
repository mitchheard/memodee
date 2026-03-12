import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
          <div className="max-w-md flex flex-col items-center gap-5 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="size-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground font-mono break-words bg-muted/50 rounded-lg px-3 py-2">
                {this.state.error.message}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => this.setState({ error: null })}
                variant="outline"
              >
                Try again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                Reload app
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
