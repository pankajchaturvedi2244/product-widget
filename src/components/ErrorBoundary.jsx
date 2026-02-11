import React from "react";
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }
  handleRetry = () => {
    this.setState({ error: null });
    if (this.props.onRetry) this.props.onRetry();
  };
  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ color: "var(--color-warning)" }}>
          <p>Something went wrong.</p>
          <button aria-label="Try Again" onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
