/**
 * @file Server-side audit logging utility (JavaScript)
 */

import { createServiceClient } from '@/lib/supabase/service'

export async function createAuditLog(params) {
  try {
    const supabase = createServiceClient()

    const { error } = await supabase.from('audit_logs').insert({
      user_id: params.userId ?? null,
      group_id: params.groupId ?? null,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? null,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    })

    if (error) {
      console.error('[AuditLog] Failed to write audit log:', {
        action: params.action,
        error: error.message,
      })
    }
  } catch (err) {
    console.error('[AuditLog] Unexpected error writing audit log:', err)
  }
}

export default createAuditLog

