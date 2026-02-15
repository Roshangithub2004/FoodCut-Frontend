const SAVED_VIDEOS_STORAGE_KEY = 'foodcut:saved-videos-by-user';
const LEGACY_SAVED_VIDEOS_STORAGE_KEY = 'foodcut:saved-videos';
const SAVE_COUNTS_STORAGE_KEY = 'foodcut:save-counts';
const CURRENT_USER_STORAGE_KEY = 'foodcut:current-user';

const getVideoId = (video) => String(video?._id ?? '');

const parseJSON = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const getCurrentUser = () =>
  parseJSON(localStorage.getItem(CURRENT_USER_STORAGE_KEY), null);

const getCurrentUserKey = () => {
  const user = getCurrentUser();
  const id = user?.id ? `id:${String(user.id)}` : '';
  if (id) return id;

  const email = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (email) return `email:${email}`;

  return 'guest';
};

const setCurrentUser = (user) => {
  try {
    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify({
        id: user?.id ?? user?._id ?? '',
        email: user?.email ?? '',
        role: user?.role ?? 'user',
      })
    );
  } catch (error) {
    console.log('Current user write error:', error.message || error);
  }
};

const readAllSavedVideosByUser = () => {
  const parsed = parseJSON(localStorage.getItem(SAVED_VIDEOS_STORAGE_KEY), {});
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  return {};
};

const writeAllSavedVideosByUser = (allSavedVideosByUser) => {
  try {
    localStorage.setItem(SAVED_VIDEOS_STORAGE_KEY, JSON.stringify(allSavedVideosByUser));
  } catch (error) {
    console.log('Saved videos write error:', error.message || error);
  }
};

const migrateLegacySavedVideosIfNeeded = (userKey) => {
  const allSavedVideosByUser = readAllSavedVideosByUser();
  const hasAnyUserBuckets = Object.keys(allSavedVideosByUser).length > 0;
  if (hasAnyUserBuckets) return;

  const legacySaved = parseJSON(localStorage.getItem(LEGACY_SAVED_VIDEOS_STORAGE_KEY), []);
  if (!Array.isArray(legacySaved) || legacySaved.length === 0) return;

  allSavedVideosByUser[userKey] = legacySaved;
  writeAllSavedVideosByUser(allSavedVideosByUser);
};

const readSaveCounts = () => {
  const parsed = parseJSON(localStorage.getItem(SAVE_COUNTS_STORAGE_KEY), {});
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  return {};
};

const writeSaveCounts = (counts) => {
  try {
    localStorage.setItem(SAVE_COUNTS_STORAGE_KEY, JSON.stringify(counts));
  } catch (error) {
    console.log('Save counts write error:', error.message || error);
  }
};

const getSaveCountForVideo = (videoId) => {
  const id = String(videoId ?? '');
  if (!id) return 0;
  const counts = readSaveCounts();
  const value = Number(counts[id]);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const readSavedVideos = (userKey = getCurrentUserKey()) => {
  migrateLegacySavedVideosIfNeeded(userKey);
  const allSavedVideosByUser = readAllSavedVideosByUser();
  const videos = allSavedVideosByUser[userKey];
  return Array.isArray(videos) ? videos : [];
};

const writeSavedVideos = (videos, userKey = getCurrentUserKey()) => {
  const allSavedVideosByUser = readAllSavedVideosByUser();
  allSavedVideosByUser[userKey] = Array.isArray(videos) ? videos : [];
  writeAllSavedVideosByUser(allSavedVideosByUser);
};

const getSavedVideoIds = (userKey = getCurrentUserKey()) =>
  new Set(readSavedVideos(userKey).map((video) => getVideoId(video)).filter(Boolean));

const saveVideoOnce = (video, userKey = getCurrentUserKey()) => {
  const videoId = getVideoId(video);
  if (!videoId) return false;

  const savedVideos = readSavedVideos(userKey);
  const exists = savedVideos.some((item) => getVideoId(item) === videoId);
  if (exists) return false;

  const currentCount = getSaveCountForVideo(videoId);
  const nextCount = currentCount + 1;
  const counts = readSaveCounts();
  counts[videoId] = nextCount;
  writeSaveCounts(counts);

  writeSavedVideos([...savedVideos, { ...video, isSaved: true, saveCount: nextCount }], userKey);
  return true;
};

const unsaveVideoOnce = (videoIdOrVideo, userKey = getCurrentUserKey()) => {
  const videoId =
    typeof videoIdOrVideo === 'string'
      ? videoIdOrVideo
      : getVideoId(videoIdOrVideo);
  if (!videoId) return false;

  const savedVideos = readSavedVideos(userKey);
  const exists = savedVideos.some((item) => getVideoId(item) === videoId);
  if (!exists) return false;

  const filtered = savedVideos.filter((item) => getVideoId(item) !== videoId);
  writeSavedVideos(filtered, userKey);

  const counts = readSaveCounts();
  const currentCount = Number(counts[videoId]) || 0;
  const nextCount = Math.max(0, currentCount - 1);
  counts[videoId] = nextCount;
  writeSaveCounts(counts);
  return true;
};

const toggleSavedVideo = (video, userKey = getCurrentUserKey()) => {
  const videoId = getVideoId(video);
  if (!videoId) return { changed: false, isSaved: false, saveCount: 0 };

  const savedIds = getSavedVideoIds(userKey);
  const isCurrentlySaved = savedIds.has(videoId);

  if (isCurrentlySaved) {
    const changed = unsaveVideoOnce(videoId, userKey);
    return {
      changed,
      isSaved: false,
      saveCount: getSaveCountForVideo(videoId),
    };
  }

  const changed = saveVideoOnce(video, userKey);
  return {
    changed,
    isSaved: true,
    saveCount: getSaveCountForVideo(videoId),
  };
};

export {
  getCurrentUserKey,
  getSaveCountForVideo,
  getSavedVideoIds,
  readSavedVideos,
  saveVideoOnce,
  setCurrentUser,
  toggleSavedVideo,
  unsaveVideoOnce,
  writeSavedVideos,
};
