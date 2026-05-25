import { supabase } from './supabase.js'
import { addOp, deleteOps, getOps, loadLastSync, saveLastSync } from './storage.js'

const DEVICE_ID_KEY = 'device_id'

const ensureDeviceId = () => {
  const stored = localStorage.getItem(DEVICE_ID_KEY)
  if (stored) return stored
  const id = `dev_${crypto.randomUUID()}`
  localStorage.setItem(DEVICE_ID_KEY, id)
  return id
}

export const queueOp = async (type, payload) => {
  const deviceId = ensureDeviceId()
  await addOp({
    type,
    payload,
    device_id: deviceId,
    created_at: new Date().toISOString()
  })
}

export const pushOps = async () => {
  const ops = await getOps()
  if (!ops.length) return { pushed: 0 }

  const { data, error } = await supabase.from('sync_ops').insert(
    ops.map((op) => ({
      type: op.type,
      payload: op.payload,
      device_id: op.device_id,
      created_at: op.created_at
    }))
  )

  if (error) throw error

  await deleteOps(ops.map((op) => op.id))
  return { pushed: data?.length || ops.length }
}

export const pullOps = async (applyRemoteOp) => {
  const lastSyncAt = (await loadLastSync()) || '1970-01-01T00:00:00.000Z'
  const { data, error } = await supabase
    .from('sync_ops')
    .select('*')
    .gt('created_at', lastSyncAt)
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!data || data.length === 0) return { pulled: 0 }

  data.forEach((op) => applyRemoteOp(op))
  const latest = data[data.length - 1]?.created_at
  if (latest) await saveLastSync(latest)
  return { pulled: data.length }
}
