
'use client';

const DB_NAME = 'ScheduleMeDB';
const DB_VERSION = 1;
const STORE_NAME = 'sounds';
const SOUND_KEY = 'notificationSound';

let db: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject('Error opening database');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function setNotificationSound(soundBlob: Blob): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(soundBlob, SOUND_KEY);

    request.onsuccess = () => {
      // Dispatch a custom event to notify components that the sound has changed
      window.dispatchEvent(new CustomEvent('notificationSoundUpdated'));
      resolve();
    };
    request.onerror = () => {
      reject('Error saving sound to IndexedDB');
    };
  });
}

export async function getNotificationSound(): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(SOUND_KEY);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => {
      reject('Error retrieving sound from IndexedDB');
    };
  });
}
