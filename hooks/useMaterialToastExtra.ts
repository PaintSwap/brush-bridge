import { useContext } from 'react'
import { MaterialToastContextExtra } from '@/contexts/MaterialToastContextExtra'

const useMaterialToastExtra = () => {
  const toastContext = useContext(MaterialToastContextExtra)

  if (toastContext === undefined) {
    throw new Error('Toasts context undefined')
  }

  return toastContext
}

export default useMaterialToastExtra
