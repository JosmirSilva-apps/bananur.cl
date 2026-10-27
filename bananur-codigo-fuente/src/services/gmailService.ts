/**
 * Gmail API Client Service for Bananur Corporate Email
 */

export interface EmailHeader {
  name: string;
  value: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  historyId?: string;
  internalDate: string;
  labelIds: string[];
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  subject: string;
  date: string;
  bodyHtml?: string;
  bodyText?: string;
  isUnread: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

// Base64URL decoder utility for email bodies
function decodeBase64Url(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.warn('Error decodificando Base64URL:', e);
    return '';
  }
}

// Extract body from Gmail payload parts recursively
function extractBody(payload: any): { html: string; text: string } {
  let html = '';
  let text = '';

  if (!payload) return { html, text };

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      html += decoded;
    } else {
      text += decoded;
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested.html) html += (html ? '<br/>' : '') + nested.html;
      if (nested.text) text += (text ? '\n' : '') + nested.text;
    }
  }

  return { html, text };
}

// Parse sender string "Name <email@domain.com>"
function parseSender(fromHeader: string): { name: string; email: string } {
  if (!fromHeader) return { name: 'Desconocido', email: '' };
  const match = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    return {
      name: match[1].replace(/["']/g, '').trim() || match[2],
      email: match[2].trim()
    };
  }
  return {
    name: fromHeader.split('@')[0],
    email: fromHeader.trim()
  };
}

export async function fetchGmailMessages(
  token: string,
  options: {
    label?: string;
    query?: string;
    maxResults?: number;
  } = {}
): Promise<EmailMessage[]> {
  const { label = 'INBOX', query = '', maxResults = 25 } = options;

  let url = `${GMAIL_API_BASE}/messages?maxResults=${maxResults}`;
  if (label && label !== 'ALL') {
    url += `&labelIds=${encodeURIComponent(label)}`;
  }
  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al listar mensajes de Gmail (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const rawList: Array<{ id: string; threadId: string }> = data.messages || [];

  if (rawList.length === 0) {
    return [];
  }

  // Fetch full details in parallel (chunks of 10)
  const fullMessages = await Promise.all(
    rawList.slice(0, 20).map(async (item) => {
      try {
        const itemRes = await fetch(`${GMAIL_API_BASE}/messages/${item.id}?format=full`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!itemRes.ok) return null;
        const msg = await itemRes.json();
        return parseGmailMessage(msg);
      } catch (err) {
        console.error('Error obteniendo detalle de correo:', err);
        return null;
      }
    })
  );

  return fullMessages.filter((m): m is EmailMessage => m !== null);
}

export async function fetchGmailMessageDetail(token: string, messageId: string): Promise<EmailMessage> {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al obtener detalle del correo (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return parseGmailMessage(data);
}

function parseGmailMessage(data: any): EmailMessage {
  const headers: EmailHeader[] = data.payload?.headers || [];
  const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const fromStr = getHeader('From');
  const { name: fromName, email: fromEmail } = parseSender(fromStr);
  const toStr = getHeader('To');
  const subjectStr = getHeader('Subject') || '(Sin Asunto)';
  const dateStr = getHeader('Date');
  const labels: string[] = data.labelIds || [];

  const { html, text } = extractBody(data.payload);

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    historyId: data.historyId,
    internalDate: data.internalDate,
    labelIds: labels,
    from: fromStr,
    fromName,
    fromEmail,
    to: toStr,
    subject: subjectStr,
    date: dateStr,
    bodyHtml: html || (text ? `<p style="white-space: pre-wrap; font-family: sans-serif;">${text}</p>` : ''),
    bodyText: text,
    isUnread: labels.includes('UNREAD'),
    isStarred: labels.includes('STARRED'),
    hasAttachment: Boolean(data.payload?.parts?.some((p: any) => p.filename && p.filename.length > 0))
  };
}

export async function sendGmailMessage(
  token: string,
  params: {
    to: string;
    subject: string;
    body: string;
    fromEmail?: string;
    threadId?: string;
    inReplyTo?: string;
  }
): Promise<{ id: string; threadId: string }> {
  const { to, subject, body, fromEmail = 'bananur.cl@gmail.com', threadId, inReplyTo } = params;

  // Build RFC 2822 email format
  const emailLines = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit'
  ];

  if (inReplyTo) {
    emailLines.push(`In-Reply-To: ${inReplyTo}`);
    emailLines.push(`References: ${inReplyTo}`);
  }

  emailLines.push('');
  emailLines.push(body);

  const rawMime = emailLines.join('\r\n');
  const base64Safe = btoa(unescape(encodeURIComponent(rawMime)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const payload: any = { raw: base64Safe };
  if (threadId) {
    payload.threadId = threadId;
  }

  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al enviar correo por Gmail (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function trashGmailMessage(token: string, messageId: string): Promise<void> {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/trash`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al mover correo a papelera (${res.status}): ${errorText}`);
  }
}

export async function markGmailAsRead(token: string, messageId: string): Promise<void> {
  await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      removeLabelIds: ['UNREAD']
    })
  });
}

export async function toggleGmailStar(token: string, messageId: string, currentStarred: boolean): Promise<void> {
  await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      addLabelIds: currentStarred ? [] : ['STARRED'],
      removeLabelIds: currentStarred ? ['STARRED'] : []
    })
  });
}
