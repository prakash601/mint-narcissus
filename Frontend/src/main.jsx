import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store from './store/store';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <TooltipProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
