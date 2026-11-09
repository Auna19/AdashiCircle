/**
 * @file In-app notification service (JavaScript)
 */

import { createServiceClient } from '@/lib/supabase/service'

export async function createNotification(params) {
  const supabase = createServiceClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    group_id: params.groupId ?? null,
    type: params.type || 'general',
    title: params.title,
    message: params.message,
    link: params.link ?? null,
    is_read: false,
  })

  if (error) {
    console.error('[Notifications] Error creating notification:', error.message)
  }
}

export async function createBulkNotifications(notifications) {
  if (!notifications?.length) return
  const supabase = createServiceClient()

  const rows = notifications.map((n) => ({
    user_id: n.userId || n.user_id,
    group_id: n.groupId || n.group_id || null,
    type: n.type || 'general',
    title: n.title,
    message: n.message,
    link: n.link || null,
    is_read: false,
  }))

  const { error } = await supabase.from('notifications').insert(rows)
  if (error) {
    console.error('[Notifications] Error creating bulk notifications:', error.message)
  }
}

export async function markAsRead(notificationId, userId) {
  const supabase = createServiceClient()
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
}

export async function markAllAsRead(userId) {
  const supabase = createServiceClient()
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)
}

export async function getUnreadCount(userId) {
  const supabase = createServiceClient()
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) return 0
  return count || 0
}

