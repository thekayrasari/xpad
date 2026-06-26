# Electron Webview Login Guide (Future Reference)

This document explains how to properly embed external websites (like Microsoft Xbox Login, SimBrief, or VATSIM Radar) into the Electron app without breaking their authentication flows. 

## The Problem
When you try to embed strict authentication pages (like `login.live.com`) inside a standard `<iframe>`, the screen will go blank or refuse to connect. This happens because these sites use security headers like `X-Frame-Options: DENY` and `Content-Security-Policy` to prevent themselves from being embedded (to stop clickjacking attacks). 

Furthermore, standard iframes silently block the popup windows (`window.open`) that OAuth flows rely on to complete the login.

## The Solution: `<webview>`
Instead of hacking the browser's web requests to strip security headers, Electron provides a native `<webview>` tag. A `webview` runs in an isolated guest environment that acts exactly like a top-level browser window. This bypasses `X-Frame-Options` completely.

### Step 1: Enable Webview in `main.js`
In your Electron `main.js`, you must explicitly enable the webview tag in the `webPreferences` of your `BrowserWindow`:

```javascript
mainWindow = new BrowserWindow({
  // ...
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    webviewTag: true // <-- CRITICAL: Must be true
  }
});
```

### Step 2: Use `<webview>` in React
Replace your `<iframe>` with a `<webview>` tag. 

**Critical attributes:**
- `allowpopups={true}`: Essential for OAuth logins. Without this, when the user clicks "Login", the popup window will be silently blocked and the flow will hang.
- `ref`: React does not support the `onLoad` prop for webviews. You must use a ref and listen for the `dom-ready` event.

**Code Example:**
```tsx
import React, { useState } from 'react';

export const EmbeddedModule: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="w-full h-full">
            {/* @ts-ignore - React doesn't natively include webview definitions */}
            <webview
                src="https://example.com/login"
                ref={(node: any) => {
                    if (node) {
                        node.addEventListener('dom-ready', () => setIsLoaded(true));
                    }
                }}
                className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                allowpopups={true} // <-- CRITICAL for OAuth popups
            />
        </div>
    );
};
```

## Persistence
By default, Electron uses its main session to persist cookies and local storage to the user data directory. Because the `<webview>` tag runs on this default session, **logins will automatically persist across app restarts** without any additional configuration.
