(function () {
  'use strict';

  // Each city page sets window.RECS_CONFIG before loading this file.
  var CFG = window.RECS_CONFIG || {};
  var MEALS = {};
  (CFG.categories || []).forEach(function (c) { MEALS[c.key] = { label: c.label, color: c.color, dark: !!c.dark }; });
  var MAP_COLORS = {
    land: '#FBF5EA', water: '#A8CBD4', park: '#CFDDB9', building: '#F1E4CF',
    roadMajor: '#EED9BC', road: '#FFFFFF', label: '#4A4037', boundary: '#C9B79C'
  };
  var PIN_PATH = 'M12 1.8C7.7 1.8 4.3 5.1 4.3 9.3c0 5.5 6.4 11.3 7 11.9a1 1 0 0 0 1.4 0c.6-.6 7-6.4 7-11.9 0-4.2-3.4-7.5-7.7-7.5z';
  var DOT_PATH = 'M12 6.6a2.7 2.7 0 1 0 0 5.4a2.7 2.7 0 1 0 0-5.4z';
  var START = CFG.start;

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
    panel: document.getElementById('panel'),
    walk: document.getElementById('walk'),
    walkBody: document.getElementById('walk-body')
  };

  var places = [];
  var markers = {};
  var selectedId = null;
  var activeFilters = [];
  var walksData = null;      // { walks: [], readWatch: [] } when the city has walks
  var walkMode = null;       // null | 'list' | 'walk' | 'read'
  var currentWalk = null;
  var stopMarkers = [];
  var map;

  function isWide() { return window.matchMedia('(min-width: 900px)').matches; }

  function mealKeys(p) {
    var k = (p.recommendedFor || []).filter(function (m) { return MEALS[m]; });
    return k.length ? k : [Object.keys(MEALS)[0]];
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
      var b = el('button', { type: 'button', class: 'filter' + (MEALS[k].dark ? ' is-dark' : ''), 'aria-pressed': 'false', 'data-meal': k });
      var s = pinSvg([MEALS[k].color], 'lg-' + k);
      s.setAttribute('width', '18'); s.setAttribute('height', '18');
      b.appendChild(s);
      b.appendChild(document.createTextNode(MEALS[k].label));
      b.style.setProperty('--meal', MEALS[k].color);
      b.addEventListener('click', function () { toggleFilter(k, b); });
      els.filters.appendChild(b);
    });
    if (walksData) {
      var w = el('button', { type: 'button', class: 'filter filter-walks', 'aria-pressed': 'false' });
      var icon = svgEl('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
      icon.appendChild(svgEl('circle', { cx: '6', cy: '19', r: '2' }));
      icon.appendChild(svgEl('circle', { cx: '18', cy: '5', r: '2' }));
      icon.appendChild(svgEl('path', { d: 'M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7' }));
      w.appendChild(icon);
      w.appendChild(document.createTextNode('Walks & more'));
      w.addEventListener('click', function () { openWalkList(); });
      els.filters.appendChild(w);
    }
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
    if (map) declutter();
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
      btn.setAttribute('aria-label', p.name); // MapLibre replaces it with a generic "Map marker"
      btn.setAttribute('data-id', p.id);
      markers[p.id] = { marker: m, el: btn };
    });
  }

  // Pins that land on (almost) the same spot get fanned out side by side, so every one stays visible
  // and tappable at any zoom. Re-run whenever the zoom or the filters change.
  // Only at street level (zoom 14+) and only for small stacks, laid out in a tight ring around the
  // real spot. Zoomed out, pins stay exactly where they are, even if they overlap.
  var SPREAD_PX = 26, NEAR_PX = 22, DECLUTTER_MIN_ZOOM = 14, MAX_STACK = 6;
  function declutter() {
    var zoomedIn = map.getZoom() >= DECLUTTER_MIN_ZOOM;
    var shown = places.filter(function (p) { return markers[p.id] && matches(p); });
    var pts = shown.map(function (p) { var s = map.project([p.lng, p.lat]); return { p: p, x: s.x, y: s.y, group: -1 }; });
    var groups = [];
    pts.forEach(function (a, i) {
      if (a.group >= 0) return;
      a.group = groups.length;
      var g = [a], stack = [a];
      while (stack.length) {
        var cur = stack.pop();
        pts.forEach(function (b) {
          if (b.group < 0 && Math.abs(b.x - cur.x) < NEAR_PX && Math.abs(b.y - cur.y) < NEAR_PX) { b.group = a.group; g.push(b); stack.push(b); }
        });
      }
      groups.push(g);
    });
    places.forEach(function (p) { if (markers[p.id]) markers[p.id].marker.setOffset([0, 0]); });
    if (!zoomedIn) return;
    groups.forEach(function (g) {
      if (g.length < 2 || g.length > MAX_STACK) return;
      var cx = g.reduce(function (s, q) { return s + q.x; }, 0) / g.length;
      var cy = g.reduce(function (s, q) { return s + q.y; }, 0) / g.length;
      g.sort(function (u, v) { return u.x - v.x || u.y - v.y; });
      if (g.length === 2) {
        g.forEach(function (q, i) { markers[q.p.id].marker.setOffset([cx + (i - 0.5) * SPREAD_PX - q.x, cy - q.y]); });
        return;
      }
      var r = SPREAD_PX / (2 * Math.sin(Math.PI / g.length));
      g.forEach(function (q, i) {
        var ang = -Math.PI / 2 + (2 * Math.PI * i) / g.length;
        markers[q.p.id].marker.setOffset([cx + r * Math.cos(ang) - q.x, cy + r * Math.sin(ang) - q.y]);
      });
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
    showPanel('detail');
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    requestAnimationFrame(function () {
      map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 13.5), padding: viewPadding(), duration: 500 });
    });
  }

  function closeDetail() {
    if (!selectedId) return;
    setPinState(selectedId, false);
    selectedId = null;
    showPanel(walkMode ? 'walk' : 'intro');
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }


  // ---------- Walks + read & watch ----------
  var ROUTE_COLOR = '#E76F51';

  function ensureRouteLayer() {
    if (map.getSource('walk')) return;
    map.addSource('walk', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({ id: 'walk-casing', type: 'line', source: 'walk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#141414', 'line-width': 7 } });
    map.addLayer({ id: 'walk-line', type: 'line', source: 'walk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ROUTE_COLOR, 'line-width': 4, 'line-dasharray': [1.6, 1.2] } });
  }

  function clearRoute() {
    if (map && map.getSource('walk')) map.getSource('walk').setData({ type: 'FeatureCollection', features: [] });
    stopMarkers.forEach(function (m) { m.remove(); });
    stopMarkers = [];
    document.body.classList.remove('walk-on-map');
  }

  function showPanel(which) {
    els.intro.hidden = which !== 'intro';
    els.detail.hidden = which !== 'detail';
    els.walk.hidden = which !== 'walk';
  }

  function walkHeader(title, onBack, backLabel) {
    var head = el('div', { class: 'detail-head' });
    var left = el('div', { class: 'detail-title' });
    if (onBack) {
      var back = el('button', { type: 'button', class: 'walk-back' }, '‹ ' + backLabel);
      back.addEventListener('click', onBack);
      left.appendChild(back);
    }
    left.appendChild(el('h2', null, title));
    head.appendChild(left);
    var close = el('button', { type: 'button', class: 'close', 'aria-label': 'Close walks' });
    close.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    close.addEventListener('click', exitWalks);
    head.appendChild(close);
    return head;
  }

  function openWalkList() {
    if (selectedId) { setPinState(selectedId, false); selectedId = null; }
    clearRoute();
    walkMode = 'list'; currentWalk = null;
    var b = els.walkBody; b.textContent = '';
    b.appendChild(walkHeader('Walks & day trips'));
    var list = el('div', { class: 'walk-list' });
    walksData.walks.forEach(function (w) {
      var card = el('button', { type: 'button', class: 'walk-card' });
      var top = el('div', { class: 'walk-card-top' });
      top.appendChild(el('span', { class: 'walk-card-title' }, w.title));
      top.appendChild(el('span', { class: 'walk-meta' }, w.meta));
      card.appendChild(top);
      card.appendChild(el('span', { class: 'walk-card-summary' }, w.summary));
      card.addEventListener('click', function () { openWalk(w.id); });
      list.appendChild(card);
    });
    b.appendChild(list);
    if (walksData.readWatch && walksData.readWatch.length) {
      var rw = el('button', { type: 'button', class: 'walk-card walk-card-read' });
      var top2 = el('div', { class: 'walk-card-top' });
      top2.appendChild(el('span', { class: 'walk-card-title' }, 'Read & watch'));
      top2.appendChild(el('span', { class: 'walk-meta' }, walksData.readWatch.length + ' picks'));
      rw.appendChild(top2);
      rw.appendChild(el('span', { class: 'walk-card-summary' }, 'Books, films and shows for getting to know the city.'));
      rw.addEventListener('click', openReadWatch);
      b.appendChild(rw);
    }
    showPanel('walk');
    b.scrollTop = 0;
  }

  function openWalk(id) {
    var idx = walksData.walks.findIndex(function (w) { return w.id === id; });
    var w = walksData.walks[idx];
    if (!w) return;
    if (selectedId) { setPinState(selectedId, false); selectedId = null; }
    walkMode = 'walk'; currentWalk = w;
    if (history.replaceState) history.replaceState(null, '', '#walk-' + w.id);
    var b = els.walkBody; b.textContent = '';
    b.appendChild(walkHeader(w.title, openWalkList, 'All walks'));
    b.appendChild(el('p', { class: 'walk-meta-line' }, w.meta));
    b.appendChild(el('p', { class: 'walk-summary' }, w.summary));
    if (w.stops.length) {
      var ol = el('ol', { class: 'walk-stops' });
      w.stops.forEach(function (s, i) {
        var li = el('li');
        var num = el('span', { class: 'stop-num', 'aria-hidden': 'true' }, String(i + 1));
        li.appendChild(num);
        var body = el('div');
        if (s.placeId && places.some(function (p) { return p.id === s.placeId; })) {
          var link = el('button', { type: 'button', class: 'stop-name stop-link' }, s.name);
          link.addEventListener('click', function () { select(s.placeId); });
          body.appendChild(link);
        } else {
          body.appendChild(el('div', { class: 'stop-name' }, s.name));
        }
        if (s.note) body.appendChild(el('p', { class: 'stop-note' }, s.note));
        li.appendChild(body);
        ol.appendChild(li);
      });
      b.appendChild(ol);
      b.appendChild(el('p', { class: 'walk-fineprint' }, 'The dashed line connects the stops; it isn’t a turn-by-turn route.'));
    }
    if (w.link) {
      var a = el('a', { href: w.link, target: '_blank', rel: 'noopener', class: 'walk-ext' }, 'Trail map and guide ↗');
      b.appendChild(a);
    }
    var nav = el('div', { class: 'walk-nav' });
    var prev = walksData.walks[(idx - 1 + walksData.walks.length) % walksData.walks.length];
    var next = walksData.walks[(idx + 1) % walksData.walks.length];
    var pb = el('button', { type: 'button' }, '‹ ' + prev.title); pb.addEventListener('click', function () { openWalk(prev.id); });
    var nb = el('button', { type: 'button' }, next.title + ' ›'); nb.addEventListener('click', function () { openWalk(next.id); });
    nav.appendChild(pb); nav.appendChild(nb);
    b.appendChild(nav);
    showPanel('walk');
    b.scrollTop = 0;
    drawWalk(w);
  }

  function drawWalk(w) {
    clearRoute();
    if (!w.stops.length) return;
    ensureRouteLayer();
    var coords = w.stops.map(function (s) { return [s.lng, s.lat]; });
    map.getSource('walk').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} });
    document.body.classList.add('walk-on-map');
    w.stops.forEach(function (s, i) {
      var dot = el('div', { class: 'stop-marker', 'aria-hidden': 'true' }, String(i + 1));
      stopMarkers.push(new maplibregl.Marker({ element: dot }).setLngLat([s.lng, s.lat]).addTo(map));
    });
    requestAnimationFrame(function () {
      var bounds = coords.reduce(function (bb, c) { return bb.extend(c); }, new maplibregl.LngLatBounds(coords[0], coords[0]));
      map.fitBounds(bounds, { padding: viewPadding(), maxZoom: 15, duration: 600 });
    });
  }

  function openReadWatch() {
    clearRoute();
    walkMode = 'read';
    var b = els.walkBody; b.textContent = '';
    b.appendChild(walkHeader('Read & watch', openWalkList, 'All walks'));
    var list = el('div', { class: 'read-list' });
    walksData.readWatch.forEach(function (r) {
      var row = el('div', { class: 'read-row' });
      row.appendChild(el('span', { class: 'read-kind' }, r.kind));
      var body = el('div');
      body.appendChild(el('div', { class: 'stop-name' }, r.title));
      if (r.note) body.appendChild(el('p', { class: 'stop-note' }, r.note));
      row.appendChild(body);
      list.appendChild(row);
    });
    b.appendChild(list);
    showPanel('walk');
    b.scrollTop = 0;
  }

  function exitWalks() {
    clearRoute();
    walkMode = null; currentWalk = null;
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    if (selectedId) { setPinState(selectedId, false); selectedId = null; }
    showPanel('intro');
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
      pitchWithRotate: false,
      minZoom: CFG.minZoom || 10,
      maxBounds: CFG.maxBounds
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-left');

    map.on('load', function () {
      recolor();
      var attrib = document.querySelector('.maplibregl-ctrl-attrib');
      if (attrib) attrib.classList.remove('maplibregl-compact-show');
      addMarkers();
      declutter();
      map.on('zoomend', declutter);
      if (walksData) ensureRouteLayer();
      var hash = decodeURIComponent(location.hash.slice(1));
      if (hash.indexOf('walk-') === 0 && walksData) openWalk(hash.slice(5));
      else if (hash) select(hash);
    });
    map.on('click', closeDetail);
  }

  els.close.addEventListener('click', closeDetail);
  document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; if (selectedId) closeDetail(); else if (walkMode) exitWalks(); });

  var walksReq = CFG.walks
    ? fetch(CFG.walks, { cache: 'no-cache' }).then(function (r) { return r.json(); }).catch(function () { return null; })
    : Promise.resolve(null);
  Promise.all([fetch(CFG.data || 'places.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }), walksReq])
    .then(function (res) { walksData = res[1]; init(res[0]); })
    .catch(function () { els.filters.textContent = 'Could not load the places. Try refreshing.'; });
})();
