// Web database shim — delegates to the Cloud Firestore data layer (services/api.ts).
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
