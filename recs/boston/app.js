(function () {
  'use strict';

  var MEALS = {
    breakfast: { label: 'Breakfast', color: '#E9C46A' },
    brunch:    { label: 'Brunch',    color: '#F4A261' },
    lunch:     { label: 'Lunch',     color: '#8AB17D' },
    dinner:    { label: 'Dinner',    color: '#E76F51' },
    bar:       { label: 'Bar',       color: '#264653' },
    coffee:    { label: 'Coffee',    color: '#8B5E3C' }
  };
  var MAP_COLORS = {
    land: '#FBF5EA', water: '#A8CBD4', park: '#CFDDB9', building: '#F1E4CF',
    roadMajor: '#EED9BC', road: '#FFFFFF', label: '#4A4037', boundary: '#C9B79C'
  };
  var PIN_PATH = 'M12 1.8C7.7 1.8 4.3 5.1 4.3 9.3c0 5.5 6.4 11.3 7 11.9a1 1 0 0 0 1.4 0c.6-.6 7-6.4 7-11.9 0-4.2-3.4-7.5-7.7-7.5z';
  var DOT_PATH = 'M12 6.6a2.7 2.7 0 1 0 0 5.4a2.7 2.7 0 1 0 0-5.4z';
  var START = { center: [-71.104, 42.373], zoomPhone: 11.9, zoomWide: 13.2 };

  var els = {
    intro: document.getElementById('intro'),
    filters: document.getElementById('filters'),
    detail: document.getElementById('detail'),
    name: document.getElementById('d-name'),
    meta: document.getElementById('d-meta'),
    context: document.getElementById('d-context'),
    tags: document.getElementById('d-tags'),
    address: document.getElementById('d-address'),
    notes: document.getElementById('d-notes'),
    notesList: document.getElementById('d-notes-list'),
    close: document.getElementById('d-close'),
    header: document.querySelector('.header'),
    panel: document.getElementById('panel')
  };

  var places = [];
  var markers = {};
  var selectedId = null;
  var activeFilters = [];
  var map;

  function isWide() { return window.matchMedia('(min-width: 900px)').matches; }

  function mealKeys(p) {
    var k = (p.recommendedFor || []).filter(function (m) { return MEALS[m]; });
    return k.length ? k : ['lunch'];
  }

  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (a) { n.setAttribute(a, attrs[a]); });
    if (text != null) n.textContent = text;
    return n;
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (a) { n.setAttribute(a, attrs[a]); });
    return n;
  }

  // Teardrop pin; a place recommended for two things is split down the middle.
  function pinSvg(colors, gid) {
    var svg = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', overflow: 'visible' });
    var fill = colors[0];
    if (colors.length > 1) {
      var defs = svgEl('defs', {});
      var g = svgEl('linearGradient', { id: gid, x1: '0', y1: '0', x2: '1', y2: '0' });
      g.appendChild(svgEl('stop', { offset: '0.5', 'stop-color': colors[0] }));
      g.appendChild(svgEl('stop', { offset: '0.5', 'stop-color': colors[1] }));
      defs.appendChild(g);
      svg.appendChild(defs);
      fill = 'url(#' + gid + ')';
    }
    // Only the pin's own shape takes taps, so a pin peeking out from behind another stays tappable.
    svg.appendChild(svgEl('path', { d: PIN_PATH, class: 'pin-hit', fill: 'transparent', stroke: 'transparent', 'stroke-width': '4' }));
    svg.appendChild(svgEl('path', { d: PIN_PATH, class: 'pin-shape', fill: fill, stroke: '#141414', 'stroke-width': '1.6', 'stroke-linejoin': 'round' }));
    svg.appendChild(svgEl('path', { d: DOT_PATH, fill: '#FFFFFF', stroke: '#141414', 'stroke-width': '1.4' }));
    return svg;
  }

  // Meal buttons double as the legend and a filter. None pressed = show everything.
  function buildFilters() {
    Object.keys(MEALS).forEach(function (k) {
      var b = el('button', { type: 'button', class: 'filter', 'aria-pressed': 'false', 'data-meal': k });
      var s = pinSvg([MEALS[k].color], 'lg-' + k);
      s.setAttribute('width', '18'); s.setAttribute('height', '18');
      b.appendChild(s);
      b.appendChild(document.createTextNode(MEALS[k].label));
      b.style.setProperty('--meal', MEALS[k].color);
      b.addEventListener('click', function () { toggleFilter(k, b); });
      els.filters.appendChild(b);
    });
  }

  function toggleFilter(k, b) {
    var i = activeFilters.indexOf(k);
    if (i >= 0) activeFilters.splice(i, 1); else activeFilters.push(k);
    b.setAttribute('aria-pressed', i >= 0 ? 'false' : 'true');
    applyFilters();
  }

  function matches(p) {
    if (!activeFilters.length) return true;
    return mealKeys(p).some(function (k) { return activeFilters.indexOf(k) >= 0; });
  }

  function applyFilters() {
    places.forEach(function (p) {
      var m = markers[p.id];
      if (m) m.el.hidden = !matches(p);
    });
    if (selectedId) {
      var sel = places.find(function (x) { return x.id === selectedId; });
      if (sel && !matches(sel)) closeDetail();
    }
  }

  // Recolor the free OpenFreeMap basemap into the Earth & Clay palette.
  function recolor() {
    var layers = (map.getStyle() && map.getStyle().layers) || [];
    layers.forEach(function (l) {
      var id = l.id.toLowerCase();
      try {
        if (l.type === 'background') {
          map.setPaintProperty(l.id, 'background-color', MAP_COLORS.land);
        } else if (l.type === 'fill') {
          if (/water|ocean|lake|river/.test(id)) map.setPaintProperty(l.id, 'fill-color', MAP_COLORS.water);
          else if (/park|wood|forest|grass|green|cemetery|golf|pitch|garden|landcover|nature|scrub/.test(id)) map.setPaintProperty(l.id, 'fill-color', MAP_COLORS.park);
          else if (/building/.test(id)) { map.setPaintProperty(l.id, 'fill-color', MAP_COLORS.building); try { map.setPaintProperty(l.id, 'fill-outline-color', '#E3D2B6'); } catch (e) {} }
          else map.setPaintProperty(l.id, 'fill-color', MAP_COLORS.land);
        } else if (l.type === 'line') {
          if (/water|river|stream|canal/.test(id)) map.setPaintProperty(l.id, 'line-color', MAP_COLORS.water);
          else if (/boundary|admin/.test(id)) map.setPaintProperty(l.id, 'line-color', MAP_COLORS.boundary);
          else if (/motorway|trunk|primary/.test(id)) map.setPaintProperty(l.id, 'line-color', MAP_COLORS.roadMajor);
          else if (/road|highway|street|bridge|tunnel|path|secondary|tertiary|minor|service|link|rail/.test(id)) map.setPaintProperty(l.id, 'line-color', /rail/.test(id) ? '#D9C7A8' : MAP_COLORS.road);
        } else if (l.type === 'symbol' && l.layout && l.layout['text-field']) {
          map.setPaintProperty(l.id, 'text-color', /water/.test(id) ? '#3D6E7A' : MAP_COLORS.label);
          map.setPaintProperty(l.id, 'text-halo-color', MAP_COLORS.land);
        }
      } catch (e) { /* some layers use expressions we leave alone */ }
    });
  }

  // Keep the selected pin in the open part of the map, clear of the header and the card.
  function viewPadding() {
    var top = els.header.getBoundingClientRect().height + 24;
    if (isWide()) return { top: top, bottom: 24, left: 24, right: 420 };
    var panelH = els.panel.getBoundingClientRect().height;
    return { top: top + 30, bottom: panelH + 24, left: 24, right: 24 };
  }

  function addMarkers() {
    places.forEach(function (p) {
      var colors = mealKeys(p).map(function (k) { return MEALS[k].color; });
      var btn = el('button', { type: 'button', class: 'pin', 'aria-label': p.name });
      btn.appendChild(pinSvg(colors, 'pg-' + p.id));
      btn.addEventListener('click', function (e) { e.stopPropagation(); select(p.id); });
      btn.addEventListener('mouseenter', function () { if (selectedId !== p.id) btn.style.zIndex = '4'; });
      btn.addEventListener('mouseleave', function () { if (selectedId !== p.id) btn.style.zIndex = ''; });
      var m = new maplibregl.Marker({ element: btn, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(map);
      markers[p.id] = { marker: m, el: btn };
    });
  }

  function renderDetail(p) {
    els.name.textContent = '';
    if (p.website) {
      var a = el('a', { href: p.website, target: '_blank', rel: 'noopener' });
      a.appendChild(document.createTextNode(p.name));
      var icon = svgEl('svg', { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', role: 'img', 'aria-label': '(opens website)' });
      ['M14 4h6v6', 'M20 4L10 14', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'].forEach(function (d) { icon.appendChild(svgEl('path', { d: d })); });
      a.appendChild(icon);
      els.name.appendChild(a);
    } else {
      els.name.textContent = p.name;
    }

    var keys = mealKeys(p);
    els.meta.textContent = '';
    var sw = el('span', { class: 'swatch' });
    sw.style.background = keys.length > 1
      ? 'linear-gradient(90deg,' + MEALS[keys[0]].color + ' 50%,' + MEALS[keys[1]].color + ' 50%)'
      : MEALS[keys[0]].color;
    els.meta.appendChild(sw);
    els.meta.appendChild(document.createTextNode('Recommended for ' + keys.map(function (k) { return MEALS[k].label.toLowerCase(); }).join(' + ') + ' · ' + p.area));

    els.context.hidden = !p.context;
    els.context.textContent = p.context || '';

    els.tags.textContent = '';
    (p.tags || []).forEach(function (t) { els.tags.appendChild(el('li', null, t)); });
    els.tags.hidden = !(p.tags && p.tags.length);

    els.address.textContent = p.address || '';

    els.notesList.textContent = '';
    var notes = p.notes || {};
    [['kaz', 'Kaz', 'K'], ['dj', 'DJ', 'D']].forEach(function (n) {
      var text = (notes[n[0]] || '').trim();
      if (!text) return;
      var row = el('div', { class: 'note' });
      row.appendChild(el('div', { class: 'avatar ' + n[0], 'aria-hidden': 'true' }, n[2]));
      var body = el('div');
      body.appendChild(el('div', { class: 'note-who' }, n[1]));
      body.appendChild(el('p', { class: 'note-text' }, text));
      row.appendChild(body);
      els.notesList.appendChild(row);
    });
    els.notes.hidden = !els.notesList.childNodes.length;
  }

  function setPinState(id, on) {
    var m = markers[id];
    if (!m) return;
    m.el.classList.toggle('is-selected', on);
    m.el.style.zIndex = on ? '10' : '';
    m.el.setAttribute('aria-pressed', on ? 'true' : 'false');
    var label = m.el.querySelector('.pin-label');
    if (on && !label) {
      var p = places.find(function (x) { return x.id === id; });
      m.el.appendChild(el('span', { class: 'pin-label', 'aria-hidden': 'true' }, p.name));
    } else if (!on && label) {
      label.remove();
    }
  }

  function select(id) {
    var p = places.find(function (x) { return x.id === id; });
    if (!p) return;
    if (selectedId) setPinState(selectedId, false);
    selectedId = id;
    setPinState(id, true);
    renderDetail(p);
    els.intro.hidden = true;
    els.detail.hidden = false;
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    requestAnimationFrame(function () {
      map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 13.5), padding: viewPadding(), duration: 500 });
    });
  }

  function closeDetail() {
    if (!selectedId) return;
    setPinState(selectedId, false);
    selectedId = null;
    els.detail.hidden = true;
    els.intro.hidden = false;
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }

  function init(data) {
    places = (data && data.places) || [];
    buildFilters();

    map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: START.center,
      zoom: isWide() ? START.zoomWide : START.zoomPhone,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-left');

    map.on('load', function () {
      recolor();
      var attrib = document.querySelector('.maplibregl-ctrl-attrib');
      if (attrib) attrib.classList.remove('maplibregl-compact-show');
      addMarkers();
      var hash = decodeURIComponent(location.hash.slice(1));
      if (hash) select(hash);
    });
    map.on('click', closeDetail);
  }

  els.close.addEventListener('click', closeDetail);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDetail(); });

  fetch('places.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(init)
    .catch(function () { els.filters.textContent = 'Could not load the places. Try refreshing.'; });
})();
