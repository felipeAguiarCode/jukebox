/**
 * Just Jazz — Playlist screen
 */
(function () {
  var formatMoodName = JUST_JAZZ.formatMoodName;

  function filterTracksByMood(tracks, moodId, moodType) {
    return tracks.filter(function (t) {
      if (moodType === 'genre') {
        return t.genres && t.genres.indexOf(moodId) >= 0;
      }
      return t.category === moodId;
    });
  }

  function sortTracks(tracks, sortOrder) {
    if (!tracks || tracks.length === 0) return tracks;
    var arr = tracks.slice();
    arr.sort(function (a, b) {
      var na = (a.name || '').toLowerCase();
      var nb = (b.name || '').toLowerCase();
      var cmp = na.localeCompare(nb);
      return sortOrder === 'za' ? -cmp : cmp;
    });
    return arr;
  }

  function renderTrackItem(track, onSelect, onAddToQueue) {
    const li = document.createElement('li');
    li.className = 'track-list__item';
    li.setAttribute('data-track-id', track.id);
    li.setAttribute('data-action', 'play-track');
    const thumbUrl = JustJazzYouTubeClient.getThumbUrl(track.youtubeId);
    const author = track.genres && track.genres[0] ? track.genres[0] : track.category;
    var addBtn = onAddToQueue
      ? '<button class="track-list__add" type="button" aria-label="Adicionar à fila">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M12 5v14M5 12h14"/>' +
        '</svg></button>'
      : '';
    li.innerHTML =
      '<div class="track-list__artwork">' +
      '<img src="' + escapeHtml(thumbUrl) + '" alt="" loading="lazy">' +
      '</div>' +
      '<div class="track-list__info">' +
      '<h4 class="track-list__name">' + escapeHtml(track.name) + '</h4>' +
      '<p class="track-list__author">' + escapeHtml(author) + '</p>' +
      '</div>' +
      '<div class="track-list__actions">' +
      addBtn +
      '<button class="track-list__play" type="button" aria-label="Reproduzir">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M8 5v14l11-7z"/>' +
      '</svg>' +
      '</button></div>';
    li.addEventListener('click', function (e) {
      if (!e.target.closest('.track-list__play') && !e.target.closest('.track-list__add')) {
        onSelect(track);
      }
    });
    li.querySelector('.track-list__play').addEventListener('click', function (e) {
      e.stopPropagation();
      onSelect(track);
    });
    if (onAddToQueue) {
      var addEl = li.querySelector('.track-list__add');
      if (addEl) addEl.addEventListener('click', function (e) { e.stopPropagation(); onAddToQueue(track); });
    }
    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render(moodId, tracks, onTrackSelect, moodType, onAddToQueue, sortOrder) {
    var titleEl = document.querySelector('[data-mood-name]');
    var listEl = document.querySelector('.screen--playlist .track-list');
    var sortLabelEl = document.querySelector('[data-playlist-sort-label]');
    if (!titleEl || !listEl) return;

    var filtered = filterTracksByMood(tracks, moodId, moodType);
    var sorted = sortTracks(filtered, sortOrder || 'az');
    titleEl.textContent = formatMoodName(moodId);
    if (sortLabelEl) sortLabelEl.textContent = (sortOrder === 'za' ? 'Z-A' : 'A-Z');
    renderTracks(listEl, sorted, onTrackSelect, onAddToQueue);
  }

  var PAGE_SIZE = 15;
  var currentObserver = null;

  function renderTracks(listEl, tracks, onTrackSelect, onAddToQueue) {
    if (!listEl) return;
    if (currentObserver) {
      currentObserver.disconnect();
      currentObserver = null;
    }
    listEl.innerHTML = '';
    if (tracks.length === 0) return;

    var offset = 0;
    var root = document.querySelector('.main');

    currentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          currentObserver.unobserve(entry.target);
          loadBatch();
        }
      });
    }, { root: root, threshold: 0 });

    function loadBatch() {
      var sentinel = listEl.querySelector('.track-list__sentinel');
      if (sentinel) sentinel.remove();

      var batch = tracks.slice(offset, offset + PAGE_SIZE);
      batch.forEach(function (track) {
        listEl.appendChild(renderTrackItem(track, onTrackSelect, onAddToQueue));
      });
      offset += batch.length;

      if (offset < tracks.length) {
        var newSentinel = document.createElement('li');
        newSentinel.className = 'track-list__sentinel';
        newSentinel.setAttribute('aria-hidden', 'true');
        listEl.appendChild(newSentinel);
        currentObserver.observe(newSentinel);
      } else {
        currentObserver.disconnect();
        currentObserver = null;
      }
    }

    loadBatch();
  }

  window.JustJazzPlaylist = { render, renderTracks };
})();
