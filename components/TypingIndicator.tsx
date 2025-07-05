'use client'

import React from 'react'

interface TypingIndicatorProps {
  isTyping: boolean
  username?: string
}

export default function TypingIndicator({ isTyping, username }: TypingIndicatorProps) {
  if (!isTyping) return null

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white text-gray-900 border border-gray-200 shadow-sm rounded-2xl px-4 py-3 max-w-xs">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500">
            {username ? `${username} está digitando...` : 'Digitando...'}
          </span>
        </div>
      </div>
    </div>
  )
} 