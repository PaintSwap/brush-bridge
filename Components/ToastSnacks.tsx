import React, { useState } from 'react'
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

const ExpandableLink = styled('button')`
  background: none;
  border: none;
  color: #90caf9;
  padding: 4px 0;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
  display: block;
  &:hover {
    filter: brightness(1.1);
  }
`

const ExtraContent = styled('div')`
  margin-top: 8px;
  font-size: 12px;
`

const AllowTextSelection = styled('div')`
  -webkit-user-select: text; /* Safari */
  -ms-user-select: text; /* IE 10 and IE 11 */
  user-select: text; /* Standard syntax */
`

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />
})

interface ToastContentProps {
  messageInfo: any
  onClose: (event: React.SyntheticEvent | Event, reason?: string) => void
}

const ToastContent = React.forwardRef<HTMLDivElement, ToastContentProps>(function ToastContent(props, ref) {
  const { messageInfo, onClose } = props
  const [showExtra, setShowExtra] = useState(false)

  return (
    <Alert ref={ref} onClose={onClose} severity={messageInfo?.type || 'success'} sx={{ width: '100%', zIndex: 10000 }}>
      <AllowTextSelection>
        {messageInfo?.title && <AlertTitle>{messageInfo?.title}</AlertTitle>}
        {messageInfo?.message}

        {messageInfo?.extraMessage && (
          <>
            <ExpandableLink onClick={() => setShowExtra(!showExtra)}>
              {showExtra ? 'Less Info' : 'More Info'}
            </ExpandableLink>

            {showExtra && <ExtraContent>{messageInfo.extraMessage}</ExtraContent>}
          </>
        )}
      </AllowTextSelection>
    </Alert>
  )
})

const ToastSnacks = () => {
  const toastContext = useMaterialToast()
  if (!toastContext) return null
  const { messageInfo, open, handleClose, handleExited } = toastContext

  return (
    <PSSnackbar
      key={messageInfo ? messageInfo.key : undefined}
      open={open}
      autoHideDuration={messageInfo?.extraMessage ? null : 5000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      // TransitionComponent={(props) => <Slide {...props} direction="down" />}
    >
      <ToastContent messageInfo={messageInfo} onClose={handleClose} />
    </PSSnackbar>
  )
}

export default ToastSnacks
