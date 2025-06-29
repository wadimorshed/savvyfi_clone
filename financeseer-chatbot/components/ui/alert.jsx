import * as React from "react"

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => {
  let alertClasses = "alert"

  if (variant === "destructive") {
    alertClasses += " alert-destructive"
  }

  if (className) {
    alertClasses += ` ${className}`
  }

  return <div ref={ref} role="alert" className={alertClasses} {...props} />
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`alert-description ${className || ""}`} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }
