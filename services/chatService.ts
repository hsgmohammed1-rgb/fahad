
import Pusher from 'pusher-js';
import { ChatMessage } from '../types';

type MessageCallback = (message: ChatMessage) => void;
type StatusCallback = (isConnected: boolean, error?: boolean, details?: string) => void;

const getRoleFromIdentity = (identity: any): 'owner' | 'moderator' | 'vip' | 'user' => {
  if (!identity || !identity.badges) return 'user';
  const badges = identity.badges;
  if (badges.some((b: any) => b.type === 'broadcaster')) return 'owner';
  if (badges.some((b: any) => b.type === 'moderator')) return 'moderator';
  if (badges.some((b: any) => b.type === 'vip')) return 'vip';
  return 'user';
};

class ChatService {
  private isConnected: boolean = false;
  private listeners: MessageCallback[] = [];
  private deleteListeners: ((id: string) => void)[] = [];
  private statusListeners: StatusCallback[] = [];
  private pusher: any = null;
  private channel: any = null;

  private KNOWN_CHATROOM_IDS: Record<string, number> = {
    // XTROET lookup is fresh from API every time to ensure correct Chatroom ID.
  };

  /**
   * v3: older builds cached whatever `data.id` happened to be, which is the
   * CHANNEL id — subscribing to it connects and then receives nothing,
   * forever. The version bump drops every one of those entries at once.
   */
  private CHAT_CACHE_PREFIX = 'kick_chatroom_id_v3_';

  /**
   * Kick only hands out a chatroom id inside a real `chatroom` object.
   *
   * The v2 channel payload also has a top-level `id` — that is the CHANNEL
   * id, not the room. Subscribing to `chatrooms.<channel id>` looks like it
   * connects but never receives a single message, and the bad id then sits in
   * localStorage poisoning every later load. So we refuse anything that did
   * not come out of `chatroom`.
   */
  private extractChatroomId(payload: any): number | null {
    const id = Number(payload?.chatroom?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private cacheKey(slug: string) {
    return `${this.CHAT_CACHE_PREFIX}${slug}`;
  }

  /** One lookup attempt: fetch, unwrap, and only accept a real chatroom id. */
  private async tryResolve(url: string, unwrap: (raw: any) => any, slug: string): Promise<number> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const found = this.extractChatroomId(unwrap(await response.json()));
      if (!found) throw new Error('no chatroom in payload');
      localStorage.setItem(this.cacheKey(slug), String(found));
      return found;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getChatroomId(channelSlug: string): Promise<number | null> {
    const slug = channelSlug.toLowerCase().trim();

    // 1. Memory cache
    if (this.KNOWN_CHATROOM_IDS[slug]) {
      return this.KNOWN_CHATROOM_IDS[slug];
    }

    // 2. Local storage cache
    const cachedId = Number(localStorage.getItem(this.cacheKey(slug)));
    if (Number.isFinite(cachedId) && cachedId > 0) {
      this.KNOWN_CHATROOM_IDS[slug] = cachedId;
      console.log(`[ChatService] Using cached ID for ${slug}: ${cachedId}`);
      return cachedId;
    }

    const api = `https://kick.com/api/v2/channels/${slug}`;
    const apiV1 = `https://kick.com/api/v1/channels/${slug}`;
    const wrap = (target: string) => (raw: any) =>
      typeof raw?.contents === 'string' ? JSON.parse(raw.contents) : raw;

    // Our own edge proxy goes first: no CORS, and it works in dev too. The
    // public proxies are the fallback for when that one is unavailable.
    const attempts: { url: string; unwrap: (raw: any) => any }[] = [
      { url: `/api/kick?endpoint=${encodeURIComponent(api)}`, unwrap: (r) => r },
      { url: `/api/kick?endpoint=${encodeURIComponent(apiV1)}`, unwrap: (r) => r },
      { url: `https://api.allorigins.win/get?url=${encodeURIComponent(api)}`, unwrap: wrap(api) },
      { url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(api)}`, unwrap: wrap(api) },
    ];

    try {
      const result = await Promise.any(
        attempts.map((a) => this.tryResolve(a.url, a.unwrap, slug))
      );
      this.KNOWN_CHATROOM_IDS[slug] = result;
      console.log(`[ChatService] ✅ Chatroom for ${slug}: ${result}`);
      return result;
    } catch (e) {
      console.warn(`[ChatService] All proxies failed for ${slug}.`, e);
      // Drop the cache so the next attempt starts clean, including any
      // entry left behind by an older build.
      this.purgeCache(slug);
      return null;
    }
  }

  private purgeCache(slug: string) {
    localStorage.removeItem(this.cacheKey(slug));
    for (const legacy of ['kick_chatroom_id_', 'kick_chatroom_id_v2_']) {
      localStorage.removeItem(`${legacy}${slug}`);
    }
  }

  private connectionId = 0;

  async connect(channelSlug: string = 'xtroet') {
    const slug = channelSlug.toLowerCase().trim();
    this.disconnect();
    const myConnectionId = this.connectionId;

    this.notifyStatus(false, false, `جاري البحث عن قناة ${slug}...`);

    try {
      let chatroomId = await this.getChatroomId(slug);

      // Check if this connection attempt is still valid
      if (this.connectionId !== myConnectionId) {
        console.warn(`[ChatService] Connection attempt ${myConnectionId} aborted (superseded).`);
        return;
      }

      // If xtroet look up fails, log it clearly. We stick to the requested channel to avoid confusion.

      if (!chatroomId) {
        console.error(`[ChatService] Could not find ID for ${slug}.`);
        throw new Error(`لم يتم العثور على القناة: ${slug}`);
      }

      console.log(`[ChatService] Connecting to Chatroom: ${chatroomId}`);

      // Initialize Pusher with a fresh instance
      const PusherClient = (Pusher as any).default || Pusher;
      this.pusher = new PusherClient('32cbd69e4b950bf97679', {
        cluster: 'us2',
        forceTLS: true,
        enabledTransports: ['ws', 'wss']
      });

      this.channel = this.pusher.subscribe(`chatrooms.${chatroomId}.v2`);

      // DEBUG: Listen to ALL events (Disabled for performance)
      // this.channel.bind_global((eventName: string, data: any) => {
      //   console.log(`[ChatService] GLOBAL EVENT: ${eventName}`, data);
      // });

      this.channel.bind('App\\Events\\ChatMessageEvent', (data: any) => {
        const message: ChatMessage = {
          id: data.id || Math.random().toString(36).substr(2, 9),
          user: {
            id: data.sender?.id || '0',
            username: data.sender?.username || 'Unknown',
            color: data.sender?.identity?.color || '#31d6d6',
            avatar: data.sender?.profile_pic || '',
          },
          content: data.content || '',
          role: getRoleFromIdentity(data.sender?.identity),
          timestamp: Date.now()
        };

        // Safety: ensure one listener failure doesn't stop others
        this.listeners.forEach(cb => {
          try {
            cb(message);
          } catch (e) {
            console.error("[ChatService] Listener error:", e);
          }
        });
      });

      this.channel.bind('App\\Events\\MessageDeletedEvent', (data: any) => {
        console.log("[ChatService] Message Deleted Received:", data);
        const messageId = data.message?.id;
        if (messageId) {
          this.deleteListeners.forEach(cb => cb(messageId));
        }
      });

      this.pusher.connection.bind('connected', () => {
        // Double check validity (though less likely to race here if pusher instance is exclusive)
        if (this.connectionId !== myConnectionId) return;

        console.log("[ChatService] WebSocket Connected!");
        this.isConnected = true;
        this.notifyStatus(true, false, `متصل (ID: ${chatroomId})`);
      });

      this.pusher.connection.bind('error', (err: any) => {
        if (this.connectionId !== myConnectionId) return;
        console.error("[ChatService] Pusher Error:", err);
        this.notifyStatus(false, true, "خطأ في الاتصال بسيرفر الشات");
      });

      this.pusher.connection.bind('state_change', (states: any) => {
        console.log("[ChatService] Connection State:", states.current);
      });

      // A bad chatroom id connects cleanly and then stays silent, so treat a
      // failed subscription as "that id was wrong" and resolve it once more.
      this.channel.bind('pusher:subscription_error', (err: any) => {
        if (this.connectionId !== myConnectionId) return;
        console.warn("[ChatService] Subscription error, re-resolving chatroom.", err);
        delete this.KNOWN_CHATROOM_IDS[slug];
        this.purgeCache(slug);
        this.disconnect();
        this.connect(slug);
      });

    } catch (error: any) {
      if (this.connectionId !== myConnectionId) return;
      console.error("[ChatService] Fatal Error:", error);
      this.notifyStatus(false, true, error.message);
    }
  }

  onMessage(callback: MessageCallback) {
    this.listeners.push(callback);
    return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
  }

  onDeleteMessage(callback: (id: string) => void) {
    this.deleteListeners.push(callback);
    return () => { this.deleteListeners = this.deleteListeners.filter(cb => cb !== callback); };
  }

  // Remove all listeners (useful when switching games)
  clearListeners() {
    this.listeners = [];
    this.deleteListeners = [];
  }

  onStatusChange(callback: StatusCallback) {
    this.statusListeners.push(callback);
    return () => { this.statusListeners = this.statusListeners.filter(cb => cb !== callback); };
  }

  private notifyStatus(connected: boolean, error: boolean, details: string) {
    this.statusListeners.forEach(cb => cb(connected, error, details));
  }

  async fetchKickAvatar(username: string): Promise<string> {
    try {
      const slug = username.toLowerCase().trim().replace('@', '');

      // Proxies list in order of reliability
      const proxies = [
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://kick.com/api/v2/channels/${slug}`)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${slug}`)}`
      ];

      try {
        const result = await Promise.any(
          proxies.map(async (proxyUrl) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            const response = await fetch(proxyUrl, { cache: 'no-store', signal: controller.signal });
            if (!response.ok) {
              clearTimeout(timeoutId);
              throw new Error(`Failed with status ${response.status}`);
            }

            const rawData = await response.json();
            clearTimeout(timeoutId);
            let data: any;

            if (proxyUrl.includes('allorigins')) {
              if (!rawData.contents) throw new Error("No contents");
              data = JSON.parse(rawData.contents);
            } else {
              data = rawData;
            }

            // Check all possible locations for avatar in Kick API v2
            const avatar = data.user?.profile_pic || data.profile_pic || data.user?.profilepic || '';

            if (avatar && avatar.includes('http')) {
              console.log(`[ChatService] Successfully fetched avatar for ${slug}`);
              return avatar;
            }
            throw new Error("No avatar found");
          })
        );
        if (result) return result;
      } catch (e) {
        // All proxies failed
      }
    } catch (e) {
      console.error(`[ChatService] Fatal error fetching avatar for ${username}`, e);
    }
    return '';
  }

  disconnect() {
    this.connectionId++; // Invalidate pending connections
    if (this.channel) {
      this.channel.unbind_all();
      this.channel.unsubscribe();
      this.channel = null;
    }
    if (this.pusher) {
      this.pusher.unbind_all();
      this.pusher.disconnect();
      this.pusher = null;
    }
    this.isConnected = false;
  }
}

export const chatService = new ChatService();
