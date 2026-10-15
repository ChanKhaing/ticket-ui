export interface MailHogMessage {
  ID: string;
  From: {
    Relays: null | string[];
    Mailbox: string;
    Domain: string;
    Params: string;
  };
  To: Array<{
    Relays: null | string[];
    Mailbox: string;
    Domain: string;
    Params: string;
  }>;
  Content: {
    Headers: {
      Subject?: string[];
      To?: string[];
      From?: string[];
      Date?: string[];
    };
    Body: string;
  };
  Created: string;
}

export interface MailHogResponse {
  total: number;
  count: number;
  start: number;
  items: MailHogMessage[];
}

export const mailhogApi = {
  /**
   * Fetch recent messages from MailHog via the Vite proxy or fallback URL
   */
  async getMessages(): Promise<MailHogMessage[]> {
    try {
      // First try proxy route '/mailhog-api/api/v2/messages'
      const res = await fetch('/mailhog-api/api/v2/messages');
      if (res.ok) {
        const data: MailHogResponse = await res.json();
        return data.items || [];
      }
    } catch {
      // Direct fallback if proxy is unavailable
      try {
        const res = await fetch('http://localhost:8025/api/v2/messages');
        if (res.ok) {
          const data: MailHogResponse = await res.json();
          return data.items || [];
        }
      } catch {
        // MailHog might not be accessible
      }
    }
    return [];
  },

  /**
   * Find the most recent OTP sent to a specific email (or any email)
   */
  async findLatestOtp(email?: string): Promise<{ code: string; sentTo: string; time: string } | null> {
    const messages = await this.getMessages();
    for (const msg of messages) {
      const toHeader = msg.Content.Headers.To?.[0] || '';
      const subject = msg.Content.Headers.Subject?.[0] || '';
      const body = msg.Content.Body || '';

      if (email && !toHeader.toLowerCase().includes(email.toLowerCase())) {
        continue;
      }

      // Look for 6-digit OTP in Subject or Body
      const matchInSubject = subject.match(/\b(\d{6})\b/);
      if (matchInSubject) {
        return {
          code: matchInSubject[1],
          sentTo: toHeader,
          time: msg.Created,
        };
      }

      const matchInBody = body.match(/verification code is:\s*(\d{6})/i) || body.match(/\b(\d{6})\b/);
      if (matchInBody) {
        return {
          code: matchInBody[1],
          sentTo: toHeader,
          time: msg.Created,
        };
      }
    }
    return null;
  },

  /**
   * Find the most recent Password Reset token sent to a specific email
   */
  async findLatestResetToken(email?: string): Promise<{ token: string; link: string; sentTo: string; time: string } | null> {
    const messages = await this.getMessages();
    for (const msg of messages) {
      const toHeader = msg.Content.Headers.To?.[0] || '';
      const body = msg.Content.Body || '';

      if (email && !toHeader.toLowerCase().includes(email.toLowerCase())) {
        continue;
      }

      // Clean quoted-printable encoding artifact
      const cleanBody = body.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
      const tokenMatch = cleanBody.match(/token=([a-zA-Z0-9]+)/);

      if (tokenMatch) {
        const token = tokenMatch[1];
        return {
          token,
          link: `/reset-password?token=${token}`,
          sentTo: toHeader,
          time: msg.Created,
        };
      }
    }
    return null;
  },
};
