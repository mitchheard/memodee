import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

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
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-xl font-semibold text-destructive">Something went wrong</h1>
            <p className="text-sm text-muted-foreground font-mono break-words">
              {this.state.error.message}
            </p>
            <Button
              onClick={() => this.setState({ error: null })}
              variant="outline"
            >
              Try again
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
