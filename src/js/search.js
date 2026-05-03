/**
 * Search screen
 */
(function () {
  var inputEl = null;
  var listEl = null;
  var countEl = null;
  var tracks = [];
  var onTrackSelect = null;
  var onAddToQueue = null;
  var sortOrder = 'az';
  var debouncedUpdateResults = null;

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function filterByQuery(query) {
    var q = (query || '').trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter(function (t) {
      return (t.name || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  function sortTracks(trackList) {
    if (!trackList || trackList.length === 0) return trackList;
    var arr = trackList.slice();
    arr.sort(function (a, b) {
      var na = (a.name || '').toLowerCase();
      var nb = (b.name || '').toLowerCase();
      var cmp = na.localeCompare(nb);
      return sortOrder === 'za' ? -cmp : cmp;
    });
    return arr;
  }

  function updateResults() {
    var query = inputEl ? inputEl.value : '';
    var filtered = filterByQuery(query);
    var sorted = sortTracks(filtered);
    if (listEl && window.JustJazzPlaylist) {
      JustJazzPlaylist.renderTracks(listEl, sorted, onTrackSelect, onAddToQueue);
    }
    if (countEl) {
      var n = filtered.length;
      countEl.textContent = n === 1 ? '1 result' : n + ' results';
    }
    var sortLabelEl = document.querySelector('[data-search-sort-label]');
    if (sortLabelEl) sortLabelEl.textContent = sortOrder === 'za' ? 'Z-A' : 'A-Z';
  }

  function cycleSort() {
    sortOrder = sortOrder === 'az' ? 'za' : 'az';
    updateResults();
  }

  function init(allTracks, onSelect, addToQueue) {
    tracks = allTracks || [];
    onAddToQueue = addToQueue || null;
    onTrackSelect = function (track) {
      var filtered = filterByQuery(inputEl ? inputEl.value : '');
      var sorted = sortTracks(filtered);
      onSelect(track, sorted.length > 0 ? sorted : null);
    };
    inputEl = document.querySelector('[data-search-input]');
    listEl = document.querySelector('[data-search-list]');
    countEl = document.querySelector('[data-search-count]');
    if (!inputEl || !listEl) return;

    inputEl.value = '';
    updateResults();

    if (debouncedUpdateResults) inputEl.removeEventListener('input', debouncedUpdateResults);
    debouncedUpdateResults = debounce(updateResults, 300);
    inputEl.addEventListener('input', debouncedUpdateResults);
    inputEl.removeEventListener('keydown', focusHandler);
    inputEl.addEventListener('keydown', focusHandler);
  }

  function focusHandler(e) {
    if (e.key === 'Escape') {
      inputEl.blur();
    }
  }

  function focusInput() {
    if (inputEl) {
      inputEl.focus();
    }
  }

  window.JustJazzSearch = {
    init: init,
    focusInput: focusInput,
    updateResults: updateResults,
    cycleSort: cycleSort
  };
})();
