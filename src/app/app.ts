import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  form: FormGroup;
  currentUrl = signal<string>('');
  proxyUrl = signal<SafeResourceUrl | null>(null);
  isLoading = signal<boolean>(false);
  isLoaded = signal<boolean>(false);
  errorMessage = signal<string>('');
  
  // Data saving stats
  originalSizeKB = signal<number>(0);
  compressedSizeKB = signal<number>(0);
  savingsPercent = signal<number>(78);
  
  // Settings
  blockImages = signal<boolean>(false);
  phoneFrameMode = signal<boolean>(false);

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) {
    this.form = this.fb.group({
      urlInput: ['', [Validators.required]]
    });
  }

  loadUrl(inputUrl?: string) {
    let target = inputUrl || this.form.get('urlInput')?.value;
    if (!target) return;

    target = target.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    this.currentUrl.set(target);
    this.form.patchValue({ urlInput: target });
    this.isLoading.set(true);
    this.isLoaded.set(false);
    this.errorMessage.set('');

    // Simulated data size estimation for South African mobile users
    const randomOriginal = Math.floor(Math.random() * 800) + 900; // ~1.2MB
    const savings = Math.floor(Math.random() * 10) + 75; // 75-85%
    const compressed = Math.round(randomOriginal * (1 - savings / 100));
    
    this.originalSizeKB.set(randomOriginal);
    this.compressedSizeKB.set(compressed);
    this.savingsPercent.set(savings);

    // Construct proxy URL
    const encoded = encodeURIComponent(target);
    const urlString = `/api/proxy?url=${encoded}`;
    
    this.proxyUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(urlString));

    // Simulate load completion after a short moment if iframe takes time
    setTimeout(() => {
      this.isLoading.set(false);
      this.isLoaded.set(true);
    }, 1200);
  }

  onIframeLoad() {
    this.isLoading.set(false);
    this.isLoaded.set(true);
  }

  onIframeError() {
    this.isLoading.set(false);
    this.errorMessage.set('Could not load site directly via proxy. The target site may block embedding or require direct access.');
  }

  togglePhoneFrame() {
    this.phoneFrameMode.update(v => !v);
  }
}
