/**
 * ENTERPRISE PORTAL SCRIPTS
 * Prof. E. S. Dwarakadasa | Personal Profile & Technology Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initReadingProgress();
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
    hamburgerBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          hamburgerBtn.setAttribute('aria-expanded', false);
        }
      });
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
   5. Contact Form Simulation & Industrial Routing
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('academic-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const service = form.querySelector('#contact-service').value;
    const message = form.querySelector('#contact-message').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.');
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
      </svg>
      Routing Inquiry to Office...
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();
      showToast('Inquiry received! Executive office will follow up shortly.');
    }, 1200);
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
function initInteractiveMap() {
  const mapData = {
    bengaluru: {
      flag: '🇮🇳',
      category: 'Academic & Tech HQ',
      categoryClass: 'gold',
      year: '1961 – Present',
      city: 'Bengaluru, India',
      inst: 'Indian Institute of Science (IISc) & KHMD Limited',
      role: 'Emeritus Professor (IISc) • CEO & MD (KHMD)',
      desc: 'The central epicenter of Prof. Dwarakadasa’s career. Spanning 42 continuous years on the faculty of IISc’s Department of Metallurgy (Materials Engineering), guiding 28 Ph.D. scholars, pioneering LCA Tejas Al-Li alloys, and serving as CEO & MD of KHMD delivering over 2,000 space-grade subsystems for ISRO\'s Chandrayaan missions.',
      order: 1
    },
    maryland: {
      flag: '🇺🇸',
      category: 'Postdoctoral Fellowship',
      categoryClass: '',
      year: '1972 – 1973',
      city: 'College Park, Maryland, USA',
      inst: 'University of Maryland, College Park',
      role: 'Postdoctoral Fellow, Department of Mechanical Engineering',
      desc: 'Conducted advanced postdoctoral research in physical metallurgy, focusing on dislocation mechanics, solute-vacancy interactions, and precipitation hardening in advanced structural alloys.',
      order: 2
    },
    eindhoven: {
      flag: '🇳🇱',
      category: 'Advanced Electron Optics',
      categoryClass: '',
      year: 'September 1978',
      city: 'Eindhoven, Netherlands',
      inst: 'Philips Application Laboratories',
      role: 'Advanced TEM Certification Specialist',
      desc: 'Underwent intensive specialized training in Transmission Electron Microscopy (TEM), mastering high-resolution interfacial imaging and microstructural defect diagnosis.',
      order: 3
    },
    trombay: {
      flag: '🇮🇳',
      category: 'Nuclear Metallurgy',
      categoryClass: 'gold',
      year: 'June – Sept 1979',
      city: 'Trombay, Mumbai, India',
      inst: 'Bhabha Atomic Research Centre (BARC)',
      role: 'UGC Senior National Research Associate',
      desc: 'Investigated nuclear-grade structural materials and high-temperature phase equilibria within the Department of Metallurgy at India’s premier nuclear science center.',
      order: 4
    },
    baghdad: {
      flag: '🇮🇶',
      category: 'Government Deputation',
      categoryClass: '',
      year: 'March 1981 – July 1983',
      city: 'Baghdad, Iraq',
      inst: 'University of Technology, Baghdad',
      role: 'Professor, Dept. of Production & Metallurgy',
      desc: 'Selected for official Government of India deputation to establish research laboratories, commission specialized metallurgical testing equipment, and guide postgraduate scholars.',
      order: 5
    },
    tokyo: {
      flag: '🇯🇵',
      category: 'Advanced Electron Optics',
      categoryClass: '',
      year: 'September 1987',
      city: 'Tokyo, Japan',
      inst: 'JEOL Application Laboratories',
      role: 'Advanced Specialist in Electron Microscopy',
      desc: 'Advanced certification and experimental investigations in Scanning Electron Microscopy (SEM) and analytical Transmission Electron Microscopy (TEM) at JEOL headquarters.',
      order: 6
    },
    shenyang: {
      flag: '🇨🇳',
      category: 'Visiting Professorship',
      categoryClass: '',
      year: 'October 1987',
      city: 'Shenyang, Liaoning, China',
      inst: 'Northeastern University, China',
      role: 'Visiting Professor in Metallurgical Engineering',
      desc: 'Delivered keynote lectures and specialist university courses on aluminium alloy development, dynamic strain aging, and aerospace alloy strengthening.',
      order: 7
    },
    varanasi: {
      flag: '🇮🇳',
      category: 'Golden Jubilee Chair',
      categoryClass: 'gold',
      year: 'May – August 1988',
      city: 'Varanasi, Uttar Pradesh, India',
      inst: 'Banaras Hindu University (BHU)',
      role: 'BHUMET Golden Jubilee Professor',
      desc: 'Conducted endowed Golden Jubilee professorship lectures at BHU\'s Department of Metallurgical Engineering, sharing aerospace alloy research with faculty and graduate researchers.',
      order: 8
    },
    clausthal: {
      flag: '🇩🇪',
      category: 'Research Fellowship',
      categoryClass: '',
      year: '1997–1998 & 1998–1999',
      city: 'Clausthal-Zellerfeld, Germany',
      inst: 'Technische Universität Clausthal (TU Clausthal)',
      role: 'Visiting Fellow & Research Fellow, Dept. of Mechanical Engg.',
      desc: 'Conducted collaborative German-Indian research on metal matrix composites, cyclic deformation, and high-temperature wear mechanisms in Lower Saxony.',
      order: 9
    },
    indianocean: {
      flag: '🌊',
      category: 'Deep-Sea Oceanic Mission',
      categoryClass: 'deepsea',
      year: '1999',
      city: 'Central Indian Ocean Basin',
      inst: 'Deep-Sea Oceanic Submersible Expedition',
      role: 'Principal Metallurgical Investigator',
      desc: 'Anchored Ti-6Al-4V titanium test specimens at an extreme depth of 5,100 meters under intense hydrostatic pressure, confirming zero detectable corrosion and supreme passivation.',
      order: 10
    },
    eswarahalli: {
      flag: '🏛️',
      category: 'Dynasty Heritage',
      categoryClass: 'gold',
      year: 'Ancestral Roots',
      city: 'Eswarahalli, Hassan, Karnataka',
      inst: 'Ancestral Homeland of the 14-Engineer Sibling Dynasty',
      role: 'Roots of Academic Dynasty',
      desc: 'The ancestral Karnataka village from which all 14 siblings graduated in engineering, 7 achieved doctorates (Ph.D.s), and 8 became alumni of the Indian Institute of Science.',
      order: 11
    }
  };

  const keys = Object.keys(mapData);
  let currentIndex = 0;

  // UI Elements
  const dossierTag = document.getElementById('dossier-tag');
  const dossierYear = document.getElementById('dossier-year');
  const dossierCity = document.getElementById('dossier-city');
  const dossierInst = document.getElementById('dossier-inst');
  const dossierRole = document.getElementById('dossier-role');
  const dossierDesc = document.getElementById('dossier-desc');
  const dossierCounter = document.getElementById('dossier-counter');
  const prevBtn = document.getElementById('dossier-prev-btn');
  const nextBtn = document.getElementById('dossier-next-btn');

  const pins = document.querySelectorAll('.map-pin');
  const locCards = document.querySelectorAll('.loc-card');
  const filterBtns = document.querySelectorAll('.map-filter-btn');

  function renderLocation(key) {
    const data = mapData[key];
    if (!data) return;

    currentIndex = keys.indexOf(key);

    // Update Inspector Dossier
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

    // Highlight active pin
    pins.forEach(pin => {
      if (pin.getAttribute('data-loc') === key) {
        pin.classList.add('active');
      } else {
        pin.classList.remove('active');
      }
    });

    // Highlight active card
    locCards.forEach(card => {
      if (card.getAttribute('data-loc-target') === key) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        card.classList.remove('active');
      }
    });

    // Highlight corresponding flight route arc
    document.querySelectorAll('.map-route-arc').forEach(arc => {
      if (arc.getAttribute('data-arc-target') === key) {
        arc.style.strokeWidth = '3px';
        arc.style.opacity = '1';
      } else {
        arc.style.strokeWidth = '';
        arc.style.opacity = '';
      }
    });
  }

  // Pin Click Handlers
  pins.forEach(pin => {
    pin.addEventListener('click', () => {
      const locKey = pin.getAttribute('data-loc');
      if (locKey) renderLocation(locKey);
    });
  });

  // Card Click Handlers
  locCards.forEach(card => {
    card.addEventListener('click', () => {
      const locKey = card.getAttribute('data-loc-target');
      if (locKey) renderLocation(locKey);
    });
  });

  // Next / Prev Button Handlers
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + keys.length) % keys.length;
      renderLocation(keys[currentIndex]);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % keys.length;
      renderLocation(keys[currentIndex]);
    });
  }

  // Category Filter Bar Handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-map-filter');

      // Filter pins
      pins.forEach(pin => {
        const cat = pin.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          pin.style.display = 'block';
        } else {
          pin.style.display = 'none';
        }
      });

      // Filter cards
      locCards.forEach(card => {
        const cat = card.getAttribute('data-loc-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // Select first visible
      const firstVisible = Array.from(locCards).find(c => c.style.display !== 'none');
      if (firstVisible) {
        renderLocation(firstVisible.getAttribute('data-loc-target'));
      }
    });
  });
}

