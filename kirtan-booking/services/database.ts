// Native database — delegates to the Cloud Firestore data layer (services/api.ts).
// The app requires internet connectivity to read/write event and announcement data.
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
