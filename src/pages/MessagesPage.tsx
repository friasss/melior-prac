import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchConversations, fetchConversationMessages, sendChatMessage, markConversationRead,
  type ConversationSummary, type ChatMessage,
} from '../services/api';

/* ── Helpers ── */
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `Hace ${days}d`;
  return new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
}

function fullTime(iso: string) {
  return new Date(iso).toLocaleString('es-DO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function Avatar({ name, url, size = 'md' }: { name: string; url?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return url ? (
    <img src={url} alt={name} className={`${cls} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-brand-600 font-bold text-white`}>
      {initials}
    </div>
  );
}

/* ── Conversation List Item ── */
function ConvItem({
  conv, isActive, currentUserId, onClick,
}: {
  conv: ConversationSummary;
  isActive: boolean;
  currentUserId: string;
  onClick: () => void;
}) {
  const isOwnLast = conv.lastMessage?.senderId === currentUserId;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        isActive
          ? 'bg-brand-50 dark:bg-brand-950/50'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      <div className="relative shrink-0">
        <Avatar name={`${conv.otherUser.firstName} ${conv.otherUser.lastName}`} url={conv.otherUser.avatarUrl} />
        {conv.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className={`truncate text-sm font-semibold ${conv.unreadCount > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
            {conv.otherUser.firstName} {conv.otherUser.lastName}
          </p>
          {conv.lastMessage && (
            <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(conv.lastMessage.createdAt)}</span>
          )}
        </div>
        {conv.property && (
          <p className="truncate text-[11px] text-brand-600 dark:text-brand-400">{conv.property.title}</p>
        )}
        {conv.lastMessage && (
          <p className={`truncate text-xs ${conv.unreadCount > 0 ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>
            {isOwnLast && <span className="mr-1 text-slate-400">Tú:</span>}
            {conv.lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}

/* ── Message Bubble ── */
function MessageBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar name={msg.senderName} url={msg.senderAvatar} size="sm" />
      )}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn
            ? 'rounded-tr-sm bg-brand-600 text-white'
            : 'rounded-tl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
        }`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-slate-400 px-1">{fullTime(msg.createdAt)}</span>
      </div>
    </div>
  );
}

/* ── Empty State ── */
function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-950">
        <span className="material-symbols-outlined text-4xl text-brand-600 dark:text-brand-400" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      </div>
      <div>
        <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">Selecciona una conversación</p>
        <p className="mt-1 text-sm text-slate-500">Elige una conversación de la lista para empezar a chatear.</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
const MessagesPage = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate            = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [conversations, setConversations]   = useState<ConversationSummary[]>([]);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [activeConv, setActiveConv]         = useState<ConversationSummary | null>(null);
  const [loadingList, setLoadingList]       = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [sendingMsg, setSendingMsg]         = useState(false);
  const [input, setInput]                   = useState('');
  const [error, setError]                   = useState('');
  const [msgError, setMsgError]             = useState('');
  const [search, setSearch]                 = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  /* ── Redirect if not authenticated ── */
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  /* ── Load conversation list ── */
  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch {
      setError('No se pudo cargar las conversaciones.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  /* ── Load messages for active conversation ── */
  const loadMessages = useCallback(async (convId: string, silent = false) => {
    if (!silent) { setLoadingMsgs(true); setMsgError(''); }
    try {
      const data = await fetchConversationMessages(convId);
      setMessages(data.messages ?? []);
      setActiveConv(data.conversation);
      // Update unread count in list
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
      );
      await markConversationRead(convId).catch(() => {});
    } catch (e) {
      if (!silent) setMsgError('No se pudieron cargar los mensajes.');
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      // Poll for new messages every 5 seconds
      pollRef.current = setInterval(() => loadMessages(conversationId, true), 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId, loadMessages]);

  /* ── Auto-scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ── */
  async function handleSend() {
    if (!conversationId || !input.trim() || sendingMsg) return;
    const content = input.trim();
    setInput('');
    setSendingMsg(true);
    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId,
      senderId: user!.id,
      senderName: `${user!.firstName} ${user!.lastName}`,
      senderAvatar: user!.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    try {
      const sent = await sendChatMessage(conversationId, content);
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sent : m));
      // Refresh conversation list to update last message
      loadConversations();
    } catch {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setInput(content);
    } finally {
      setSendingMsg(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function selectConversation(conv: ConversationSummary) {
    navigate(`/mensajes/${conv.id}`);
  }

  const filteredConvs = conversations.filter(c => {
    if (!c.otherUser) return false;
    const name = `${c.otherUser.firstName} ${c.otherUser.lastName}`.toLowerCase();
    const prop = c.property?.title?.toLowerCase() ?? '';
    const q = search.toLowerCase();
    return name.includes(q) || prop.includes(q);
  });

  const showList  = !conversationId || !isMobile;
  const showChat  = !!conversationId;
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  /* ─────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden pb-16 sm:pb-0">

      {/* ── LEFT: Conversation list ── */}
      {showList && (
        <div className={`flex flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-card-dark ${
          conversationId ? 'hidden md:flex md:w-80 lg:w-96' : 'w-full md:w-80 lg:w-96'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Mensajes</h1>
              {totalUnread > 0 && (
                <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">{totalUnread}</span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar conversación..."
                className="w-full rounded-xl bg-slate-100 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-300 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-12">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">wifi_off</span>
                <p className="mt-2 text-sm text-slate-500">{error}</p>
                <button onClick={loadConversations} className="mt-3 text-xs text-brand-600 hover:underline">Reintentar</button>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">forum</span>
                <p className="text-sm font-medium text-slate-500">
                  {search ? 'Sin resultados para tu búsqueda' : 'No tienes conversaciones aún'}
                </p>
                {!search && (
                  <p className="text-xs text-slate-400">
                    Las conversaciones aparecen aquí cuando contactas con un agente desde una propiedad.
                  </p>
                )}
              </div>
            ) : (
              filteredConvs.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === conversationId}
                  currentUserId={user?.id ?? ''}
                  onClick={() => selectConversation(conv)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── RIGHT: Chat view ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-surface-dark">
        {!conversationId ? (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <EmptyChat />
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-card-dark">
              {/* Back button (mobile) */}
              <button
                onClick={() => navigate('/mensajes')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              {activeConv && (
                <>
                  <Avatar
                    name={`${activeConv.otherUser.firstName} ${activeConv.otherUser.lastName}`}
                    url={activeConv.otherUser.avatarUrl}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {activeConv.otherUser.firstName} {activeConv.otherUser.lastName}
                    </p>
                    {activeConv.property && (
                      <Link
                        to={`/propiedad/${activeConv.property.id}`}
                        className="truncate text-xs text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {activeConv.property.title}
                      </Link>
                    )}
                  </div>
                  {activeConv.property && (
                    <Link
                      to={`/propiedad/${activeConv.property.id}`}
                      title="Ver propiedad"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                    >
                      <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMsgs ? (
                <div className="flex justify-center py-12">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              ) : msgError ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">wifi_off</span>
                  <p className="text-sm text-slate-500">{msgError}</p>
                  <button onClick={() => conversationId && loadMessages(conversationId)} className="text-xs text-brand-600 hover:underline">Reintentar</button>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">chat_bubble</span>
                  <p className="text-sm text-slate-500">No hay mensajes aún. ¡Sé el primero en escribir!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.senderId === user?.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-card-dark">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje... (Enter para enviar)"
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-600"
                  style={{ maxHeight: '120px', overflowY: 'auto' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendingMsg}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sendingMsg ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-center text-[11px] text-slate-400">Enter para enviar · Shift+Enter para nueva línea</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
