import * as React from 'react'
import { createContext, ReactNode } from 'react'
import { AlertColor } from '@mui/material'

export interface SnackbarMessage {
  title: string
  message: string
  type: AlertColor
  key: number
  extraMessage?: string
}

export interface State {
  open: boolean
  snackPack: readonly SnackbarMessage[]
  messageInfo?: SnackbarMessage
}

export type ToastSignature = (message: string, title?: string, extraMessage?: string) => void

interface ContextProps {
  toastError: ToastSignature
  toastInfo: ToastSignature
  toastSuccess: ToastSignature
  toastWarning: ToastSignature
  messageInfo: SnackbarMessage
  open: boolean
  handleClose: (event: React.SyntheticEvent | Event, reason?: string) => void
  handleExited: () => void
}

export const MaterialToastContext = createContext<ContextProps | null>(null)

interface Props {
  children: ReactNode
}

export const MaterialToastsProvider: React.FC<Props> = ({ children }) => {
  const [snackPack, setSnackPack] = React.useState<SnackbarMessage[]>([])
  const [open, setOpen] = React.useState(false)
  const [messageInfo, setMessageInfo] = React.useState<SnackbarMessage | undefined>(undefined)

  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] })
      setSnackPack((prev) => prev.slice(1))
      setOpen(true)
    } else if (snackPack.length && messageInfo) {
      // Close an active snack when a new one is added, but only if the type is the same
      if (snackPack[0].type === messageInfo.type) {
        setOpen(false)
      }
      setMessageInfo(undefined)
    }
  }, [snackPack, messageInfo, open])

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
    setMessageInfo(undefined)
  }

  const handleExited = () => {
    setMessageInfo(undefined)
  }

  const toast = React.useCallback((message: string, title: string, type: AlertColor, extraMessage?: string) => {
    setSnackPack((prev) => [...prev, { message, title: title, type, key: new Date().getTime(), extraMessage }])
  }, [])

  const toastError = (message: string, title?: string, extraMessage?: string) => {
    toast(message, title ?? 'Error', 'error', extraMessage)
  }
  const toastInfo = (message: string, title?: string, extraMessage?: string) => {
    toast(message, title ?? 'Info', 'info', extraMessage)
  }
  const toastSuccess = (message: string, title?: string, extraMessage?: string) => {
    toast(message, title ?? 'Success', 'success', extraMessage)
  }
  const toastWarning = (message: string, title?: string, extraMessage?: string) => {
    toast(message, title ?? 'Warning', 'warning', extraMessage)
  }

  return (
    <MaterialToastContext.Provider
      value={{
        toastError,
        toastInfo,
        toastSuccess,
        toastWarning,
        messageInfo: messageInfo ?? { message: '', title: '', type: 'info', key: 0 },
        open,
        handleClose: handleClose,
        handleExited: handleExited,
      }}
    >
      {children}
    </MaterialToastContext.Provider>
  )
}
