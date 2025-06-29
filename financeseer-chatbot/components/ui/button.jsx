import * as React from "react"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  let buttonClasses = "button"

  // Add variant classes
  if (variant === "outline") {
    buttonClasses += " button-outline"
  } else if (variant === "ghost") {
    buttonClasses += " button-ghost"
  } else {
    buttonClasses += " button-primary"
  }

  // Add size classes
  if (size === "sm") {
    buttonClasses += " button-sm"
  } else if (size === "lg") {
    buttonClasses += " button-lg"
  }

  if (className) {
    buttonClasses += ` ${className}`
  }

  return <button className={buttonClasses} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button }
