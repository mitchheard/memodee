/**
 * Umami custom events (AVIDX-80). All calls are no-ops if the tracker is absent.
 */

declare global {
  interface Window {
    umami?: {
      track?: (eventName?: string, data?: Record<string, unknown>) => void
    }
  }
}

const UMAMI_EVENTS = {
  importCompleted: 'import_completed',
  searchPerformed: 'search_performed',
  filterApplied: 'filter_applied',
  conversationOpened: 'conversation_opened',
  exportTriggered: 'export_triggered',
  analyticsViewed: 'analytics_viewed',
} as const

function safeTrack(eventName: string, data?: Record<string, unknown>): void {
  try {
    const track = window.umami?.track
    if (typeof track !== 'function') return
    track(eventName, data)
  } catch {
    /* blocked script / API mismatch */
  }
}

export function trackImportCompleted(conversationCount: number): void {
  safeTrack(UMAMI_EVENTS.importCompleted, { conversation_count: conversationCount })
}

export function trackSearchPerformed(searchType: 'fuzzy' | 'semantic'): void {
  safeTrack(UMAMI_EVENTS.searchPerformed, { search_type: searchType })
}

export function trackFilterApplied(
  filterType: 'date' | 'model' | 'starred' | 'has_code' | 'min_messages'
): void {
  safeTrack(UMAMI_EVENTS.filterApplied, { filter_type: filterType })
}

export function trackConversationOpened(): void {
  safeTrack(UMAMI_EVENTS.conversationOpened)
}

export function trackExportTriggered(exportType: 'markdown' | 'obsidian' | 'notion'): void {
  safeTrack(UMAMI_EVENTS.exportTriggered, { export_type: exportType })
}

export function trackAnalyticsViewed(): void {
  safeTrack(UMAMI_EVENTS.analyticsViewed)
}
