import { animate, hover, inView, stagger } from 'https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm';

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
    element.style.opacity = '0';
    element.style.transform = 'translateY(28px)';
    const reveal = () => {
      animate(element, { opacity: [0, 1], y: [28, 0] }, {
        duration: 0.75,
        delay: element.matches('.portrait-wrap') ? 0.12 : 0,
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
  const hoverTargets = document.querySelectorAll('.social-links a, .theme-toggle, .form-submit, .project-feature, .skills span');
  hoverTargets.forEach(element => {
    element.dataset.motionHover = '';
    hover(element, () => {
      animate(element, { y: -4, scale: 1.015 }, { duration: 0.22, easing: 'ease-out' });
      return () => animate(element, { y: 0, scale: 1 }, { duration: 0.28, easing: 'ease-out' });
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

  const textTargets = document.querySelectorAll('.hero h1, .section-heading h2, .section-heading > p:last-child, .about h2, .about-lead, .contact h2');
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
