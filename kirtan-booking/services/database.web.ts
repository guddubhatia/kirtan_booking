// Web database shim — delegates to the shared backend API.
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
