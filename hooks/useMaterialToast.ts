import { useContext } from 'react'
import { MaterialToastContext } from '@/contexts/MaterialToastContext'

const useMaterialToast = () => {
  const toastContext = useContext(MaterialToastContext)

  if (toastContext === undefined) {
    throw new Error('Toasts context undefined')
  }

  return toastContext
}

export default useMaterialToast
