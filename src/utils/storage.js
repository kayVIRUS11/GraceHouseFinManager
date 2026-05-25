const DB_NAME = 'grace-house-tracker'
const DB_VERSION = 2
const STORE = 'state'
const OPS_STORE = 'ops'

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
      if (!db.objectStoreNames.contains(OPS_STORE)) {
        db.createObjectStore(OPS_STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export const loadState = async () => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly')
    const store = transaction.objectStore(STORE)
    const request = store.get('schoolState')
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export const saveState = async (state) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    const store = transaction.objectStore(STORE)
    const request = store.put(state, 'schoolState')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const addOp = async (op) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OPS_STORE, 'readwrite')
    const store = transaction.objectStore(OPS_STORE)
    const request = store.add(op)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const getOps = async () => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OPS_STORE, 'readonly')
    const store = transaction.objectStore(OPS_STORE)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export const deleteOps = async (ids) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OPS_STORE, 'readwrite')
    const store = transaction.objectStore(OPS_STORE)
    ids.forEach((id) => store.delete(id))
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export const loadLastSync = async () => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly')
    const store = transaction.objectStore(STORE)
    const request = store.get('lastSyncAt')
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export const saveLastSync = async (value) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite')
    const store = transaction.objectStore(STORE)
    const request = store.put(value, 'lastSyncAt')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
