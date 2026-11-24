import { animate, hover, inView } from 'https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = [...document.querySelectorAll('[data-reveal]')];

if (reduceMotion) {
  revealElements.forEach(element => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
} else {
  document.documentElement.classList.add('js-motion-ready');

  // Motion handles the larger component entrances.
  revealElements.forEach(element => {
    if (element.matches('.hero-copy, .portrait-wrap')) {
      animate(element, { y: [18, 0] }, { duration: 0.65, easing: [0.22, 1, 0.36, 1] });
      return;
    }
    const stagedGroup = element.closest('.focus-grid, .methods-flow');
    const stagedDelay = stagedGroup
      ? [...stagedGroup.querySelectorAll('[data-reveal]')].indexOf(element) * 0.07
      : 0;
    const reveal = () => {
      animate(element, { opacity: [0, 1], y: [28, 0] }, {
        duration: 0.62,
        delay: stagedDelay,
        easing: [0.22, 1, 0.36, 1]
      });
    };

    if (element.getBoundingClientRect().top < window.innerHeight * 0.94) {
      reveal();
    } else {
      inView(element, reveal, { amount: 0.16, margin: '0px 0px -8% 0px' });
    }
  });

  // Motion also adds a small, tactile lift to interactive surfaces.
  const hoverTargets = document.querySelectorAll('.social-links a, .primary-cta, .theme-toggle, .form-submit, .project-card');
  hoverTargets.forEach(element => {
    element.dataset.motionHover = '';
    hover(element, () => {
      animate(element, { y: -3, scale: 1.012 }, { duration: 0.16, easing: [0.22, 1, 0.36, 1] });
      return () => animate(element, { y: 0, scale: 1 }, { duration: 0.24, easing: [0.22, 1, 0.36, 1] });
    });
  });
}

const { gsap, ScrollTrigger, Lenis } = window;

if (!reduceMotion && gsap && ScrollTrigger && Lenis) {
  gsap.registerPlugin(ScrollTrigger);

  // Lenis owns scrolling; ScrollTrigger reads its updates on the same frame.
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.15,
    anchors: { offset: -76 }
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const initialHashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (initialHashTarget) {
    window.addEventListener('load', () => {
      lenis.scrollTo(initialHashTarget, { immediate: true, offset: -76, force: true });
      ScrollTrigger.refresh();
    }, { once: true });
  }

  const splitWords = element => {
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
          const fragment = document.createDocumentFragment();
          const parts = child.textContent.split(/(\s+)/);
          parts.forEach(part => {
            if (/^\s+$/.test(part)) {
              fragment.append(part);
            } else if (part) {
              const word = document.createElement('span');
              word.className = 'word-reveal';
              word.textContent = part;
              fragment.append(word);
            }
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && !child.matches('svg, script, style')) {
          walk(child);
        }
      });
    };
    walk(element);
    return element.querySelectorAll('.word-reveal');
  };

  const heroWords = splitWords(document.querySelector('.hero h1'));
  gsap.fromTo(heroWords,
    { opacity: 0, yPercent: 70 },
    { opacity: 1, yPercent: 0, duration: 0.72, stagger: 0.055, delay: 0.15, ease: 'power3.out' }
  );

  const textTargets = document.querySelectorAll('.section-heading h2, .section-heading > p:last-child, .what-i-do__heading h2, .methods-heading h2, .contact h2');
  textTargets.forEach(element => {
    const words = splitWords(element);
    gsap.fromTo(words,
      { opacity: 0.08, yPercent: 70, rotateX: -35 },
      {
        opacity: 1,
        yPercent: 0,
        rotateX: 0,
        stagger: 0.045,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          end: 'bottom 54%',
          scrub: 0.65
        }
      }
    );
  });

  ScrollTrigger.refresh();
}
