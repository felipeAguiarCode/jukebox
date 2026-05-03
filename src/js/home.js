/**
 * Just Jazz — Home screen
 */
(function () {
  var MOOD_COLORS = JUST_JAZZ.MOOD_COLORS;
  var formatMoodName = JUST_JAZZ.formatMoodName;

  function getUniqueCategories(tracks) {
    var seen = {};
    tracks.forEach(function (t) {
      if (t.category) seen[t.category] = true;
    });
    return Object.keys(seen);
  }

  function getUniqueGenres(tracks) {
    var seen = {};
    tracks.forEach(function (t) {
      if (t.genres && Array.isArray(t.genres)) {
        t.genres.forEach(function (g) { seen[g] = true; });
      }
    });
    return Object.keys(seen);
  }

  function getTrackCountByCategory(tracks, category) {
    return tracks.filter(function (t) { return t.category === category; }).length;
  }

  function getTrackCountByGenre(tracks, genre) {
    return tracks.filter(function (t) {
      return t.genres && t.genres.indexOf(genre) >= 0;
    }).length;
  }

  function getColor(index) {
    return MOOD_COLORS[index % MOOD_COLORS.length];
  }

  function renderMoodCard(moodId, name, color, count) {
    var card = document.createElement('article');
    card.className = 'moods__card';
    card.setAttribute('data-mood-id', moodId);
    card.setAttribute('data-action', 'open-playlist');
    card.setAttribute('data-mood-type', 'category');
    card.style.backgroundColor = color;
    card.setAttribute('role', 'listitem');
    card.innerHTML =
      '<h3 class="moods__card-title">' + escapeHtml(name) + '</h3>' +
      '<p class="moods__card-count">' + count + ' tracks</p>';
    return card;
  }

  function renderMoodPill(moodId, name, color, count, type) {
    var pill = document.createElement('button');
    pill.className = 'moods__pill';
    pill.type = 'button';
    pill.setAttribute('data-mood-id', moodId);
    pill.setAttribute('data-action', 'open-playlist');
    pill.setAttribute('data-mood-type', type);
    pill.style.borderColor = color;
    pill.style.color = color;
    pill.setAttribute('role', 'listitem');
    pill.textContent = name;
    return pill;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render(tracks) {
    var cardsContainer = document.querySelector('.moods__carousel--cards');
    var sectionsContainer = document.getElementById('mood-sections');
    if (!cardsContainer || !sectionsContainer) return;

    cardsContainer.innerHTML = '';
    sectionsContainer.innerHTML = '';

    var categories = getUniqueCategories(tracks);
    categories.forEach(function (cat, i) {
      var count = getTrackCountByCategory(tracks, cat);
      var name = formatMoodName(cat);
      var color = getColor(i);
      cardsContainer.appendChild(renderMoodCard(cat, name, color, count));
    });

    var sections = JUST_JAZZ.MOOD_SECTIONS || [];
    sections.forEach(function (section, sectionIndex) {
      var sectionEl = document.createElement('section');
      sectionEl.className = 'moods moods--circles';
      var headingId = 'mood-heading-' + sectionIndex;
      sectionEl.setAttribute('aria-labelledby', headingId);
      var heading = document.createElement('h2');
      heading.className = 'moods__heading moods__heading--sub';
      heading.id = headingId;
      heading.textContent = section.name;
      var carousel = document.createElement('div');
      carousel.className = 'moods__carousel moods__carousel--circles';
      carousel.setAttribute('role', 'list');
      section.genres.forEach(function (genre, i) {
        var count = getTrackCountByGenre(tracks, genre);
        var name = formatMoodName(genre);
        var color = getColor(sectionIndex * 10 + i);
        carousel.appendChild(renderMoodPill(genre, name, color, count, 'genre'));
      });
      sectionEl.appendChild(heading);
      sectionEl.appendChild(carousel);
      sectionsContainer.appendChild(sectionEl);
    });
    resetCarouselScrolls();
  }

  function resetCarouselScrolls() {
    var cards = document.querySelector('.moods__carousel--cards');
    var circles = document.querySelectorAll('.moods__carousel--circles');
    if (cards) cards.scrollLeft = 0;
    circles.forEach(function (c) { c.scrollLeft = 0; });
    document.querySelectorAll('.moods--circles').forEach(function (s) {
      s.classList.remove('moods--circles--visible');
    });
  }

  function initCarouselDrag(container) {
    if (!container) return;
    var isDown = false;
    var startX;
    var scrollLeft;
    var hasMoved = false;

    function getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX;
    }

    function handleMove(e) {
      if (!isDown) return;
      e.preventDefault();
      var x = getClientX(e);
      var walk = x - startX;
      if (Math.abs(walk) > 5) hasMoved = true;
      container.scrollLeft = scrollLeft - walk;
    }

    function handleUp() {
      isDown = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove, { passive: false });
      document.removeEventListener('touchend', handleUp);
    }

    function handleDown(clientX) {
      isDown = true;
      hasMoved = false;
      startX = clientX;
      scrollLeft = container.scrollLeft;
      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleUp);
    }

    container.addEventListener('mousedown', function (e) {
      if (e.target.closest('[data-mood-id]')) {
        handleDown(e.pageX);
      }
    });

    container.addEventListener('touchstart', function (e) {
      if (e.target.closest('[data-mood-id]')) {
        handleDown(e.touches[0].clientX);
      }
    }, { passive: true });

    container.addEventListener('click', function (e) {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  function initSectionAnimations() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('moods--circles--visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.moods--circles').forEach(function (section) {
      observer.observe(section);
    });
  }

  function init(tracks) {
    render(tracks);
    initCarouselDrag(document.querySelector('.moods__carousel--cards'));
    document.querySelectorAll('.moods__carousel--circles').forEach(initCarouselDrag);
    initSectionAnimations();
  }

  window.JustJazzHome = { init, render, resetCarouselScrolls };
})();
