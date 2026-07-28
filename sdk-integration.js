/* ==========================================================================
   PIED PIPER - SDK INTEGRATION PORTAL & EMBEDDABLE WEB COMPONENTS
   ========================================================================== */

class PiedPiperSDKIntegration {
  constructor() {
    this.codeBlock = document.getElementById('sdk-code-block');
    this.currentLang = 'js';
    this.init();
  }

  init() {
    const tabs = document.querySelectorAll('.sdk-tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.currentLang = e.target.getAttribute('data-lang');
        this.renderSnippet();
        if (window.ppAudio) window.ppAudio.playClick();
      });
    });

    const btnCopy = document.getElementById('btn-copy-sdk');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (this.codeBlock) {
          navigator.clipboard.writeText(this.codeBlock.textContent);
          btnCopy.textContent = '✅ Copied!';
          setTimeout(() => btnCopy.textContent = '📋 Copy Code Snippet', 2000);
        }
      });
    }

    const widgetPlayBtn = document.getElementById('widget-play-btn');
    if (widgetPlayBtn) {
      widgetPlayBtn.addEventListener('click', () => {
        const statusText = document.getElementById('widget-status');
        if (statusText) statusText.textContent = '▶ Playing Stream (Lossless)';
        if (window.ppAudio) window.ppAudio.playSuccessChime();
      });
    }

    this.renderSnippet();
  }

  renderSnippet() {
    if (!this.codeBlock) return;

    let snippet = "";
    switch (this.currentLang) {
      case 'js':
        snippet = `// Pied Piper JavaScript SDK Integration
import { PiedPiper } from '@piedpiper/sdk';

const pp = new PiedPiper({
  apiKey: 'pp_live_9482abcdef104928',
  neuralMode: true,
  biDirectional: true
});

// Compress raw data stream or file losslessly
const { compressedStream, weissmanScore } = await pp.compressStream(fileBuffer, {
  onProgress: (percent) => console.log(\`Compressed: \${percent}%\`)
});

// Play in-stream lossless media
pp.createPlayer('#player-container', compressedStream);`;
        break;

      case 'react':
        snippet = `// Pied Piper React Component Integration
import React from 'react';
import { PiedPiperPlayer, useMiddleOut } from '@piedpiper/react';

export function MediaViewer({ streamUrl }) {
  const { compress, isCompressing, weissman } = useMiddleOut();

  return (
    <div className="player-wrapper">
      <PiedPiperPlayer 
        src={streamUrl} 
        theme="dark" 
        lossless={true}
        onPlay={() => console.log('Playing in-stream lossless data')} 
      />
      <button onClick={() => compress(streamUrl)}>Compress Stream ({weissman}W)</button>
    </div>
  );
}`;
        break;

      case 'python':
        snippet = `# Pied Piper Python Platform Integration
import piedpiper as pp

# Initialize Middle-Out AI client
client = pp.Client(api_key="pp_live_9482abcdef104928")

# Compress multi-format file or directory
archive = client.compress_directory(
    path="./my_dataset",
    output="dataset.pp",
    neural_token_reduction=True
)

print(f"Weissman Score: {archive.weissman_score}W | Saved: {archive.savings_percent}%")`;
        break;

      case 'curl':
        snippet = `# Pied Piper REST API - Compress Payload Endpoint
curl -X POST https://api.piedpiper.com/v1/compress \\
  -H "Authorization: Bearer pp_live_9482abcdef104928" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": "YOUR_RAW_TEXT_OR_BASE64_MEDIA",
    "options": {
      "bi_directional": true,
      "lossless": true
    }
  }'`;
        break;
    }

    this.codeBlock.textContent = snippet;
  }
}

window.sdkIntegration = new PiedPiperSDKIntegration();
