import React from 'react'

/**
 * 消息提示栏组件
 */
const MessageBar = ({ message }) => {
  if (!message.text) return null

  const getMessageStyle = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className={`p-4 border rounded-lg mb-4 ${getMessageStyle()}`}>
      {message.text}
    </div>
  )
}

export default MessageBar 