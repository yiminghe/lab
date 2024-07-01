// use import dexie from 'dexie' on production
import Dexie from '../../vendors/dexie.js';

const db = new Dexie('SaveImage');

// Declare tables, IDs and indexes
db.version(1).stores({
  images: '++id, img',
});

export default db;
export const fakeUrl = 'https://offline/';
