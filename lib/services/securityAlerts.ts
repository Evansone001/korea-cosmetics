/**
 * Security Alerts & Escalation Service
 * 
 * Provides real-time security notifications and automated escalation:
 * - Real-time threat notifications
 * - Severity-based escalation rules
 * - Automated response playbooks
 * - Admin notification center
 * - Alert acknowledgment and tracking
 */

import { SecurityAlert, SecurityEvent } from './types/security'

// Notification channels
interface NotificationChannels {
  inApp: boolean
  email: boolean
  slack?: boolean
  webhook?: string
}

// Escalation rule
interface EscalationRule {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  minOccurrences: number
  timeWindow: number // milliseconds
  autoAssign?: string
  autoBlock?: boolean
  notifyChannels: NotificationChannels
  playbook?: string
}

// Response playbook
interface ResponsePlaybook {
  id: string
  name: string
  triggers: string[]
  actions: {
    type: 'block' | 'notify' | 'lock' | 'log' | 'escalate' | 'quarantine'
    target?: string
    duration?: number
    message?: string
  }[]
}

// Alert preferences per admin
interface AlertPreferences {
  userId: string
  channels: NotificationChannels
  severityFilter: ('critical' | 'high' | 'medium' | 'low')[]
  quietHours?: {
    start: number // hour (0-23)
    end: number
  }
  email?: string
  phone?: string
}

/**
 * Security Alerts & Escalation Service
 */
export class SecurityAlertsService {
  private alerts: Map<string, SecurityAlert> = new Map()
  private escalationRules: EscalationRule[] = []
  private playbooks: Map<string, ResponsePlaybook> = new Map()
  private userPreferences: Map<string, AlertPreferences> = new Map()
  private alertHistory: SecurityAlert[] = []
  private subscribers: Set<(alert: SecurityAlert) => void> = new Set()

  constructor() {
    this.initializeService()
  }

  private initializeService() {
    // Load default escalation rules
    this.loadDefaultRules()
    
    // Load default playbooks
    this.loadDefaultPlaybooks()
    
    // Start background processes
    this.startAlertProcessing()
  }

  /**
   * Load default escalation rules
   */
  private loadDefaultRules() {
    this.escalationRules = [
      {
        id: 'critical_immediate',
        severity: 'critical',
        minOccurrences: 1,
        timeWindow: 0,
        autoBlock: true,
        notifyChannels: {
          inApp: true,
          email: true,
          slack: true
        },
        playbook: 'critical_response'
      },
      {
        id: 'high_rapid',
        severity: 'high',
        minOccurrences: 3,
        timeWindow: 300000, // 5 minutes
        autoAssign: 'security_team',
        notifyChannels: {
          inApp: true,
          email: true
        },
        playbook: 'high_risk_response'
      },
      {
        id: 'medium_pattern',
        severity: 'medium',
        minOccurrences: 5,
        timeWindow: 600000, // 10 minutes
        notifyChannels: {
          inApp: true,
          email: false
        },
        playbook: 'medium_risk_response'
      },
      {
        id: 'low_monitoring',
        severity: 'low',
        minOccurrences: 10,
        timeWindow: 3600000, // 1 hour
        notifyChannels: {
          inApp: true,
          email: false
        }
      }
    ]
  }

  /**
   * Load default response playbooks
   */
  private loadDefaultPlaybooks() {
    const playbooks: ResponsePlaybook[] = [
      {
        id: 'critical_response',
        name: 'Critical Security Incident',
        triggers: ['critical'],
        actions: [
          { type: 'block', duration: 3600000 },
          { type: 'notify', message: 'Critical security incident detected and blocked' },
          { type: 'escalate' },
          { type: 'log' }
        ]
      },
      {
        id: 'high_risk_response',
        name: 'High Risk Activity',
        triggers: ['high', 'brute_force', 'data_exfiltration'],
        actions: [
          { type: 'lock', duration: 1800000 },
          { type: 'notify', message: 'High risk activity detected, account temporarily locked' },
          { type: 'log' }
        ]
      },
      {
        id: 'medium_risk_response',
        name: 'Medium Risk Activity',
        triggers: ['medium', 'unusual_access', 'new_device'],
        actions: [
          { type: 'notify', message: 'Suspicious activity detected, verification required' },
          { type: 'log' }
        ]
      },
      {
        id: 'ddos_response',
        name: 'DDoS Attack Response',
        triggers: ['ddos'],
        actions: [
          { type: 'block', duration: 7200000 },
          { type: 'quarantine', target: 'ip_range' },
          { type: 'notify', message: 'DDoS attack detected, protective measures activated' },
          { type: 'escalate' }
        ]
      },
      {
        id: 'injection_response',
        name: 'Injection Attack Response',
        triggers: ['sql_injection', 'xss', 'command_injection'],
        actions: [
          { type: 'block', duration: 86400000 }, // 24 hours
          { type: 'notify', message: 'Injection attack blocked, IP blacklisted' },
          { type: 'escalate' },
          { type: 'log' }
        ]
      }
    ]

    playbooks.forEach(pb => this.playbooks.set(pb.id, pb))
  }

  /**
   * Start background alert processing
   */
  private startAlertProcessing() {
    // Process alert queue periodically
    setInterval(() => {
      this.processAlertQueue()
    }, 5000) // Every 5 seconds
  }

  /**
   * Process alert queue
   */
  private async processAlertQueue() {
    // In production, this would process a queue of pending alerts
    // For now, this is a placeholder
  }

  /**
   * Create and dispatch a security alert
   */
  async createAlert(
    event: SecurityEvent,
    severity: 'critical' | 'high' | 'medium' | 'low',
    customMessage?: string
  ): Promise<SecurityAlert> {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity,
      title: this.generateAlertTitle(event, severity),
      message: customMessage || this.generateAlertMessage(event),
      eventId: event.id,
      acknowledged: false,
      escalated: false
    }

    // Store alert
    this.alerts.set(alert.id, alert)
    this.alertHistory.push(alert)

    // Apply escalation rules
    await this.applyEscalationRules(alert, event)

    // Execute playbook if applicable
    await this.executePlaybook(alert, event)

    // Notify subscribers
    this.notifySubscribers(alert)

    // Send notifications
    await this.sendNotifications(alert, event)

    return alert
  }

  /**
   * Generate alert title based on event
   */
  private generateAlertTitle(event: SecurityEvent, severity: string): string {
    const prefix = severity.toUpperCase()
    
    switch (event.category) {
      case 'attack':
        return `${prefix}: ${event.type.replace(/_/g, ' ').toUpperCase()} Detected`
      case 'authentication':
        return `${prefix}: Authentication ${event.type === 'successful_login' ? 'Success' : 'Anomaly'}`
      case 'authorization':
        return `${prefix}: Unauthorized Access Attempt`
      case 'data_access':
        return `${prefix}: Unusual Data Access Pattern`
      case 'anomaly':
        return `${prefix}: Behavioral Anomaly Detected`
      default:
        return `${prefix}: Security Event Detected`
    }
  }

  /**
   * Generate alert message based on event
   */
  private generateAlertMessage(event: SecurityEvent): string {
    const parts: string[] = [
      event.description,
      `User: ${event.userName || event.userId || 'Anonymous'}`,
      `IP: ${event.ipAddress}`,
      `Threat Score: ${event.threatScore}/100`
    ]

    if (event.aiAnalysis) {
      parts.push(`AI Analysis: ${event.aiAnalysis.threatCategory}`)
    }

    return parts.join(' | ')
  }

  /**
   * Apply escalation rules to alert
   */
  private async applyEscalationRules(alert: SecurityAlert, event: SecurityEvent): Promise<void> {
    // Find matching rules
    const matchingRules = this.escalationRules.filter(
      rule => rule.severity === alert.severity
    )

    for (const rule of matchingRules) {
      // Check if minimum occurrences met
      const recentAlerts = this.alertHistory.filter(
        a => a.eventId === event.id &&
             a.timestamp > new Date(Date.now() - rule.timeWindow)
      )

      if (recentAlerts.length >= rule.minOccurrences) {
        // Auto-assign
        if (rule.autoAssign) {
          alert.assignedTo = rule.autoAssign
        }

        // Mark as escalated
        alert.escalated = true

        // Log escalation
        console.log(`[SecurityAlerts] Alert ${alert.id} escalated based on rule ${rule.id}`)
      }
    }
  }

  /**
   * Execute response playbook
   */
  private async executePlaybook(alert: SecurityAlert, event: SecurityEvent): Promise<void> {
    // Find matching playbook
    let playbook: ResponsePlaybook | undefined

    // First try to match by triggers
    for (const pb of this.playbooks.values()) {
      if (pb.triggers.includes(event.type) || pb.triggers.includes(alert.severity)) {
        playbook = pb
        break
      }
    }

    // Default playbook if no match
    if (!playbook) {
      playbook = this.playbooks.get('medium_risk_response')
    }

    if (!playbook) return

    // Execute actions
    for (const action of playbook.actions) {
      await this.executePlaybookAction(action, alert, event)
    }
  }

  /**
   * Execute a single playbook action
   */
  private async executePlaybookAction(
    action: ResponsePlaybook['actions'][0],
    alert: SecurityAlert,
    event: SecurityEvent
  ): Promise<void> {
    switch (action.type) {
      case 'block':
        // In production, call firewall/blocking service
        console.log(`[Playbook] Block action for ${event.ipAddress}, duration: ${action.duration}ms`)
        break

      case 'lock':
        // In production, call auth service to lock account
        console.log(`[Playbook] Lock account ${event.userId}, duration: ${action.duration}ms`)
        break

      case 'quarantine':
        // In production, quarantine affected resources
        console.log(`[Playbook] Quarantine ${action.target || 'resource'}`)
        break

      case 'notify':
        // Notification is handled separately
        console.log(`[Playbook] Notify: ${action.message}`)
        break

      case 'escalate':
        alert.escalated = true
        console.log(`[Playbook] Escalate alert ${alert.id}`)
        break

      case 'log':
        // Already logged when creating alert
        break
    }
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(alert: SecurityAlert, event: SecurityEvent): Promise<void> {
    // Get notification preferences for all admins
    for (const [userId, preferences] of this.userPreferences.entries()) {
      // Check if severity meets filter
      if (!preferences.severityFilter.includes(alert.severity)) {
        continue
      }

      // Check quiet hours
      if (this.isQuietHours(preferences)) {
        continue
      }

      // Send in-app notification
      if (preferences.channels.inApp) {
        this.sendInAppNotification(userId, alert)
      }

      // Send email
      if (preferences.channels.email && preferences.email) {
        this.sendEmailNotification(preferences.email, alert)
      }

      // Send Slack
      if (preferences.channels.slack) {
        this.sendSlackNotification(alert)
      }

      // Send webhook
      if (preferences.channels.webhook) {
        this.sendWebhookNotification(preferences.channels.webhook, alert, event)
      }
    }
  }

  /**
   * Check if currently in quiet hours for user
   */
  private isQuietHours(preferences: AlertPreferences): boolean {
    if (!preferences.quietHours) return false

    const now = new Date()
    const currentHour = now.getHours()
    const { start, end } = preferences.quietHours

    if (start < end) {
      return currentHour >= start && currentHour < end
    } else {
      // Handles overnight quiet hours (e.g., 22:00 - 06:00)
      return currentHour >= start || currentHour < end
    }
  }

  /**
   * Send in-app notification
   */
  private sendInAppNotification(userId: string, alert: SecurityAlert): void {
    // In production, this would push to a real-time notification service
    console.log(`[Notification] In-app: User ${userId}, Alert ${alert.id}`)
  }

  /**
   * Send email notification
   */
  private sendEmailNotification(email: string, alert: SecurityAlert): void {
    // In production, integrate with email service
    console.log(`[Notification] Email: ${email}, Alert ${alert.id}`)
  }

  /**
   * Send Slack notification
   */
  private sendSlackNotification(alert: SecurityAlert): void {
    // In production, integrate with Slack API
    console.log(`[Notification] Slack: Alert ${alert.id}`)
  }

  /**
   * Send webhook notification
   */
  private sendWebhookNotification(webhook: string, alert: SecurityAlert, event: SecurityEvent): void {
    // In production, make HTTP POST to webhook
    console.log(`[Notification] Webhook: ${webhook}, Alert ${alert.id}`)
  }

  /**
   * Notify real-time subscribers
   */
  private notifySubscribers(alert: SecurityAlert): void {
    this.subscribers.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  /**
   * Subscribe to real-time alerts
   */
  subscribe(callback: (alert: SecurityAlert) => void): () => void {
    this.subscribers.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<SecurityAlert | null> {
    const alert = this.alerts.get(alertId)
    if (!alert) return null

    alert.acknowledged = true
    alert.acknowledgedBy = userId
    alert.acknowledgedAt = new Date()

    await this.saveAlert(alert)

    return alert
  }

  /**
   * Escalate an alert manually
   */
  async escalateAlert(alertId: string, userId: string, reason?: string): Promise<SecurityAlert | null> {
    const alert = this.alerts.get(alertId)
    if (!alert) return null

    alert.escalated = true
    alert.escalatedBy = userId
    alert.escalatedAt = new Date()
    alert.escalationReason = reason

    await this.saveAlert(alert)

    return alert
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string, resolution: string): Promise<SecurityAlert | null> {
    const alert = this.alerts.get(alertId)
    if (!alert) return null

    alert.resolved = true
    alert.resolvedBy = userId
    alert.resolvedAt = new Date()
    alert.resolution = resolution

    await this.saveAlert(alert)

    return alert
  }

  /**
   * Assign alert to user
   */
  async assignAlert(alertId: string, userId: string): Promise<SecurityAlert | null> {
    const alert = this.alerts.get(alertId)
    if (!alert) return null

    alert.assignedTo = userId
    await this.saveAlert(alert)

    return alert
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): SecurityAlert | undefined {
    return this.alerts.get(alertId)
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values())
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): SecurityAlert[] {
    return this.getAllAlerts().filter(a => a.severity === severity)
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): SecurityAlert[] {
    return this.getAllAlerts().filter(a => !a.acknowledged && !a.resolved)
  }

  /**
   * Get escalated alerts
   */
  getEscalatedAlerts(): SecurityAlert[] {
    return this.getAllAlerts().filter(a => a.escalated && !a.resolved)
  }

  /**
   * Get alerts assigned to user
   */
  getAlertsByAssignee(userId: string): SecurityAlert[] {
    return this.getAllAlerts().filter(a => a.assignedTo === userId && !a.resolved)
  }

  /**
   * Get alert statistics
   */
  getAlertStats(): {
    total: number
    bySeverity: Record<string, number>
    unacknowledged: number
    escalated: number
    resolved: number
    averageResolutionTime?: number
  } {
    const allAlerts = this.getAllAlerts()
    
    const bySeverity: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }

    let resolvedCount = 0
    let totalResolutionTime = 0

    for (const alert of allAlerts) {
      bySeverity[alert.severity]++
      
      if (alert.resolved) {
        resolvedCount++
        if (alert.resolvedAt && alert.timestamp) {
          totalResolutionTime += alert.resolvedAt.getTime() - alert.timestamp.getTime()
        }
      }
    }

    return {
      total: allAlerts.length,
      bySeverity,
      unacknowledged: this.getUnacknowledgedAlerts().length,
      escalated: this.getEscalatedAlerts().length,
      resolved: resolvedCount,
      averageResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount : undefined
    }
  }

  /**
   * Set user alert preferences
   */
  async setAlertPreferences(userId: string, preferences: Partial<AlertPreferences>): Promise<void> {
    const existing = this.userPreferences.get(userId) || {
      userId,
      channels: { inApp: true, email: false },
      severityFilter: ['critical', 'high']
    }

    this.userPreferences.set(userId, {
      ...existing,
      ...preferences,
      userId
    })
  }

  /**
   * Get user alert preferences
   */
  getAlertPreferences(userId: string): AlertPreferences | undefined {
    return this.userPreferences.get(userId)
  }

  /**
   * Add custom escalation rule
   */
  addEscalationRule(rule: EscalationRule): void {
    this.escalationRules.push(rule)
  }

  /**
   * Remove escalation rule
   */
  removeEscalationRule(ruleId: string): void {
    this.escalationRules = this.escalationRules.filter(r => r.id !== ruleId)
  }

  /**
   * Add custom playbook
   */
  addPlaybook(playbook: ResponsePlaybook): void {
    this.playbooks.set(playbook.id, playbook)
  }

  /**
   * Get playbook
   */
  getPlaybook(playbookId: string): ResponsePlaybook | undefined {
    return this.playbooks.get(playbookId)
  }

  /**
   * Get all playbooks
   */
  getAllPlaybooks(): ResponsePlaybook[] {
    return Array.from(this.playbooks.values())
  }

  /**
   * Save alert to persistent storage
   */
  private async saveAlert(alert: SecurityAlert): Promise<void> {
    // In production, save to database
    this.alerts.set(alert.id, alert)
  }

  /**
   * Get alert history with filtering
   */
  getAlertHistory(
    filters?: {
      startDate?: Date
      endDate?: Date
      severity?: string
      acknowledged?: boolean
      resolved?: boolean
    }
  ): SecurityAlert[] {
    let history = [...this.alertHistory]

    if (filters) {
      if (filters.startDate) {
        history = history.filter(a => a.timestamp >= filters.startDate!)
      }
      if (filters.endDate) {
        history = history.filter(a => a.timestamp <= filters.endDate!)
      }
      if (filters.severity) {
        history = history.filter(a => a.severity === filters.severity)
      }
      if (filters.acknowledged !== undefined) {
        history = history.filter(a => a.acknowledged === filters.acknowledged)
      }
      if (filters.resolved !== undefined) {
        history = history.filter(a => a.resolved === filters.resolved)
      }
    }

    return history
  }

  /**
   * Cleanup old alerts
   */
  async cleanupOldAlerts(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - maxAge)
    let removed = 0

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.timestamp < cutoff && alert.resolved) {
        this.alerts.delete(id)
        removed++
      }
    }

    this.alertHistory = this.alertHistory.filter(a => a.timestamp >= cutoff)

    return removed
  }
}

// Export singleton instance
export const securityAlertsService = new SecurityAlertsService()
