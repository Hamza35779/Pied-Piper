/* ==========================================================================
   PIED PIPER - SDK INTEGRATION PORTAL & EMBEDDABLE WEB COMPONENTS
   ========================================================================== */

class PiedPiperSDKIntegration {
  constructor() {
    this.currentLang = 'js';
  }

  getElements() {
    return {
      codeBlock: document.getElementById('sdk-code-block'),
      btnCopy: document.getElementById('btn-copy-sdk'),
      tabs: document.querySelectorAll('.sdk-tab-btn')
    };
  }

  init() {
    const els = this.getElements();

    els.tabs.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        els.tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        this.currentLang = btn.getAttribute('data-lang');
        this.renderSnippet();
        if (window.ppAudio) window.ppAudio.playClick();
      };
    });

    if (els.btnCopy) {
      els.btnCopy.onclick = (e) => {
        e.preventDefault();
        const codeEl = document.getElementById('sdk-code-block');
        if (codeEl) {
          navigator.clipboard.writeText(codeEl.textContent);
          els.btnCopy.textContent = '✅ Copied!';
          setTimeout(() => els.btnCopy.textContent = '📋 Copy Code Snippet', 2000);
        }
      };
    }

    this.renderSnippet();
  }

  getSnippet(lang) {
    switch (lang) {
      case 'react':
        return `import { PiedPiperCompressor, PiedPiperPlayer } from '@piedpiper/react';

export default function App() {
  const handleCompress = async (files) => {
    const stream = await PiedPiperCompressor.compressStream(files, {
      algorithm: 'middle-out-v4.2',
      lossless: true,
      depinReplication: 3
    });
    console.log('Weissman Score:', stream.weissmanScore); // 5.84W
  };

  return (
    <div>
      <PiedPiperCompressor onCompress={handleCompress} />
      <PiedPiperPlayer src="https://pipernet.io/stream/8k-video.pp" />
    </div>
  );
}`;

      case 'python':
        return `import piedpiper as pp

# Initialize Middle-Out Engine
client = pp.Client(api_key="pp_live_middle_out_v42_secret")

# Compress 5TB Enterprise Directory
archive = client.compress_directory(
    path="/data/enterprise_cluster_5tb/",
    lossless=True,
    target_weissman=5.84
)

print(f"Original: {archive.orig_gb} GB | Compressed: {archive.comp_gb} GB")
print(f"Space Saved: {archive.space_saved_percent}% | Zero Data Loss!")
archive.export_to_pc("./output_archive.pp")`;

      case 'curl':
        return `# Upload & Compress 5TB File Stream via Pied Piper HTTP/3 API
curl -X POST "https://api.pipernet.io/v4/middle-out/compress" \\
  -H "Authorization: Bearer pp_live_middle_out_v42_secret" \\
  -H "Content-Type: application/octet-stream" \\
  -F "file=@/data/5TB_master_dataset.tar" \\
  -F "lossless=true" \\
  -F "weissman_target=5.84"`;

      case 'js':
      default:
        return `import { MiddleOutEngine } from '@piedpiper/sdk';

// Initialize Middle-Out v4.2 Client
const engine = new MiddleOutEngine({
  apiKey: 'pp_live_middle_out_v42_secret',
  depinNodes: true
});

// Compress massive payload losslessly
const result = await engine.compress(fileBuffer, {
  bidirectional: true,
  neuralEntropy: true
});

console.log(\`Compressed \${result.origBytes}B down to \${result.compBytes}B (\${result.savings}% saved)\`);
console.log(\`Weissman Score: \${result.weissmanScore}W\`);`;
    }
  }

  renderSnippet() {
    const codeEl = document.getElementById('sdk-code-block');
    if (codeEl) {
      codeEl.textContent = this.getSnippet(this.currentLang);
    }
  }
}

window.sdkIntegration = new PiedPiperSDKIntegration();
