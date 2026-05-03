/**
 * Just Jazz — Settings screen
 */
(function () {
  var getTracks = null;
  var setTracks = null;
  var addPanelOpen = false;

  // ── Volume sliders ──────────────────────────────────────────────────────────

  function initVolume() {
    var musicSlider = document.querySelector('[data-settings="vol-music"]');
    var rainSlider = document.querySelector('[data-settings="vol-rain"]');
    var musicDisplay = document.querySelector('[data-settings-val="vol-music"]');
    var rainDisplay = document.querySelector('[data-settings-val="vol-rain"]');

    if (musicSlider) {
      musicSlider.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (musicDisplay) musicDisplay.textContent = val + '%';
        if (window.JustJazzYouTubeClient) JustJazzYouTubeClient.setVolume(val);
      });
    }

    if (rainSlider) {
      rainSlider.addEventListener('input', function () {
        var val = parseInt(this.value, 10);
        if (rainDisplay) rainDisplay.textContent = val + '%';
        if (window.JustJazzRainPlayer) JustJazzRainPlayer.setVolume(val);
      });
    }
  }

  // ── Music Repo ──────────────────────────────────────────────────────────────

  function extractVideoId(input) {
    var match = input.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : input.trim();
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getPanel() {
    return document.querySelector('[data-repo-add-panel]');
  }

  function openAddPanel() {
    var panel = getPanel();
    if (!panel) return;
    populateCategorySelect();
    resetAddForm();
    panel.hidden = false;
    addPanelOpen = true;
    var btn = document.querySelector('[data-repo-action="add-video"]');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function closeAddPanel() {
    var panel = getPanel();
    if (!panel) return;
    panel.hidden = true;
    addPanelOpen = false;
    var btn = document.querySelector('[data-repo-action="add-video"]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function resetAddForm() {
    var panel = getPanel();
    if (!panel) return;
    var urlInput = panel.querySelector('[data-repo="yt-url"]');
    var nameInput = panel.querySelector('[data-repo="name"]');
    if (urlInput) urlInput.value = '';
    if (nameInput) { nameInput.value = ''; nameInput.removeAttribute('data-video-id'); }
    panel.querySelectorAll('.settings__genre-tag--selected').forEach(function (el) {
      el.classList.remove('settings__genre-tag--selected');
    });
  }

  function populateCategorySelect() {
    var sel = document.querySelector('[data-repo="category"]');
    if (!sel) return;
    var tracks = getTracks();
    var cats = tracks.reduce(function (acc, t) {
      if (t.category && acc.indexOf(t.category) < 0) acc.push(t.category);
      return acc;
    }, []).sort();
    sel.innerHTML = cats.map(function (c) {
      return '<option value="' + escHtml(c) + '">' + escHtml(c) + '</option>';
    }).join('');
  }

  function populateGenreTags() {
    var container = document.querySelector('[data-repo="genres"]');
    if (!container) return;
    var allGenres = [];
    var sections = (window.JUST_JAZZ && window.JUST_JAZZ.MOOD_SECTIONS) || [];
    sections.forEach(function (s) {
      s.genres.forEach(function (g) {
        if (allGenres.indexOf(g) < 0) allGenres.push(g);
      });
    });
    allGenres.sort(function (a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()); });
    container.innerHTML = allGenres.map(function (g) {
      return '<button class="settings__genre-tag" type="button" data-genre="' + escHtml(g) + '">' + escHtml(g) + '</button>';
    }).join('');
  }

  function fetchMeta() {
    var panel = getPanel();
    if (!panel) return;
    var urlInput = panel.querySelector('[data-repo="yt-url"]');
    var nameInput = panel.querySelector('[data-repo="name"]');
    var fetchBtn = panel.querySelector('[data-repo-action="fetch-meta"]');
    if (!urlInput) return;

    var raw = urlInput.value.trim();
    if (!raw) { JustJazzToast.show('Insira uma URL ou ID do YouTube'); return; }
    var videoId = extractVideoId(raw);
    if (!videoId || videoId.length < 5) { JustJazzToast.show('URL ou ID inválido'); return; }

    if (fetchBtn) { fetchBtn.disabled = true; fetchBtn.textContent = '...'; }

    var apiUrl = 'https://noembed.com/embed?url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + videoId);
    fetch(apiUrl)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (nameInput) {
          nameInput.value = data.title || '';
          nameInput.setAttribute('data-video-id', videoId);
        }
        if (!data.title) JustJazzToast.show('ID obtido, título não encontrado');
      })
      .catch(function () {
        // still set the videoId even if noembed fails
        if (nameInput) nameInput.setAttribute('data-video-id', videoId);
        JustJazzToast.show('Não foi possível buscar informações do vídeo');
      })
      .finally(function () {
        if (fetchBtn) { fetchBtn.disabled = false; fetchBtn.textContent = 'Fetch'; }
      });
  }

  function confirmAdd() {
    var panel = getPanel();
    if (!panel) return;
    var nameInput = panel.querySelector('[data-repo="name"]');
    var categorySelect = panel.querySelector('[data-repo="category"]');

    var videoId = nameInput ? nameInput.getAttribute('data-video-id') : null;
    var name = nameInput ? nameInput.value.trim() : '';
    var category = categorySelect ? categorySelect.value : '';
    var genres = Array.from(panel.querySelectorAll('.settings__genre-tag--selected')).map(function (el) {
      return el.getAttribute('data-genre');
    });

    if (!videoId) { JustJazzToast.show('Busque um vídeo primeiro'); return; }
    if (!name) { JustJazzToast.show('Nome é obrigatório'); return; }
    if (!category) { JustJazzToast.show('Selecione uma categoria'); return; }

    var newTrack = { id: generateId(), name: name, youtubeId: videoId, genres: genres, category: category };
    setTracks(getTracks().concat([newTrack]));
    JustJazzToast.show('Vídeo adicionado ao repo');
    closeAddPanel();
  }

  function copyRepo() {
    var json = JSON.stringify(getTracks(), null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json)
        .then(function () { JustJazzToast.show('Repo copiado para o clipboard'); })
        .catch(function () { JustJazzToast.show('Erro ao copiar'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = json;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      JustJazzToast.show('Repo copiado para o clipboard');
    }
  }

  function downloadRepo() {
    var json = JSON.stringify(getTracks(), null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'seed.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleUpload(e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var data = JSON.parse(evt.target.result);
        if (!Array.isArray(data)) throw new Error('not array');
        setTracks(data);
        JustJazzToast.show('Repo carregado: ' + data.length + ' faixas');
      } catch (err) {
        JustJazzToast.show('Arquivo inválido');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  function handleRepoClick(e) {
    var genreTag = e.target.closest('[data-genre]');
    if (genreTag) {
      genreTag.classList.toggle('settings__genre-tag--selected');
      return;
    }
    var btn = e.target.closest('[data-repo-action]');
    if (!btn) return;
    switch (btn.getAttribute('data-repo-action')) {
      case 'copy-repo':     copyRepo(); break;
      case 'add-video':     addPanelOpen ? closeAddPanel() : openAddPanel(); break;
      case 'fetch-meta':    fetchMeta(); break;
      case 'cancel-add':    closeAddPanel(); break;
      case 'confirm-add':   confirmAdd(); break;
      case 'download-repo': downloadRepo(); break;
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function initMusicRepo() {
    populateGenreTags();
    var body = document.querySelector('.settings__body');
    if (body) body.addEventListener('click', handleRepoClick);
    var uploadInput = document.querySelector('[data-repo-action="upload-repo"]');
    if (uploadInput) uploadInput.addEventListener('change', handleUpload);
  }

  // ── Public ──────────────────────────────────────────────────────────────────

  function init(options) {
    getTracks = (options && options.getTracks) || function () { return []; };
    setTracks = (options && options.setTracks) || function () {};
    initVolume();
    initMusicRepo();
  }

  window.JustJazzSettings = { init: init };
})();
