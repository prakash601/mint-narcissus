import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GetStatusBadge from '@/components/shared/GetStatusBade';
import {
  fetchConversations,
  fetchConversationHistory,
  sendMessage,
  markConversationRead,
  addMessage,
} from '@/store/rentalSlice';
import useItemDetails from '@/hooks/useItemDetails';
import { getSocket, joinConversation, leaveConversation } from '@/lib/socket';
import { LuArrowLeft, LuInbox, LuMessageCircle, LuSend } from '@/utils/icons';

const POLL_INTERVAL_MS = 20000;

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

export default function Messages() {
  const dispatch = useDispatch();
  const { conversations, currentConversation } = useSelector((state) => state.rental);
  const myId = useSelector((state) => state.auth.user?.id);

  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const selectedRef = useRef(null);

  const messages = currentConversation?.messages || [];
  const request = currentConversation?.request;
  const conversation = currentConversation?.conversation;
  const isActiveChat = conversation ? conversation.isActive : false;

  const itemsById = useItemDetails(conversations.map((c) => c.request.itemId));
  const activeItem = selectedId != null ? itemsById[request?.itemId] : null;

  selectedRef.current = selectedId;

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Realtime: listen for new messages via Socket.io
  useEffect(() => {
    const socket = getSocket();
    const onNewMessage = (payload) => {
      if (payload.conversationId === selectedRef.current) {
        dispatch(addMessage(payload.message));
        dispatch(markConversationRead(payload.conversationId));
      }
      dispatch(fetchConversations());
    };
    socket.on('new_message', onNewMessage);
    return () => {
      socket.off('new_message', onNewMessage);
    };
  }, [dispatch]);

  // Join/leave the socket room for the open conversation + polling fallback
  useEffect(() => {
    if (selectedId == null) return undefined;

    let cancelled = false;
    joinConversation(selectedId);

    const poll = setInterval(() => {
      if (!cancelled) {
        dispatch(fetchConversationHistory(selectedId));
        dispatch(fetchConversations());
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
      leaveConversation(selectedId);
    };
  }, [selectedId, dispatch]);

  // Load history + mark read when selecting a conversation
  useEffect(() => {
    if (selectedId == null) return;
    dispatch(fetchConversationHistory(selectedId)).then(() => {
      dispatch(markConversationRead(selectedId));
    });
  }, [selectedId, dispatch]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || selectedId == null || sending) return;
    setSending(true);
    try {
      await dispatch(sendMessage({ id: selectedId, text })).unwrap();
      setDraft('');
      dispatch(fetchConversations());
    } catch {
      // error toast handled globally by logger; keep draft for retry
    } finally {
      setSending(false);
    }
  };

  const renderThread = () => {
    if (selectedId == null) {
      return (
        <div className='hidden md:flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground'>
          <LuMessageCircle className='size-10' />
          <p>Select a conversation to start chatting</p>
        </div>
      );
    }

    const iAmBorrower = request?.borrowerId === myId;
    const partnerRole = iAmBorrower ? 'Lender' : 'Borrower';

    return (
      <div className='flex-1 flex flex-col min-w-0 border rounded-lg bg-white dark:bg-card'>
        {/* Thread header */}
        <div className='flex items-center gap-3 p-4 border-b'>
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden'
            onClick={() => setSelectedId(null)}
            aria-label='Back to conversations'
          >
            <LuArrowLeft className='size-4' />
          </Button>
          {activeItem?.images?.[0] && (
            <img
              src={activeItem.images[0]}
              alt={activeItem.title || 'Outfit'}
              className='w-10 h-10 rounded-md object-cover'
            />
          )}
          <div className='flex-1 min-w-0'>
            <p className='font-serif font-semibold text-app-primary truncate'>
              {activeItem?.title || 'Outfit'}
            </p>
            <p className='text-xs text-muted-foreground'>Chat with {partnerRole}</p>
          </div>
          {request && <GetStatusBadge status={request.status} />}
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-3'>
          {messages.map((message) =>
            message.isSystemMessage ? (
              <div key={message.id} className='flex justify-center'>
                <span className='bg-muted text-muted-foreground text-xs rounded-full px-3 py-1 text-center max-w-[80%]'>
                  {message.messageText}
                </span>
              </div>
            ) : (
              <div
                key={message.id}
                className={`flex ${message.senderId === myId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    message.senderId === myId
                      ? 'bg-app-primary text-white rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  <p className='whitespace-pre-wrap break-words'>{message.messageText}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      message.senderId === myId ? 'text-white/70' : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ),
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className='flex items-center gap-2 p-3 border-t'>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              isActiveChat ? 'Type a message...' : 'This conversation is closed'
            }
            disabled={!isActiveChat || sending}
            className='flex-1'
          />
          <Button
            type='submit'
            size='icon'
            disabled={!isActiveChat || sending || !draft.trim()}
            aria-label='Send message'
          >
            <LuSend className='size-4' />
          </Button>
        </form>
      </div>
    );
  };

  return (
    <section className='grow container mx-auto px-4 py-8'>
      <div className='mb-6'>
        <h2 className='font-serif text-app-primary text-3xl font-bold'>Messages</h2>
        <p className='text-muted-foreground'>Coordinate with lenders and borrowers</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className='text-center py-16 text-muted-foreground space-y-3'>
            <LuInbox className='size-10 mx-auto' />
            <p>No conversations yet.</p>
            <p className='text-sm'>
              Chats open automatically once a borrow request is approved.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='flex flex-col md:flex-row gap-4 h-[65vh]'>
          {/* Conversation list */}
          <div
            className={`md:w-80 shrink-0 border rounded-lg overflow-y-auto ${
              selectedId != null ? 'hidden md:block' : 'block'
            }`}
          >
            {conversations.map(({ conversation, request: req }) => {
              const item = itemsById[req.itemId];
              const isSelected = conversation.id === selectedId;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left border-b transition-colors hover:bg-muted/60 ${
                    isSelected ? 'bg-app-primary/5' : ''
                  }`}
                >
                  {item?.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title || 'Outfit'}
                      className='w-12 h-12 rounded-md object-cover shrink-0'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-md bg-muted animate-pulse shrink-0' />
                  )}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='font-medium truncate'>
                        {item?.title || 'Outfit'}
                      </p>
                      {!conversation.isRead && (
                        <span
                          className='size-2 rounded-full bg-app-secondary shrink-0'
                          aria-label='Unread'
                        />
                      )}
                    </div>
                    <p className='text-xs text-muted-foreground truncate'>
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {renderThread()}
        </div>
      )}
    </section>
  );
}
