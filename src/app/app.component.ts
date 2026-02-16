import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  // Opening cinematic state
  isOpened = false;
  overlayVisible = true;
  overlayFading = false;
  heroRevealed = false;
  countdownRevealed = false;

  // Countdown values
  days = '00';
  hours = '00';
  minutes = '00';
  seconds = '00';

  @ViewChild('bgMusic') bgMusic?: ElementRef<HTMLAudioElement>;

  private observer?: IntersectionObserver;
  private countdownInterval?: any;

  ngAfterViewInit(): void {
    this.initObserver();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.observer?.disconnect();
  }

  openInvitation(): void {
    if (this.isOpened) return;

    // bloquear scroll mientras ocurre la animación
    document.body.style.overflow = 'hidden';

    // iniciar música con fade‑in
    this.playMusic();

    this.isOpened = true;

    // fade del overlay
    this.overlayFading = true;

    // aparición progresiva del hero
    setTimeout(() => {
      this.heroRevealed = true;
    }, 300);

    // aparición posterior del countdown
    setTimeout(() => {
      this.countdownRevealed = true;
    }, 900);

    // eliminación completa del overlay y liberación de scroll
    setTimeout(() => {
      this.overlayVisible = false;
      document.body.style.overflow = 'auto';
    }, 1600);
  }

  playMusic(): void {
    const audio = this.bgMusic?.nativeElement;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0;

    audio.play().catch(() => {
      // algunos navegadores bloquean autoplay; no hacemos nada
    });

    const targetVolume = 0.6;
    const duration = 2500;
    const steps = 30;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(targetVolume, audio.volume + volumeStep);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.volume = targetVolume;
      }
    }, stepTime);
  }

  private initObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('fade-up');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    setTimeout(() => {
      document.querySelectorAll('section.opacity-0').forEach((section) => {
        this.observer?.observe(section);
      });
    });
  }

  private startCountdown(): void {
    const eventDate = new Date('May 2, 2026 00:00:00').getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = eventDate - now;

      if (diff <= 0) {
        this.days = this.hours = this.minutes = this.seconds = '00';
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      this.days = this.pad(d);
      this.hours = this.pad(h);
      this.minutes = this.pad(m);
      this.seconds = this.pad(s);
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
