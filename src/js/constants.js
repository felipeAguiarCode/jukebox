/**
 * Just Jazz — Constants
 */
(function (window) {
  window.JUST_JAZZ = window.JUST_JAZZ || {};
  window.JUST_JAZZ.ROUTES = {
    HOME: 'home',
    PLAYLIST: 'playlist',
    PLAYING: 'playing',
    SEARCH: 'search',
    QUEUE: 'queue'
  };
  window.JUST_JAZZ.MOOD_COLORS = [
    '#2d4a6e', '#8b5a3c', '#6b4c7a', '#3d5a4c', '#5a4a6e', '#4a6e5a', '#6e4a5a'
  ];

  window.JUST_JAZZ.SORT_ORDERS = [
    { id: 'az', label: 'A-Z' },
    { id: 'za', label: 'Z-A' }
  ];

  window.JUST_JAZZ.MOOD_SECTIONS = [
    { name: 'Mood by decades', genres: ['1940s', '50s', '60s'] },
    { name: 'Mood by settings & scenes', genres: ['bar','coffee shop', 'cassino', 'raining & noir', 'ambience'] },
    { name: 'Mood by Vocals', genres: ['female vocalists', 'male vocalists'] },
    { name: 'Mood by professions / personas (archetypes)', genres: ['etta james', 'Mama Thornton','John Lee Hooker', 'robert johnson','detective', 'spy', 'gatsby'] },
    { name: 'Mood by styles / musical subgenres', genres: ['soul', 'hard bop', 'jazz lounge', 'intimate jazz', "Mellow Blues"] },
    { name: 'Mood by mood / feel', genres: ['calm', 'cozy','sad','slow', 'swing Jazz Party'] },
    { name: 'Mood by aesthetic / time of day', genres: ['piano',  'vintage', 'late night'] },
    { name: 'Mood by Blues Types', genres: ['dark blues',  'delta blues', 'mellow Blues','Deep Southern Blues','dirty blues'] },
    { name: 'Mood by region', genres: ['new orleans', 'new york','chicago','paris','mississippi'] },
  ]

  window.JUST_JAZZ.YOUTUBE_THUMB_BASE = 'https://img.youtube.com/vi/';
  window.JUST_JAZZ.YOUTUBE_THUMB_SIZE = 'mqdefault';

  function formatMoodName(id) {
    if (!id) return '';
    return String(id).split(' ').map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }
  window.JUST_JAZZ.formatMoodName = formatMoodName;
})(window);
