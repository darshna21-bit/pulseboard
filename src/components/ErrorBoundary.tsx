import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled render error:', error, errorInfo)
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="text-center py-10 px-6 flex flex-col items-center justify-center border-red-soft/30 bg-surface/90">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-soft/15 text-red-soft mb-3 border border-red-soft/30">
            <svg
              className="h-6 w-6 stroke-current fill-none"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="font-display text-base font-semibold text-text">
            Something went wrong loading the feed
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-text-muted">
            An unexpected error occurred while rendering the job stream. You can try reloading the
            feed without restarting your session.
          </p>
          <Button
            variant="secondary"
            onClick={this.handleReload}
            className="mt-4 text-xs py-1.5 px-3.5 border-border hover:border-signal text-text"
          >
            Reload feed
          </Button>
        </Card>
      )
    }

    return this.props.children
  }
}
