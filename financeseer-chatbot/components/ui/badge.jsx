function Badge({ className, variant = "default", ...props }) {
  let badgeClasses = "badge"

  if (variant === "secondary") {
    badgeClasses += " badge-secondary"
  } else if (variant === "destructive") {
    badgeClasses += " badge-destructive"
  } else if (variant === "outline") {
    badgeClasses += " badge-outline"
  }

  if (className) {
    badgeClasses += ` ${className}`
  }

  return <div className={badgeClasses} {...props} />
}

export { Badge }
