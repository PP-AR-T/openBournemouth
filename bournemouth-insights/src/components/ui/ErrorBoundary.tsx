import type { ReactNode } from 'react'
import React from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
  componentStack?: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, componentStack: undefined }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(_error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
        <div className="font-semibold">The dashboard failed to load</div>
        <div className="mt-2 text-rose-800">
          A runtime error occurred while rendering. Open DevTools Console for the full stack trace.
        </div>
        <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-rose-200 bg-white p-3 text-xs text-rose-900">
          {this.state.error.stack ?? this.state.error.message}
        </pre>
        {this.state.componentStack ? (
          <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-rose-200 bg-white p-3 text-xs text-rose-900">
            {this.state.componentStack.trim()}
          </pre>
        ) : null}
      </div>
    )
  }
}
