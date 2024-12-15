import { FormInputProps } from '@/Components/FormInputProps'
import GameInput from '@/Components/GameInput'
import React from 'react'
import { Controller } from 'react-hook-form'

/** For more components: https://github.com/Mohammad-Faisal/react-hook-form-material-ui */

export const FormInputText = ({
  name,
  control,
  label,
  mode,
  min,
  max,
  placeholder,
  autoComplete,
  disabled,
  rules,
  multiline,
  disableReturn,
  disabledShift,
  hideHelperText,
  endAdornment,
  startAdornment,
  onEnter,
  onChangeInput,
}: FormInputProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChangeInput && onChangeInput(e)
          onChange(e)
        }
        return (
          <GameInput
            helperText={error?.type === 'totalNotExceed' ? null : hideHelperText ? null : error ? error.message : ' '}
            error={!!error}
            onChange={handleChange}
            value={value}
            fullWidth
            label={label}
            variant="outlined"
            mode={mode}
            min={min}
            max={max}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            multiline={multiline}
            disableReturn={disableReturn}
            disabledShift={disabledShift}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
            onEnter={onEnter}
          />
        )
      }}
    />
  )
}
