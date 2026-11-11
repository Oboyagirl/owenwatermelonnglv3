import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import {AuthProvider} from './context/AuthContext.tsx';
import {MusicProvider} from './context/MusicContext.tsx';
import './index.css';

function mountApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    // Retry if DOM parsing is in progress
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountApp);
    } else {
      setTimeout(mountApp, 50);
    }
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <MusicProvider>
              <App />
            </MusicProvider>
          </AuthProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (err: any) {
    console.error('Fatal render error in createRoot:', err);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="min-height: 100vh; background-color: #07130c; color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center;">
          <div style="max-width: 440px; background-color: #0c2016; border: 1px solid #16402a; border-radius: 20px; padding: 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <div style="font-size: 32px; margin-bottom: 12px;">🍉</div>
            <h1 style="font-size: 20px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff;">Owen Watermelon <span style="color: #10b981;">V3</span></h1>
            <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0;">Safe Recovery Mode activated.</p>
            <div style="font-size: 11px; font-family: monospace; background-color: #050d09; border: 1px solid #234e38; padding: 12px; border-radius: 10px; color: #f87171; margin-bottom: 20px; word-break: break-all;">
              ${err?.message || 'Initialization error'}
            </div>
            <button onclick="try { localStorage.clear(); sessionStorage.clear(); } catch(e){} window.location.reload();" style="width: 100%; padding: 12px 20px; background-color: #10b981; color: #042f1f; font-weight: 700; font-size: 13px; border-radius: 12px; border: none; cursor: pointer;">
              Reset Cache & Reload Arcade
            </button>
          </div>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
