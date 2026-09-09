/**
 * Google Calendar & Reminder Notification Service
 * Integrates with Google Calendar API (v3) to schedule recurring mood & goal check-in reminders,
 * and manages web notifications with sound alarms.
 */

import { ReminderSettings } from '../types';

export interface CalendarEventResult {
  eventId: string;
  htmlLink: string;
  summary: string;
  startTime: string;
  recurrence: string[];
}

/**
 * Creates or updates a recurring Google Calendar event for mindful check-ins.
 * Direct link to open the application is embedded in the event description.
 */
export async function syncMindfulCalendarEvent(
  accessToken: string,
  settings: ReminderSettings,
  userGoals: string[] = []
): Promise<CalendarEventResult> {
  if (!accessToken) {
    throw new Error('Google Calendar access token is required. Please sign in with Google.');
  }

  // Parse preferredTime "HH:MM"
  const [hoursStr, minutesStr] = settings.preferredTime.split(':');
  const hours = parseInt(hoursStr || '08', 10);
  const minutes = parseInt(minutesStr || '30', 10);

  // Set start date to today (or tomorrow if time already passed)
  const now = new Date();
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  if (startDate <= now) {
    startDate.setDate(startDate.getDate() + 1);
  }

  // 15-minute mindful check-in slot
  const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Recurrence rule
  const recurrenceRule =
    settings.frequency === 'weekly'
      ? 'RRULE:FREQ=WEEKLY'
      : 'RRULE:FREQ=DAILY';

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mindful-companion.app';

  const goalsList = userGoals.length > 0 ? userGoals.join(', ') : 'Calm, Focus & Well-being';

  const eventPayload = {
    summary: '🌿 Mindful Companion: Mood & Goal Check-In',
    description: `Time for your daily mindful pause! Take 2 minutes to check in with your energy, stress levels, and progress on your goals (${goalsList}).\n\nDirect Link to open Mindful Companion:\n${appUrl}\n\n"A gentle pause transforms the entire day."`,
    start: {
      dateTime: startIso,
      timeZone: userTimeZone,
    },
    end: {
      dateTime: endIso,
      timeZone: userTimeZone,
    },
    recurrence: [recurrenceRule],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
        { method: 'email', minutes: 30 },
      ],
    },
    colorId: '2', // Sage Green in Google Calendar
  };

  const existingEventId = settings.googleCalendarEventId;
  const isUpdate = Boolean(existingEventId);
  const endpoint = isUpdate
    ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEventId}`
    : `https://www.googleapis.com/calendar/v3/calendars/primary/events`;

  const response = await fetch(endpoint, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `Google Calendar API error (${response.status})`;
    throw new Error(message);
  }

  const result = await response.json();

  return {
    eventId: result.id,
    htmlLink: result.htmlLink,
    summary: result.summary,
    startTime: result.start?.dateTime || startIso,
    recurrence: result.recurrence || [recurrenceRule],
  };
}

/**
 * Removes a recurring event from the user's primary Google Calendar.
 */
export async function removeMindfulCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  if (!accessToken || !eventId) return;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // 404/410 means already deleted or gone
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to remove calendar event.');
  }
}

/**
 * Requests browser notification permission if supported.
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Dispatches a native browser notification reminding the user to check in.
 */
export function triggerBrowserNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'mindful-checkin-reminder',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      if (options?.onClick) {
        options.onClick();
      }
      notification.close();
    };
  } catch (err) {
    console.warn('Could not dispatch browser notification:', err);
  }
}
