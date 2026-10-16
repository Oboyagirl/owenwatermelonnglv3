import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear potentially corrupted state cache
      localStorage.removeItem('owen_watermelon_v3_games_v28');
      localStorage.removeItem('owen_watermelon_v3_games_v27');
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07130c] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#0c2016] border border-[#16402a] rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-white">
              Owen Watermelon <span className="text-[#ff2d55]">V3</span>
            </h1>

            <p className="text-xs text-slate-400">
              An unexpected display issue occurred while initializing the arcade.
            </p>

            {this.state.error && (
              <div className="w-full p-3 bg-[#08160f] border border-red-900/40 rounded-xl text-left text-[11px] font-mono text-red-300 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 bg-[#16402a] hover:bg-[#255238] text-emerald-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#2d6a4f]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#10b981]/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset & Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
