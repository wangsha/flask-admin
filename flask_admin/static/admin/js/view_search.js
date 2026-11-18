(function () {
  // Find a registered admin view by name. Entries come from the menu links
  // already in the navbar, labelled with their category path.
  var root = document.querySelector('[data-view-search]');
  if (!root) return;
  var input = root.querySelector('input');
  var list = root.querySelector('.view-search-results');
  var nav = document.getElementById('admin-navbar-collapse');

  function categoryPath(link) {
    var names = [];
    for (var el = link.parentElement; el && el !== nav; el = el.parentElement) {
      if (el.classList.contains('dropdown')) {
        var toggle = el.querySelector(':scope > .dropdown-toggle');
        if (toggle) names.unshift(toggle.textContent.trim());
      }
    }
    return names;
  }

  var seen = {};
  var entries = Array.prototype.slice.call(nav.querySelectorAll('.navbar-nav a[href]'))
    .filter(function (a) {
      var href = a.getAttribute('href');
      return !a.classList.contains('dropdown-toggle') && href && href.indexOf('javascript:') !== 0;
    })
    .map(function (a) {
      var name = a.textContent.trim();
      var path = categoryPath(a);
      return { name: name, path: path.join(' › '), href: a.href, target: a.target, text: (path.concat(name)).join(' ').toLowerCase() };
    })
    .filter(function (e) {
      if (!e.name || seen[e.href]) return false;
      seen[e.href] = true;
      return true;
    });

  var matches = [];
  var current = -1;

  function score(entry, terms) {
    // Every term must appear; names starting with the first term rank first.
    for (var i = 0; i < terms.length; i++) if (entry.text.indexOf(terms[i]) === -1) return -1;
    var name = entry.name.toLowerCase();
    if (name.indexOf(terms[0]) === 0) return 0;
    if (name.indexOf(terms[0]) !== -1) return 1;
    return 2;
  }

  function render() {
    list.innerHTML = '';
    matches.forEach(function (e, i) {
      var a = document.createElement('a');
      a.className = 'view-search-item' + (i === current ? ' is-current' : '');
      a.href = e.href;
      if (e.target) a.target = e.target;
      a.setAttribute('role', 'option');
      a.setAttribute('aria-selected', i === current ? 'true' : 'false');
      var name = document.createElement('span');
      name.className = 'view-search-name';
      name.textContent = e.name;
      a.appendChild(name);
      if (e.path) {
        var path = document.createElement('span');
        path.className = 'view-search-path';
        path.textContent = e.path;
        a.appendChild(path);
      }
      list.appendChild(a);
    });
    if (!matches.length && input.value.trim()) {
      var empty = document.createElement('div');
      empty.className = 'view-search-empty';
      empty.textContent = list.dataset.empty;
      list.appendChild(empty);
    }
    list.hidden = !input.value.trim();
    input.setAttribute('aria-expanded', list.hidden ? 'false' : 'true');
  }

  function update() {
    var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    matches = !terms.length ? [] : entries
      .map(function (e) { return { e: e, s: score(e, terms) }; })
      .filter(function (m) { return m.s >= 0; })
      .sort(function (a, b) { return a.s - b.s || a.e.name.localeCompare(b.e.name); })
      .slice(0, 12)
      .map(function (m) { return m.e; });
    current = matches.length ? 0 : -1;
    render();
  }

  function close() {
    input.value = '';
    matches = [];
    current = -1;
    render();
  }

  input.addEventListener('input', update);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!matches.length) return;
      e.preventDefault();
      current = (current + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
      render();
      var item = list.children[current];
      if (item) item.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (current < 0) return;
      e.preventDefault();
      var m = matches[current];
      if (m.target) window.open(m.href, m.target); else window.location.href = m.href;
    } else if (e.key === 'Escape') {
      close();
      input.blur();
    }
  });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === '/' && !typing) || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
})();
