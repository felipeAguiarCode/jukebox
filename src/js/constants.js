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
    QUEUE: 'queue',
    SETTINGS: 'settings'
  };
  window.JUST_JAZZ.MOOD_COLORS = [
    '#2d4a6e', '#8b5a3c', '#6b4c7a', '#3d5a4c', '#5a4a6e', '#4a6e5a', '#6e4a5a'
  ];

  window.JUST_JAZZ.SORT_ORDERS = [
    { id: 'az', label: 'A-Z' },
    { id: 'za', label: 'Z-A' }
  ];

  window.JUST_JAZZ.MOOD_SECTIONS = [
    { name: 'Mood by decades', genres: ['40s', '50s', '60s'] },
    { name: 'Mood by settings & scenes', genres: ['bar','coffee shop', 'cassino', 'raining & noir', 'ambience'] },
    { name: 'Mood by Vocals', genres: ['female vocalists', 'male vocalists'] },
    { name: 'Mood by personas', genres: ['etta james', 'Mama Thornton','John Lee Hooker', 'robert johnson'] },
    { name: 'Mood by archetypes', genres: ['spy', 'gatsby', 'detective','gamer'] },
    { name: 'Mood by styles / musical subgenres', genres: ['soul', 'hard bop', 'jazz lounge', 'intimate jazz', 'Mellow Blues','bossa nova' ] },
    { name: 'Mood by mood / feel', genres: ['calm', 'cozy','sad','slow', 'swing Jazz Party'] },
    { name: 'Mood by aesthetic / time of day', genres: ['piano',  'vintage', 'late night','noir'] },
    { name: 'Mood by Blues Types', genres: ['dark blues',  'delta blues', 'mellow Blues','Deep Southern Blues','dirty blues'] },
    { name: 'Mood by region', genres: ['new orleans', 'new york','chicago','paris','mississippi'] },
  ]

  window.JUST_JAZZ.YOUTUBE_THUMB_BASE = 'https://img.youtube.com/vi/';
  window.JUST_JAZZ.YOUTUBE_THUMB_SIZE = 'mqdefault';

  window.JUST_JAZZ.RAIN_SOUNDS = [
    { id: 'none',              name: 'None',                  videoId: null },
    { id: 'soft-rain',         name: 'Soft Rain',             videoId: 'mMxAZToUAjo' },
    { id: 'deep-rain',         name: 'Deep Rain',             videoId: 'mPZkdNFkNps' },
    { id: 'rain-thunders',     name: 'Rain and Thunders',     videoId: 'ROSs-SnkzvQ' },
    { id: 'deep-rain-thunder', name: 'Deep Rain and Thunder', videoId: 'QQuLcCsQrd8' }
  ];

  function formatMoodName(id) {
    if (!id) return '';
    return String(id).split(' ').map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
  }
  window.JUST_JAZZ.formatMoodName = formatMoodName;
})(window);
