import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { chatApi } from '@/services/api';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChatRoom, ChatMessage } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, User as UserIcon, Loader2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const InboxPage = () => {
  const { user: admin } = useAuth();
  const { socket, connected } = useSocket();
  const queryClient = useQueryClient();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Chat Rooms
  const { data: rooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms(),
    refetchInterval: 30000,
  });

  // 2. Fetch Messages for selected room
  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['chat-messages', selectedRoomId],
    queryFn: () => selectedRoomId ? chatApi.getMessages(selectedRoomId) : Promise.resolve([] as ChatMessage[]),
    enabled: !!selectedRoomId,
  });

  // 3. Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (roomId: string) => chatApi.markAsRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle joining room when selected
  useEffect(() => {
    if (socket && selectedRoomId) {
      socket.emit('join_room', selectedRoomId);
      markAsReadMutation.mutate(selectedRoomId);
    }
  }, [selectedRoomId, socket]);

  // Real-time message receiver
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: ChatMessage) => {
      // If message is for the currently open room, update it
      if (newMessage.room === selectedRoomId) {
        queryClient.setQueryData(['chat-messages', selectedRoomId], (old: ChatMessage[] | undefined) => {
          if (!old) return [newMessage];
          // Prevent duplicates if backend and socket emit same message
          if (old.some(m => m._id === newMessage._id)) return old;
          return [...old, newMessage];
        });
      }
      
      // Update rooms list to show last message
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    };

    const handleNotification = (data: { roomId: string; text: string }) => {
        // Notification logic if needed (e.g. snackbar)
        if (data.roomId !== selectedRoomId) {
            queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
        }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('admin_receive_notification', handleNotification);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('admin_receive_notification', handleNotification);
    };
  }, [socket, selectedRoomId, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedRoomId || !admin || !socket) return;

    socket.emit('send_message', {
      roomId: selectedRoomId,
      senderId: admin._id,
      senderModel: 'Admin',
      text: messageText,
    });

    setMessageText('');
  };

  const selectedRoom = rooms?.find(r => r._id === selectedRoomId);

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Sidebar - Rooms List */}
        <div className="w-[350px] flex flex-col border-r bg-muted/30">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 h-10 bg-background" />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {loadingRooms ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rooms?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    No conversations found.
                </div>
            ) : (
              <div className="divide-y">
                {rooms?.map((room) => (
                  <button
                    key={room._id}
                    onClick={() => setSelectedRoomId(room._id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                      selectedRoomId === room._id && "bg-muted shadow-inner border-l-4 border-primary"
                    )}
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={room.user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {room.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-semibold truncate text-foreground">{room.user.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {room.updatedAt && format(new Date(room.updatedAt), 'HH:mm')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate italic">
                          {room.lastMessage || 'Start a conversation'}
                        </p>
                        {room.unreadCountAdmin > 0 && (
                          <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                            {room.unreadCountAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedRoomId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-card text-card-foreground">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={selectedRoom?.user.avatar || undefined} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedRoom?.user.name}</h3>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {loadingMessages ? (
                  <div className="flex justify-center p-8">
                     <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages?.map((msg, idx) => {
                      const isMe = msg.senderModel === 'Admin';
                      return (
                        <div
                          key={msg._id || idx}
                          className={cn(
                            "flex w-full",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl p-4 shadow-sm",
                              isMe 
                                ? "bg-primary text-primary-foreground rounded-tr-none" 
                                : "bg-muted text-muted-foreground rounded-tl-none border"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className={cn(
                                "text-[10px] mt-1 text-right opacity-70",
                                isMe ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                              {format(new Date(msg.createdAt), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 h-11"
                    disabled={!connected}
                  />
                  <Button type="submit" size="icon" className="h-11 w-11 rounded-full shadow-md hover:scale-105 transition-transform" disabled={!messageText.trim() || !connected}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                {!connected && (
                    <p className="text-[10px] text-red-500 mt-1 text-center font-medium animate-pulse">Disconnected from server. Trying to reconnect...</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 bg-muted/5">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                 <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Your Inbox</h3>
              <p className="max-w-xs text-center">Select a conversation from the left to start chatting with your customers.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default InboxPage;
