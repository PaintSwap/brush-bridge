import React from 'react'
import styled from 'styled-components'
import { Button, ButtonProps, Tooltip, CircularProgress, Theme, Palette, PaletteColor } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Link from 'next/link'

export interface SuperButtonProps extends ButtonProps {
  href?: string // not needed if using onClick
  loading?: boolean // triggers the loading icon
  loadingPosition?: 'start' | 'end' | 'center' // loading icon position
  variant?: 'text' | 'outlined' | 'contained'
  width?: string
  height?: string
  externalLink?: boolean // forces <a> tag and target="_blank"
  rotate?: number // rotates the svg in degrees
  fullBelowBreakpoint?: string // forces the button to be full width below this breakpoint (see mediaQueries from breakpoints.ts)
  tooltip?: string
  tooltipPlacement?:
    | 'bottom'
    | 'left'
    | 'right'
    | 'top'
    | 'right-end'
    | 'right-start'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'top-end'
    | 'top-start'
  iconWidth?: string
  iconHeight?: string

  // Internal only
  children?: React.ReactNode
  to?: string
  target?: string
}

interface Props extends SuperButtonProps {
  muiTheme: Theme
  isDark: boolean
  containschildren: boolean
  ant: boolean
}

const StyledButton = styled(
  ({
    muiTheme,
    isDark,
    rotate,
    fullBelowBreakpoint,
    containschildren,
    iconWidth,
    iconHeight,
    tooltip,
    tooltipPlacement,
    loading,
    ant,
    ...rest
  }: Props) => (
    <Tooltip title={tooltip || ''} placement={tooltipPlacement}>
      <Button {...rest} />
    </Tooltip>
  ),
)`
  border-radius: 4px;
  text-transform: capitalize;
  pointer-events: auto !important;
  padding-left: 16px;
  padding-right: 16px;
  line-height: 1.1;
  min-width: 54px;
  ${({ size, ant }) => size === 'small' && ant && 'font-size: 0.7125rem;'}

  ${({ variant, isDark }) =>
    // Override the outline color
    variant === 'outlined' &&
    `
      border: ${isDark ? '1px solid rgb(109 162 243 / 50%)' : '2px solid rgb(24 59 110 / 50%)'};
  `}

  :hover {
    cursor: ${({ disabled }) => (disabled ? 'var(--cursor-not-allowed)' : 'var(--cursor-pointer)')};

    ${({ variant, isDark }) =>
      // Override the outline color
      variant === 'outlined' &&
      `
        border: ${isDark ? '1px solid #c0d6f7' : '2px solid #37474f'};
    `}
  }

  path {
    ${({ muiTheme, color, variant }) =>
      // Override the svg fill color for contained buttons (custom svgs)
      variant === 'contained' ? `fill: ${(muiTheme.palette[color as keyof Palette || 'primary'] as PaletteColor).contrastText};` : ''}
  }

  svg {
    transform: ${({ rotate }) => (rotate ? `rotate(${rotate}deg)` : 'none')};
    ${({ iconWidth }) =>
      // Override the svg height if provided
      iconWidth && `width: ${iconWidth};`}
    ${({ iconHeight }) =>
      // Override the svg height if provided
      iconHeight && `height: ${iconHeight};`}
  }

  ${({ height }) =>
    // Override the height if provided
    height && `height: ${height};`}

  ${({ fullBelowBreakpoint, width }) =>
    // Override the width if provided but make it full width below the breakpoint instead if provided
    fullBelowBreakpoint ? `width: 100%;` : width && `width: ${width};`}

  ${({ fullBelowBreakpoint }) =>
    // This acts like a breakpoint so this is above the breakpoint (override the above width with either provided width or auto)
    fullBelowBreakpoint} {
    ${({ width }) => (width ? `width: ${width};` : `width: fit-content;`)}
  }

  span {
    ${({ disabled, loading }) =>
      // Override the opacity of icons if the button is disabled but not loading
      disabled && !loading && `opacity: 0.5;`}
  }

  ${({ containschildren }) =>
    // Remove the margin for icon-only button (to allow smaller width)
    !containschildren &&
    `
      .MuiButton-startIcon {
        margin-right: 0;
        margin-left: 0;
      }
      .MuiButton-endIcon {
        margin-right: 0;
        margin-left: 0;
      }
      padding-left: 0;
      padding-right: 0;
    `}
`

export const StyledCircularProgress = styled(({ muiTheme, size, ...rest }: { muiTheme: Theme, size: string }) => <CircularProgress size={size} {...rest} />)`
  svg {
    color: ${({ muiTheme }) => muiTheme.palette.subtle.main};
  }
`

const SuperButton: React.FC<SuperButtonProps> = ({
  onClick = undefined,
  href,
  externalLink = undefined,
  variant = 'outlined',
  color = 'primary',
  size = 'large',
  startIcon = undefined,
  endIcon = undefined,
  disabled = false,
  tooltip = undefined,
  tooltipPlacement = 'right',
  loading = undefined,
  loadingPosition = 'start',
  height = undefined,
  children = undefined,
  ...rest
}) => {
  const muiTheme = useTheme()

  let h: string
  switch (size) {
    case 'small':
      h = height ?? '32px'
      break
    case 'medium':
      h = height ?? '40px'
      break
    case 'large':
      h = height ?? '48px'
      break
    default:
      h = height ?? '48px'
      break
  }

  const containsChildren = loading && loadingPosition === 'center' ? false : !!children

  const button = (
    <StyledButton
      size={size || 'large'}
      height={h}
      onClick={!disabled ? onClick : undefined}
      variant={variant}
      disabled={disabled}
      loading={loading}
      startIcon={
        loading && (loadingPosition === 'start' || loadingPosition === 'center') ? (
          <StyledCircularProgress size="1rem" muiTheme={muiTheme} />
        ) : (
          startIcon
        )
      }
      endIcon={
        loading && loadingPosition === 'end' ? <StyledCircularProgress size="1rem" muiTheme={muiTheme} /> : endIcon
      }
      href={!disabled ? href : undefined}
      LinkComponent={externalLink ? 'a' : Link}
      to={!disabled ? href : undefined}
      target={externalLink ? '_blank' : undefined}
      color={color}
      // Custom DOM props that did not come from the parent
      containschildren={containsChildren}
      muiTheme={muiTheme}
      isDark={true}
      tooltip={tooltip}
      tooltipPlacement={tooltipPlacement}
      ant={false}
      component={disabled ? 'div' : undefined} // To avoid console errors when using tooltip with disabled button
      focusRipple // Set to false to disable the ripple effect on focus
      {...rest}
    >
      {loading && loadingPosition === 'center' ? undefined : children}
    </StyledButton>
  )

  /* Button needs to be wrapped in a <span> for the tooltip to work when the button is disabled, or no events will be fired
    Or at least the console warning says that but actually works anyway due to the "pointer-events: auto !important;" above
    Allowing both ...props and width/height to be passed in allows us to use the component as a styled component as well as just sending width as a parameter
    Disabling for now due to being annoying to style
    <span {...props} style={{ width, height }} className="textButton">
      {button}
    </span>
  */
  return button
}

export default SuperButton
