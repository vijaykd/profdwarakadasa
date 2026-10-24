/**
 * ENTERPRISE PORTAL SCRIPTS
 * Prof. E. S. Dwarakadasa | Personal Profile & Technology Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure the page always starts cleanly at the top on initial load
  if ('scrollRestoration' in history && !window.location.hash) {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }

  initTheme();
  initNavigation();
  initReadingProgress();
  initDynamicContent();
  initInteractiveMap();
  initPublications();
  initContactForm();
  initBackToTop();
  initStatCounters();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  const savedTheme = localStorage.getItem('esd_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('esd_theme', newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeIcon) {
        themeIcon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`;
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeIcon) {
        themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        `;
      }
    }
  }
}

/* --------------------------------------------------------------------------
   2. Navigation & Mobile Menu
   -------------------------------------------------------------------------- */
function initNavigation() {
  const hamburgerBtn = document.getElementById('nav-hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          hamburgerBtn.classList.remove('active');
          hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close when clicking outside of nav on mobile
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active section indicator via IntersectionObserver
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: "-15% 0px -65% 0px"
    });

    sections.forEach(section => observer.observe(section));
  }
}

/* --------------------------------------------------------------------------
   3. Publications Search, Multi-Tag Filter & Actions
   -------------------------------------------------------------------------- */
function initPublications() {
  const searchInput = document.getElementById('pub-search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const pubItems = document.querySelectorAll('.pub-item');
  const emptyState = document.getElementById('pub-empty-state');

  let currentCategory = 'all';
  let searchQuery = '';

  function filterPublications() {
    let visibleCount = 0;

    pubItems.forEach(item => {
      const itemCategories = (item.getAttribute('data-category') || '').split(' ');
      const itemText = item.textContent.toLowerCase();

      const matchesCategory = currentCategory === 'all' || itemCategories.includes(currentCategory);
      const matchesSearch = searchQuery === '' || itemText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        item.style.display = 'block';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Category Filter Pills
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      filterPublications();
    });
  });

  // Real-time Text Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterPublications();
    });
  }

  // Abstract Collapsible Toggles
  document.querySelectorAll('.btn-abstract-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pubCard = e.target.closest('.pub-item');
      const abstractBox = pubCard.querySelector('.abstract-collapse');
      if (abstractBox) {
        const isOpen = abstractBox.classList.toggle('open');
        btn.textContent = isOpen ? 'Hide Abstract' : 'View Abstract';
      }
    });
  });

  // Citation Copy Buttons
  document.querySelectorAll('.btn-copy-citation').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const citationText = btn.getAttribute('data-citation');
      if (citationText) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(citationText).then(() => {
            showToast('BibTeX citation copied to clipboard!');
          }).catch(() => {
            fallbackCopy(citationText);
          });
        } else {
          fallbackCopy(citationText);
        }
      }
    });
  });

  function fallbackCopy(text) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast('Citation copied to clipboard!');
  }
}

/* --------------------------------------------------------------------------
   4. Statistical Counter Micro-Animations
   -------------------------------------------------------------------------- */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        entry.target.style.transform = 'scale(1.04)';
        setTimeout(() => {
          entry.target.style.transform = 'scale(1)';
        }, 400);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}

/* --------------------------------------------------------------------------
   5. Contact Form: Anti-Spam CAPTCHA & Delivery to dwarakadasa@gmail.com
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('academic-contact-form');
  if (!form) return;

  const captchaQuestionEl = document.getElementById('captcha-question');
  const captchaInput = document.getElementById('captcha-answer');
  const refreshBtn = document.getElementById('refresh-captcha-btn');
  const honeypotInput = document.getElementById('contact-honeypot');
  const submitBtn = document.getElementById('contact-submit-btn') || form.querySelector('button[type="submit"]');

  let captchaResult = 0;

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 11) + 2;
    const num2 = Math.floor(Math.random() * 9) + 1;
    captchaResult = num1 + num2;
    if (captchaQuestionEl) {
      captchaQuestionEl.textContent = `${num1} + ${num2}`;
    }
    if (captchaInput) {
      captchaInput.value = '';
    }
  }

  // Initialize CAPTCHA challenge
  generateCaptcha();

  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      generateCaptcha();
      if (captchaInput) captchaInput.focus();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Bot Trap: Honeypot check
    if (honeypotInput && honeypotInput.value.trim() !== '') {
      showToast('Thank you! Your inquiry has been routed.');
      form.reset();
      generateCaptcha();
      return;
    }

    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const serviceSelect = form.querySelector('#contact-service');
    const service = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : '';
    const subject = form.querySelector('#contact-subject') ? form.querySelector('#contact-subject').value.trim() : '';
    const message = form.querySelector('#contact-message').value.trim();
    const userAnswer = captchaInput ? parseInt(captchaInput.value.trim(), 10) : NaN;

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.');
      return;
    }

    // 2. Anti-Spam CAPTCHA Verification
    if (isNaN(userAnswer) || userAnswer !== captchaResult) {
      showToast('Security verification incorrect. Please calculate the challenge again.');
      generateCaptcha();
      if (captchaInput) captchaInput.focus();
      return;
    }

    // Set button to active sending state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
      </svg>
      Sending to dwarakadasa@gmail.com...
    `;

    try {
      // 3. Deliver formatted inquiry to dwarakadasa@gmail.com via FormSubmit AJAX endpoint
      const response = await fetch('https://formsubmit.co/ajax/dwarakadasa@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Inquiry for Prof. Dwarakadasa: ${subject || service}`,
          name: name,
          email: email,
          engagement_purpose: service,
          subject: subject,
          message: message,
          _template: 'table'
        })
      });

      const data = await response.json();

      if (response.ok || (data && (data.success === 'true' || data.success === true))) {
        showToast('Inquiry sent! Forwarded directly to Prof. Dwarakadasa (dwarakadasa@gmail.com).');
        form.reset();
        generateCaptcha();
      } else {
        throw new Error('API dispatch notice');
      }
    } catch (err) {
      // 4. Reliable Mailto fallback if network or endpoint blocks
      showToast('Opening your email client to deliver to dwarakadasa@gmail.com...');
      const mailtoUrl = `mailto:dwarakadasa@gmail.com?subject=${encodeURIComponent(subject || 'Inquiry: ' + service)}&body=${encodeURIComponent('From: ' + name + '\nEmail: ' + email + '\nPurpose: ' + service + '\n\nMessage:\n' + message)}`;
      window.location.href = mailtoUrl;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/* --------------------------------------------------------------------------
   6. Back to Top Button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* --------------------------------------------------------------------------
   7. Enterprise Toast Notification Component
   -------------------------------------------------------------------------- */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

/* --------------------------------------------------------------------------
   8. Reading Progress Bar Indicator
   -------------------------------------------------------------------------- */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const scrollPercent = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }
  });
}

/* --------------------------------------------------------------------------
   9. Interactive World Map & Global Footprint Dossier
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   9. Interactive Real-World Map Engine & Global Footprint Dossier
   -------------------------------------------------------------------------- */
function initInteractiveMap() {
  const mapData = {
    bengaluru: {
      flag: '🇮🇳',
      category: 'Academic & Tech HQ',
      categoryClass: 'gold',
      cat: 'national',
      year: '1961 – Present',
      city: 'Bengaluru, India',
      inst: 'Indian Institute of Science (IISc) & KHMD Limited',
      role: 'Emeritus Professor (IISc) • CEO & MD (KHMD)',
      desc: 'The central epicenter of Prof. Dwarakadasa’s career. Spanning 42 continuous years on the faculty of IISc’s Department of Metallurgy (Materials Engineering), guiding 28 Ph.D. scholars, pioneering LCA Tejas Al-Li alloys, and serving as CEO & MD of KHMD delivering over 2,000 space-grade subsystems for ISRO\'s Chandrayaan missions.',
      coords: [13.0219, 77.5671],
      order: 1
    },
    maryland: {
      flag: '🇺🇸',
      category: 'Postdoctoral Fellowship',
      categoryClass: '',
      cat: 'deputation',
      year: '1972 – 1973',
      city: 'College Park, Maryland, USA',
      inst: 'University of Maryland, College Park',
      role: 'Postdoctoral Fellow, Department of Mechanical Engineering',
      desc: 'Conducted advanced postdoctoral research in physical metallurgy, focusing on dislocation mechanics, solute-vacancy interactions, and precipitation hardening in advanced structural alloys.',
      coords: [38.9897, -76.9378],
      order: 2
    },
    eindhoven: {
      flag: '🇳🇱',
      category: 'Advanced Electron Optics',
      categoryClass: '',
      cat: 'lab',
      year: 'September 1978',
      city: 'Eindhoven, Netherlands',
      inst: 'Philips Application Laboratories',
      role: 'Advanced TEM Certification Specialist',
      desc: 'Underwent intensive specialized training in Transmission Electron Microscopy (TEM), mastering high-resolution interfacial imaging and microstructural defect diagnosis.',
      coords: [51.4416, 5.4697],
      order: 3
    },
    clausthal: {
      flag: '🇩🇪',
      category: 'Research Fellowship',
      categoryClass: '',
      cat: 'deputation',
      year: '1997–1998 & 1998–1999',
      city: 'Clausthal-Zellerfeld, Germany',
      inst: 'Technische Universität Clausthal (TU Clausthal)',
      role: 'Visiting Fellow & Research Fellow, Dept. of Mechanical Engg.',
      desc: 'Conducted collaborative German-Indian research on metal matrix composites, cyclic deformation, and high-temperature wear mechanisms in Lower Saxony.',
      coords: [51.8052, 10.3374],
      order: 4
    },
    baghdad: {
      flag: '🇮🇶',
      category: 'Government Deputation',
      categoryClass: '',
      cat: 'deputation',
      year: 'March 1981 – July 1983',
      city: 'Baghdad, Iraq',
      inst: 'University of Technology, Baghdad',
      role: 'Professor, Dept. of Production & Metallurgy',
      desc: 'Selected for official Government of India deputation to establish research laboratories, commission specialized metallurgical testing equipment, and guide postgraduate scholars.',
      coords: [33.3152, 44.4502],
      order: 5
    },
    tokyo: {
      flag: '🇯🇵',
      category: 'Advanced Electron Optics',
      categoryClass: '',
      cat: 'lab',
      year: 'September 1987',
      city: 'Tokyo, Japan',
      inst: 'JEOL Application Laboratories',
      role: 'Advanced Specialist in Electron Microscopy',
      desc: 'Advanced certification and experimental investigations in Scanning Electron Microscopy (SEM) and analytical Transmission Electron Microscopy (TEM) at JEOL headquarters.',
      coords: [35.7058, 139.3565],
      order: 6
    },
    shenyang: {
      flag: '🇨🇳',
      category: 'Visiting Professorship',
      categoryClass: '',
      cat: 'deputation',
      year: 'October 1987',
      city: 'Shenyang, Liaoning, China',
      inst: 'Northeastern University, China',
      role: 'Visiting Professor in Metallurgical Engineering',
      desc: 'Delivered keynote lectures and specialist university courses on aluminium alloy development, dynamic strain aging, and aerospace alloy strengthening.',
      coords: [41.7656, 123.4190],
      order: 7
    },
    trombay: {
      flag: '🇮🇳',
      category: 'Nuclear Metallurgy',
      categoryClass: 'gold',
      cat: 'national',
      year: 'June – Sept 1979',
      city: 'Trombay, Mumbai, India',
      inst: 'Bhabha Atomic Research Centre (BARC)',
      role: 'UGC Senior National Research Associate',
      desc: 'Investigated nuclear-grade structural materials and high-temperature phase equilibria within the Department of Metallurgy at India’s premier nuclear science center.',
      coords: [19.0060, 72.9234],
      order: 8
    },
    varanasi: {
      flag: '🇮🇳',
      category: 'Golden Jubilee Chair',
      categoryClass: 'gold',
      cat: 'national',
      year: 'May – August 1988',
      city: 'Varanasi, Uttar Pradesh, India',
      inst: 'Banaras Hindu University (BHU)',
      role: 'BHUMET Golden Jubilee Professor',
      desc: 'Conducted endowed Golden Jubilee professorship lectures at BHU\'s Department of Metallurgical Engineering, sharing aerospace alloy research with faculty and graduate researchers.',
      coords: [25.2677, 82.9913],
      order: 9
    },
    indianocean: {
      flag: '🌊',
      category: 'Deep-Sea Oceanic Mission',
      categoryClass: 'deepsea',
      cat: 'mission',
      year: '1999',
      city: 'Central Indian Ocean Basin',
      inst: 'Deep-Sea Oceanic Submersible Expedition',
      role: 'Principal Metallurgical Investigator',
      desc: 'Anchored Ti-6Al-4V titanium test specimens at an extreme depth of 5,100 meters under intense hydrostatic pressure, confirming zero detectable corrosion and supreme passivation.',
      coords: [-12.5000, 76.5000],
      order: 10
    },
    eswarahalli: {
      flag: '🏛️',
      category: 'Dynasty Heritage',
      categoryClass: 'gold',
      cat: 'national',
      year: 'Ancestral Roots',
      city: 'Eswarahalli, Hassan, Karnataka',
      inst: 'Ancestral Homeland of the 14-Engineer Sibling Dynasty',
      role: 'Roots of Academic Dynasty',
      desc: 'The ancestral Karnataka village from which all 14 siblings graduated in engineering, 7 achieved doctorates (Ph.D.s), and 8 became alumni of the Indian Institute of Science.',
      coords: [13.0072, 75.9868],
      order: 11
    }
  };

  const keys = Object.keys(mapData);
  let currentIndex = 0;

  // DOM Elements
  const svgMap = document.getElementById('geo-world-map');
  const mapContainer = document.getElementById('geo-map-container');
  if (!svgMap || !mapContainer) return;

  const tooltip = document.getElementById('geo-map-tooltip');
  const pinElements = document.querySelectorAll('.geo-pin');
  const flightArcs = document.querySelectorAll('.geo-flight-arc');
  const locCards = document.querySelectorAll('.loc-card');
  const filterBtns = document.querySelectorAll('.map-filter-btn');

  // Dossier Inspector UI Elements
  const dossierTag = document.getElementById('dossier-tag');
  const dossierYear = document.getElementById('dossier-year');
  const dossierCity = document.getElementById('dossier-city');
  const dossierInst = document.getElementById('dossier-inst');
  const dossierRole = document.getElementById('dossier-role');
  const dossierDesc = document.getElementById('dossier-desc');
  const dossierCounter = document.getElementById('dossier-counter');
  const prevBtn = document.getElementById('dossier-prev-btn');
  const nextBtn = document.getElementById('dossier-next-btn');

  // Map Toolbar Buttons
  const btnResetView = document.getElementById('map-btn-reset-view');
  const btnFocusMission = document.getElementById('map-btn-focus-mission');
  const btnZoomIn = document.getElementById('map-btn-zoom-in');
  const btnZoomOut = document.getElementById('map-btn-zoom-out');

  // Camera ViewBox State
  let currentViewBox = [0, 0, 360, 180];
  let animFrameId = null;

  // Smooth ViewBox Animation with Cubic Ease-Out
  function animateViewBox(targetVB, duration = 750) {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    const startVB = [...currentViewBox];
    const startTime = performance.now();

    function step(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = 1 - Math.pow(1 - progress, 3);

      currentViewBox = [
        startVB[0] + (targetVB[0] - startVB[0]) * t,
        startVB[1] + (targetVB[1] - startVB[1]) * t,
        startVB[2] + (targetVB[2] - startVB[2]) * t,
        startVB[3] + (targetVB[3] - startVB[3]) * t
      ];

      svgMap.setAttribute(
        'viewBox',
        `${currentViewBox[0].toFixed(2)} ${currentViewBox[1].toFixed(2)} ${currentViewBox[2].toFixed(2)} ${currentViewBox[3].toFixed(2)}`
      );

      if (progress < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        currentViewBox = [...targetVB];
        svgMap.setAttribute(
          'viewBox',
          `${currentViewBox[0].toFixed(2)} ${currentViewBox[1].toFixed(2)} ${currentViewBox[2].toFixed(2)} ${currentViewBox[3].toFixed(2)}`
        );
        animFrameId = null;
      }
    }

    animFrameId = requestAnimationFrame(step);
  }

  // Zoom By Factor
  function zoomBy(factor) {
    const currentCenterX = currentViewBox[0] + currentViewBox[2] / 2;
    const currentCenterY = currentViewBox[1] + currentViewBox[3] / 2;

    let newW = currentViewBox[2] * factor;
    newW = Math.max(25, Math.min(360, newW));
    let newH = newW / 2;

    let minX = currentCenterX - newW / 2;
    let minY = currentCenterY - newH / 2;
    minX = Math.max(0, Math.min(360 - newW, minX));
    minY = Math.max(0, Math.min(180 - newH, minY));

    animateViewBox([minX, minY, newW, newH], 450);
  }

  // Render Selected Location & Synchronize All Interface Panels
  function renderLocation(key, shouldFly = true) {
    const data = mapData[key];
    if (!data) return;

    currentIndex = keys.indexOf(key);

    // Update Dossier Inspector UI
    if (dossierTag) {
      dossierTag.className = `inspector-country-tag ${data.categoryClass}`;
      dossierTag.innerHTML = `<span>${data.flag}</span> <span id="dossier-category">${data.category}</span>`;
    }
    if (dossierYear) dossierYear.textContent = data.year;
    if (dossierCity) dossierCity.textContent = data.city;
    if (dossierInst) dossierInst.textContent = data.inst;
    if (dossierRole) dossierRole.textContent = data.role;
    if (dossierDesc) dossierDesc.textContent = data.desc;
    if (dossierCounter) dossierCounter.textContent = `${data.order} / ${keys.length}`;

    // Update Active Card in Quick Access Grid
    locCards.forEach(card => {
      if (card.getAttribute('data-loc-target') === key) {
        card.classList.add('active');
        // Only scroll the horizontal cards container if user explicitly interacted; never scroll window
        if (shouldFly) {
          const grid = card.closest('.map-loc-grid');
          if (grid) {
            const cardLeft = card.offsetLeft;
            const cardWidth = card.offsetWidth;
            const gridWidth = grid.offsetWidth;
            grid.scrollTo({
              left: cardLeft - (gridWidth / 2) + (cardWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      } else {
        card.classList.remove('active');
      }
    });

    // Update Active Pin in SVG
    pinElements.forEach(pin => {
      if (pin.getAttribute('data-loc') === key) {
        pin.classList.add('active');
        if (pin.parentNode) pin.parentNode.appendChild(pin);
      } else {
        pin.classList.remove('active');
      }
    });

    // Highlight Corresponding Flight Route Arc
    flightArcs.forEach(arc => {
      if (arc.getAttribute('data-arc-target') === key) {
        arc.classList.add('active-arc');
        if (arc.parentNode) arc.parentNode.appendChild(arc);
      } else {
        arc.classList.remove('active-arc');
      }
    });

    // Fluid Camera Glide (viewBox animation)
    if (shouldFly) {
      const targetCenterX = 180 + data.coords[1];
      const targetCenterY = 90 - data.coords[0];
      const targetW = 64;
      const targetH = 32;
      let minX = targetCenterX - targetW / 2;
      let minY = targetCenterY - targetH / 2;
      minX = Math.max(0, Math.min(360 - targetW, minX));
      minY = Math.max(0, Math.min(180 - targetH, minY));
      animateViewBox([minX, minY, targetW, targetH], 800);
    }
  }

  // Interactive Pins: Hover Tooltip & Click Selection
  pinElements.forEach(pin => {
    const locKey = pin.getAttribute('data-loc');
    const data = mapData[locKey];
    if (!data) return;

    pin.addEventListener('mouseenter', () => {
      if (!tooltip) return;
      tooltip.innerHTML = `
        <div class="tooltip-tag">${data.flag} ${data.category}</div>
        <div class="tooltip-city">${data.city}</div>
        <div class="tooltip-inst">${data.inst}</div>
        <div class="tooltip-year">${data.year}</div>
      `;
      tooltip.style.display = 'block';
    });

    pin.addEventListener('mousemove', (e) => {
      if (!tooltip || tooltip.style.display === 'none') return;
      const rect = mapContainer.getBoundingClientRect();
      let left = e.clientX - rect.left + 14;
      let top = e.clientY - rect.top - 14;
      if (left + 230 > rect.width) left = e.clientX - rect.left - 235;
      if (top < 10) top = 10;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    pin.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.style.display = 'none';
    });

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      renderLocation(locKey, true);
    });
  });

  // Location Cards Click Handlers
  locCards.forEach(card => {
    card.addEventListener('click', () => {
      const locKey = card.getAttribute('data-loc-target');
      if (locKey) renderLocation(locKey, true);
    });
  });

  // Next / Previous Navigation Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + keys.length) % keys.length;
      renderLocation(keys[currentIndex], true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % keys.length;
      renderLocation(keys[currentIndex], true);
    });
  }

  // Toolbar Handlers: World Overview & Focus Mission
  if (btnResetView) {
    btnResetView.addEventListener('click', () => {
      animateViewBox([0, 0, 360, 180], 800);
    });
  }

  if (btnFocusMission) {
    btnFocusMission.addEventListener('click', () => {
      renderLocation(keys[currentIndex], true);
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      zoomBy(0.7);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      zoomBy(1.4);
    });
  }

  // Drag-to-Pan on Map Surface
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartVB = [...currentViewBox];

  mapContainer.addEventListener('mousedown', (e) => {
    if (e.target.closest('button') || e.target.closest('.geo-pin')) return;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartVB = [...currentViewBox];
    mapContainer.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = mapContainer.getBoundingClientRect();
    const dx = ((e.clientX - dragStartX) / rect.width) * dragStartVB[2];
    const dy = ((e.clientY - dragStartY) / rect.height) * dragStartVB[3];

    let newMinX = dragStartVB[0] - dx;
    let newMinY = dragStartVB[1] - dy;
    newMinX = Math.max(-10, Math.min(370 - dragStartVB[2], newMinX));
    newMinY = Math.max(-5, Math.min(185 - dragStartVB[3], newMinY));

    currentViewBox[0] = newMinX;
    currentViewBox[1] = newMinY;
    svgMap.setAttribute(
      'viewBox',
      `${newMinX.toFixed(2)} ${newMinY.toFixed(2)} ${currentViewBox[2].toFixed(2)} ${currentViewBox[3].toFixed(2)}`
    );
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      mapContainer.style.cursor = '';
    }
  });

  // Touch Support for Mobile Drag
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartVB = [...currentViewBox];
  let isTouching = false;

  mapContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest('button') || e.target.closest('.geo-pin')) return;
      isTouching = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartVB = [...currentViewBox];
    }
  }, { passive: true });

  mapContainer.addEventListener('touchmove', (e) => {
    if (!isTouching || e.touches.length !== 1) return;
    const rect = mapContainer.getBoundingClientRect();
    const dx = ((e.touches[0].clientX - touchStartX) / rect.width) * touchStartVB[2];
    const dy = ((e.touches[0].clientY - touchStartY) / rect.height) * touchStartVB[3];

    let newMinX = touchStartVB[0] - dx;
    let newMinY = touchStartVB[1] - dy;
    newMinX = Math.max(-10, Math.min(370 - touchStartVB[2], newMinX));
    newMinY = Math.max(-5, Math.min(185 - touchStartVB[3], newMinY));

    currentViewBox[0] = newMinX;
    currentViewBox[1] = newMinY;
    svgMap.setAttribute(
      'viewBox',
      `${newMinX.toFixed(2)} ${newMinY.toFixed(2)} ${currentViewBox[2].toFixed(2)} ${currentViewBox[3].toFixed(2)}`
    );
  }, { passive: true });

  mapContainer.addEventListener('touchend', () => {
    isTouching = false;
  });

  // Mouse Wheel Zoom
  mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const rect = mapContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const svgX = currentViewBox[0] + (mouseX / rect.width) * currentViewBox[2];
    const svgY = currentViewBox[1] + (mouseY / rect.height) * currentViewBox[3];

    const zoomFactor = e.deltaY < 0 ? 0.88 : 1.14;
    let newW = currentViewBox[2] * zoomFactor;
    newW = Math.max(25, Math.min(360, newW));
    let newH = newW / 2;

    let newMinX = svgX - (mouseX / rect.width) * newW;
    let newMinY = svgY - (mouseY / rect.height) * newH;
    newMinX = Math.max(0, Math.min(360 - newW, newMinX));
    newMinY = Math.max(0, Math.min(180 - newH, newMinY));

    currentViewBox = [newMinX, newMinY, newW, newH];
    svgMap.setAttribute(
      'viewBox',
      `${newMinX.toFixed(2)} ${newMinY.toFixed(2)} ${newW.toFixed(2)} ${newH.toFixed(2)}`
    );
  }, { passive: false });

  // Category Filter Bar Handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-map-filter');

      // Filter Pins
      pinElements.forEach(pin => {
        const cat = pin.getAttribute('data-cat');
        const isMatch = (filter === 'all' || cat === filter);
        pin.style.display = isMatch ? '' : 'none';
      });

      // Filter Flight Route Arcs
      flightArcs.forEach(arc => {
        const targetLoc = arc.getAttribute('data-arc-target');
        const item = mapData[targetLoc];
        const isMatch = (filter === 'all' || (item && item.cat === filter));
        arc.style.display = isMatch ? '' : 'none';
      });

      // Filter Quick Cards
      locCards.forEach(card => {
        const cat = card.getAttribute('data-loc-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // If current selected mission is hidden by filter, switch to first visible
      const currentItem = mapData[keys[currentIndex]];
      if (filter !== 'all' && currentItem && currentItem.cat !== filter) {
        const firstVisibleKey = keys.find(k => mapData[k].cat === filter);
        if (firstVisibleKey) {
          renderLocation(firstVisibleKey, true);
        }
      } else if (filter === 'all') {
        animateViewBox([0, 0, 360, 180], 700);
      }
    });
  });

  // Render initial location (Bengaluru HQ) smoothly without jarring camera jump
  setTimeout(() => {
    renderLocation('bengaluru', false);
  }, 100);
}

/* --------------------------------------------------------------------------
   8. Dynamic Content Hydration (Synchronized with Admin Portal)
   -------------------------------------------------------------------------- */
async function initDynamicContent() {
  const STORAGE_KEY = 'esd_site_content';
  let content = null;

  // 1. Check local device overrides from Admin Portal
  const localSaved = localStorage.getItem(STORAGE_KEY);
  if (localSaved) {
    try {
      content = JSON.parse(localSaved);
    } catch (e) {
      console.warn('Error reading local content overrides:', e);
    }
  }

  // 2. If not in localStorage, fetch published data/content.json
  if (!content) {
    try {
      const res = await fetch('data/content.json?v=' + Date.now());
      if (res.ok) {
        content = await res.json();
      }
    } catch (e) {
      // Graceful fallback: default static HTML remains active with zero impact
    }
  }

  if (!content) return;

  // 3. Hydrate Hero Section
  if (content.hero) {
    if (content.hero.name) {
      document.querySelectorAll('.hero-name').forEach(el => el.innerHTML = content.hero.name);
      document.querySelectorAll('.brand-name').forEach(el => el.innerHTML = content.hero.name);
    }
    if (content.hero.fullname) {
      const el = document.querySelector('.hero-fullname');
      if (el) el.innerHTML = content.hero.fullname;
    }
    if (content.hero.title) {
      const el = document.querySelector('.hero-title');
      if (el) el.innerHTML = content.hero.title;
    }
    if (content.hero.live_status) {
      const el = document.querySelector('.hero-live-status span:last-child');
      if (el) el.innerHTML = content.hero.live_status;
    }
    if (content.hero.summary) {
      const el = document.querySelector('.hero-summary');
      if (el) el.innerHTML = content.hero.summary;
    }
  }

  // 4. Hydrate Strategic Stats
  if (content.stats && Array.isArray(content.stats)) {
    const statCards = document.querySelectorAll('.strategic-strip .stat-card');
    content.stats.forEach((st, idx) => {
      const card = statCards[idx];
      if (card) {
        const numEl = card.querySelector('.stat-number');
        const lblEl = card.querySelector('.stat-label');
        const subEl = card.querySelector('.stat-sublabel');
        if (numEl && st.number) numEl.innerHTML = st.number;
        if (lblEl && st.label) lblEl.innerHTML = st.label;
        if (subEl && st.sublabel) subEl.innerHTML = st.sublabel;
      }
    });
  }

  // 5. Hydrate About & Heritage
  if (content.about) {
    if (content.about.section_subtitle) {
      const el = document.querySelector('#about .section-subtitle');
      if (el) el.innerHTML = content.about.section_subtitle;
    }
    const heritageParas = document.querySelectorAll('#about .heritage-text');
    if (heritageParas.length >= 3) {
      if (content.about.heritage_p1) heritageParas[0].innerHTML = content.about.heritage_p1;
      if (content.about.heritage_p2) heritageParas[1].innerHTML = content.about.heritage_p2;
      if (content.about.heritage_quote) {
        const cleanQuote = content.about.heritage_quote.replace(/^["“”]|["“”]$/g, '').trim();
        heritageParas[2].innerHTML = `"${cleanQuote}"`;
      }
    }
  }

  // 6. Hydrate Breakthroughs
  if (content.breakthroughs && Array.isArray(content.breakthroughs)) {
    const cards = document.querySelectorAll('.breakthrough-card');
    content.breakthroughs.forEach((bk, idx) => {
      const card = cards[idx];
      if (card) {
        const domEl = card.querySelector('.breakthrough-domain');
        const titleEl = card.querySelector('.breakthrough-title');
        const descEl = card.querySelector('.breakthrough-desc');
        if (domEl && bk.domain) domEl.innerHTML = bk.domain;
        if (titleEl && bk.title) titleEl.innerHTML = bk.title;
        if (descEl && bk.desc) descEl.innerHTML = bk.desc;
      }
    });
  }

  // 7. Hydrate Contact Info
  if (content.contact && content.contact.email) {
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      emailLink.href = `mailto:${content.contact.email}`;
      emailLink.innerHTML = content.contact.email;
    }
  }
}


