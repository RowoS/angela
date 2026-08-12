"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'

// Lightweight relative time helper
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const popoverRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <Button 
        variant="secondary" 
        size="icon" 
        className="bg-white relative" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {/* Animated Ping Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </Button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 flex flex-col max-h-125">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          {/* Feed */}
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <Info className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`flex flex-col gap-1 p-3 rounded-md transition-colors ${notif.is_read ? 'bg-white' : 'bg-blue-50/50'} hover:bg-gray-50 cursor-pointer`}
                    onClick={() => {
                        if (!notif.is_read) markAsRead(notif.id)
                        setIsOpen(false)
                        if (notif.entity_type === 'ticket') {
                          router.push(`/tickets/${notif.entity_id}`)
                        } else if (notif.entity_type === 'room_reservation') {
                          router.push('/rooms')
                        }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm font-medium ${notif.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
                            {notif.title}
                        </span>
                        {!notif.is_read && (
                            <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                    </div>
                    {notif.body && (
                        <p className="text-xs text-gray-600 line-clamp-2">{notif.body}</p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        {timeAgo(notif.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}