import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// import 'inter-ui/inter.css' // Strongly recommended.
// import '@fontsource/ibm-plex-mono' // Import if using code textStyles.
import { ThemeProvider } from '@opengovsg/design-system-react'


document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('react-page');
  const root = createRoot(container);
  root.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
});
