"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Download, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ExportOptionsModal({
  isOpen,
  onClose,
  onDownload,
  onEmail,
  title,
  description,
  defaultEmail = "",
  isLoading = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null)
  const [email, setEmail] = useState(defaultEmail)
  const [message, setMessage] = useState("")
  const [emailStatus, setEmailStatus] = useState(null)

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setEmailStatus({ type: "error", message: "Please enter an email address" })
      return
    }

    try {
      setEmailStatus({ type: "loading", message: "Preparing email..." })

      // Generate the PDF and create mailto link
      const result = await onEmail(email, message)

      if (result.success) {
        setEmailStatus({ type: "success", message: "Email client opened! Please send the email from your email app." })

        // Close modal after success
        setTimeout(() => {
          onClose()
          setEmailStatus(null)
          setSelectedOption(null)
          setMessage("")
        }, 3000)
      }
    } catch (error) {
      setEmailStatus({ type: "error", message: error.message || "Failed to prepare email" })
    }
  }

  const handleDownload = () => {
    onDownload()
    onClose()
    setSelectedOption(null)
  }

  const resetModal = () => {
    setSelectedOption(null)
    setEmailStatus(null)
    setMessage("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!selectedOption && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-blue-50 border-blue-200 bg-transparent"
                onClick={() => setSelectedOption("email")}
                disabled={isLoading}
              >
                <Mail className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Email Report</span>
                <span className="text-xs text-gray-500">Opens email app</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-green-50 border-green-200 bg-transparent"
                onClick={handleDownload}
                disabled={isLoading}
              >
                <Download className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium">Download PDF</span>
                <span className="text-xs text-gray-500">Save to device</span>
              </Button>
            </div>
          </div>
        )}

        {selectedOption === "email" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailStatus?.type === "loading"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal note to include in the email..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                disabled={emailStatus?.type === "loading"}
              />
            </div>

            {emailStatus && (
              <Alert variant={emailStatus.type === "error" ? "destructive" : "default"}>
                {emailStatus.type === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
                {emailStatus.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                {emailStatus.type === "error" && <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{emailStatus.message}</AlertDescription>
              </Alert>
            )}

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> We'll open your default email app with the report attached and pre-filled
                content. You can review and send it from there.
              </p>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedOption(null)}
                disabled={emailStatus?.type === "loading"}
              >
                Back
              </Button>
              <Button
                onClick={handleEmailSubmit}
                disabled={emailStatus?.type === "loading" || !email.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {emailStatus?.type === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Open Email App
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!selectedOption && (
          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
