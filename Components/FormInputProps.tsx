interface CheckBoxOptions {
  label: string
  value: string
}
export interface FormInputProps {
  name: string
  control: any
  label?: React.ReactNode
  setValue?: any
  mode?: 'text' | 'numeric'
  min?: number
  max?: number
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  required?: boolean
  rules?: any
  options?: CheckBoxOptions[]
  defaultOptions?: string[]
  multiline?: boolean
  disableReturn?: boolean // do not react to enter key
  disabledShift?: boolean // do not react to shift+enter key
  hideHelperText?: boolean
  ref?: any
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  onEnter?: () => void
  onChangeInput?: (e: React.ChangeEvent<HTMLInputElement>) => void
}
