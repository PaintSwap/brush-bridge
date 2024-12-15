import React from 'react'
import { AlertTitle, Slide, Snackbar, styled } from '@mui/material'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import useMaterialToast from '@/hooks/useMaterialToast'
import { mediaQueries } from '@/config/constants'

const PSSnackbar = styled(Snackbar)`
  top: 80px;
  right: 12px;
  min-width: 200px;
  z-index: 10000;

  ${mediaQueries.sm} {
    max-width: 500px;
  }
`

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />
})

const ToastSnacks = () => {
  const toastContext = useMaterialToast()
  if (!toastContext) return null
  const { messageInfo, open, handleClose, handleExited } = toastContext

  return (
    <PSSnackbar
      key={messageInfo ? messageInfo.key : undefined}
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      // TransitionComponent={(props) => <Slide {...props} direction="down" />}
    >
      <Alert onClose={handleClose} severity={messageInfo?.type || 'success'} sx={{ width: '100%', zIndex: 10000 }}>
        {messageInfo?.title && <AlertTitle>{messageInfo?.title}</AlertTitle>}
        {messageInfo?.message}
      </Alert>
    </PSSnackbar>
  )
}

export default ToastSnacks
