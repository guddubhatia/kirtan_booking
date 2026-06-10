// Native database — delegates to the shared backend API for cross-device data sync.
// The app now requires internet connectivity to read/write event and announcement data.
export {
  initDatabase,
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  getAnnouncements,
  addAnnouncement,
  deleteAnnouncement,
  savePushToken,
  getPushTokens,
} from './api';
