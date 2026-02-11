// src/embed.js
// Embedding script for marketplace-widget

(function () {
  const WIDGET_ID = "marketplace-widget";
  const WIDGET_VERSION = "1.0.0";
  let isLoaded = false;

  function getContainer() {
    let el = document.getElementById(WIDGET_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = WIDGET_ID;
      document.body.appendChild(el);
    }
    return el;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function initialize() {
    if (isLoaded) return;
    getContainer();
    await loadScript("widget.js");
    isLoaded = true;
    return true;
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.type === "MARKETPLACE_WIDGET_API_KEY") {
      window.__MARKETPLACE_WIDGET_API_KEY__ = event.data.payload;
      event.source.postMessage({ type: "API_KEY_ACK" }, event.origin);
    }
  });

  window.MarketplaceWidget = {
    isLoaded: () => isLoaded,
    getContainer,
    initialize,
    version: WIDGET_VERSION,
  };

  // Auto-mount
  initialize();
})();
