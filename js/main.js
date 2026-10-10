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
      zoom: 12,
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
      zoom: 8,
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
      zoom: 9,
      order: 3
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
      zoom: 10,
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
      zoom: 9,
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
      zoom: 9,
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
      zoom: 8,
      order: 7
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
      zoom: 10,
      order: 8
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
      zoom: 9,
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
      zoom: 6,
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
      zoom: 11,
      order: 11
    }
  };

  const keys = Object.keys(mapData);
  let currentIndex = 0;
  const defaultCenter = [22.0, 48.0];
  const defaultZoom = 2.6;

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

  const locCards = document.querySelectorAll('.loc-card');
  const filterBtns = document.querySelectorAll('.map-filter-btn');
  const btnResetView = document.getElementById('map-btn-reset-view');
  const btnFocusMission = document.getElementById('map-btn-focus-mission');
  const layerPills = document.querySelectorAll('.layer-pill-btn');

  // Verify Leaflet availability
  const mapElement = document.getElementById('real-global-map');
  if (!mapElement || typeof L === 'undefined') {
    console.warn('Leaflet map engine container or library not ready.');
    return;
  }

  // Initialize Leaflet Map
  const map = L.map('real-global-map', {
    center: defaultCenter,
    zoom: defaultZoom,
    minZoom: 2,
    maxZoom: 17,
    scrollWheelZoom: false,
    zoomControl: false
  });

  // Position Zoom Control top-right
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Basemap Tile Providers
  const tileLayers = {
    voyager: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &mdash; Earthstar Geographics',
      maxZoom: 17
    })
  };

  // Set initial tile layer according to site theme
  const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
  let activeTileLayerKey = initialTheme === 'dark' ? 'dark' : 'voyager';
  tileLayers[activeTileLayerKey].addTo(map);

  // Update active pill UI
  function updateLayerPillsUI(activeKey) {
    layerPills.forEach(pill => {
      if (pill.getAttribute('data-map-layer') === activeKey) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }
  updateLayerPillsUI(activeTileLayerKey);

  // Switch Tile Layer Function
  function switchTileLayer(layerKey) {
    if (layerKey === activeTileLayerKey) return;
    map.removeLayer(tileLayers[activeTileLayerKey]);
    tileLayers[layerKey].addTo(map);
    activeTileLayerKey = layerKey;
    updateLayerPillsUI(layerKey);
  }

  // Layer Selector Pill Handlers
  layerPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetLayer = pill.getAttribute('data-map-layer');
      if (targetLayer && tileLayers[targetLayer]) {
        switchTileLayer(targetLayer);
      }
    });
  });

  // Auto-switch tile layer when global site theme changes
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      setTimeout(() => {
        const newTheme = document.documentElement.getAttribute('data-theme');
        if (newTheme === 'dark' && activeTileLayerKey === 'voyager') {
          switchTileLayer('dark');
        } else if (newTheme === 'light' && activeTileLayerKey === 'dark') {
          switchTileLayer('voyager');
        }
      }, 50);
    });
  }

  // Spherical Great-Circle Interpolation for Authentic Flight Arcs
  function getGreatCirclePoints(start, end, numPoints = 40) {
    const points = [];
    const lat1 = start[0] * Math.PI / 180;
    const lon1 = start[1] * Math.PI / 180;
    const lat2 = end[0] * Math.PI / 180;
    const lon2 = end[1] * Math.PI / 180;

    const d = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
    ));

    if (d === 0) return [start, end];

    for (let i = 0; i <= numPoints; i++) {
      const f = i / numPoints;
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);

      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);

      const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
      const lon = Math.atan2(y, x) * 180 / Math.PI;
      points.push([lat, lon]);
    }
    return points;
  }

  // Create Custom Interactive Markers & Flight Routes
  const markers = {};
  const flightRoutes = {};
  const bngCoords = mapData.bengaluru.coords;

  // Build Flight Arcs radiating from IISc Bengaluru
  keys.forEach(key => {
    if (key === 'bengaluru') return;
    const dest = mapData[key];
    const arcPoints = getGreatCirclePoints(bngCoords, dest.coords);

    const routePolyline = L.polyline(arcPoints, {
      className: 'leaflet-flight-path',
      weight: 2.2,
      opacity: 0.75,
      smoothFactor: 1
    }).addTo(map);

    flightRoutes[key] = routePolyline;
  });

  // Build Markers with Pulsing Radar Ripple Rings
  keys.forEach(key => {
    const loc = mapData[key];
    const isHQ = key === 'bengaluru';

    const customIcon = L.divIcon({
      className: 'custom-map-marker-wrapper',
      html: `
        <div class="custom-map-marker marker-${loc.cat} ${isHQ ? 'marker-hq' : ''}" id="map-marker-${key}">
          <div class="marker-pulse-ring"></div>
          <div class="marker-core-dot">
            ${isHQ ? '<svg width="9" height="9" viewBox="0 0 24 24" fill="#0f172a"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' : ''}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });

    const marker = L.marker(loc.coords, { icon: customIcon }).addTo(map);

    // Custom Glassmorphic Popup
    const popupContent = `
      <div class="map-popup-card">
        <span class="map-popup-tag">${loc.flag} ${loc.category}</span>
        <div class="map-popup-city">${loc.city}</div>
        <div class="map-popup-inst">${loc.inst}</div>
        <div class="map-popup-year">${loc.year}</div>
      </div>
    `;
    marker.bindPopup(popupContent, {
      closeButton: false,
      autoPan: false,
      offset: [0, -12]
    });

    marker.on('click', () => {
      renderLocation(key, false);
    });

    markers[key] = marker;
  });

  // Render Selected Location & Synchronize Dossier, Cards, Routes, and Camera
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
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        card.classList.remove('active');
      }
    });

    // Update Active Marker UI & Pulsing Animation
    keys.forEach(k => {
      const markerEl = document.getElementById(`map-marker-${k}`);
      if (markerEl) {
        if (k === key) {
          markerEl.classList.add('active-marker');
        } else {
          markerEl.classList.remove('active-marker');
        }
      }
    });

    // Open active marker popup
    if (markers[key]) {
      markers[key].openPopup();
    }

    // Highlight Corresponding Flight Route Arc
    Object.keys(flightRoutes).forEach(routeKey => {
      const polyline = flightRoutes[routeKey];
      const el = polyline.getElement();
      if (el) {
        if (routeKey === key) {
          el.classList.add('active-route');
        } else {
          el.classList.remove('active-route');
        }
      }
    });

    // Fluid Camera Glide (flyTo)
    if (shouldFly && map) {
      map.flyTo(data.coords, data.zoom, {
        animate: true,
        duration: 1.4,
        easeLinearity: 0.25
      });
    }
  }

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
      map.flyTo(defaultCenter, defaultZoom, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
      // Close popups in overview
      map.closePopup();
    });
  }

  if (btnFocusMission) {
    btnFocusMission.addEventListener('click', () => {
      renderLocation(keys[currentIndex], true);
    });
  }

  // Category Filter Bar Handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-map-filter');

      // Filter Markers and Flight Routes
      const visibleCoords = [];

      keys.forEach(key => {
        const item = mapData[key];
        const isMatch = (filter === 'all' || item.cat === filter);
        const marker = markers[key];
        const route = flightRoutes[key];

        if (marker) {
          if (isMatch) {
            if (!map.hasLayer(marker)) map.addLayer(marker);
            visibleCoords.push(item.coords);
          } else {
            if (map.hasLayer(marker)) map.removeLayer(marker);
          }
        }

        if (route) {
          if (isMatch) {
            if (!map.hasLayer(route)) map.addLayer(route);
          } else {
            if (map.hasLayer(route)) map.removeLayer(route);
          }
        }
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

      // Select first visible and fit bounds or center
      const firstVisible = Array.from(locCards).find(c => c.style.display !== 'none');
      if (firstVisible) {
        const firstKey = firstVisible.getAttribute('data-loc-target');
        renderLocation(firstKey, false);
      }

      if (visibleCoords.length > 1 && filter !== 'all') {
        const bounds = L.latLngBounds(visibleCoords);
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 });
      } else if (filter === 'all') {
        map.flyTo(defaultCenter, defaultZoom, { duration: 1.2 });
      }
    });
  });

  // Render initial location (Bengaluru HQ) without jarring camera jump
  setTimeout(() => {
    renderLocation('bengaluru', false);
    // Invalidate map size to ensure sharp tile rendering once DOM is fully drawn
    map.invalidateSize();
  }, 250);
}

