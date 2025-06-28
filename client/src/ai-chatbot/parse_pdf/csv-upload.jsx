"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function FinancialUpload({ onDataUploaded, financialText }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState("")
  const fileInputRef = useRef(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")
    setFileName(file.name)
    setUploadProgress("Starting upload...")

    try {
      let text = ""

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        // Handle text files
        setUploadProgress("Reading text file...")
        text = await file.text()
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // Handle PDF files with improved error handling
        setUploadProgress("Processing PDF file...")

        try {
          const formData = new FormData()
          formData.append("file", file)

          setUploadProgress("Extracting text from PDF...")
          const response = await fetch("/api/parse-pdf", {
            method: "POST",
            body: formData,
          })

          console.log("PDF API Response status:", response.status)
          console.log("PDF API Response headers:", response.headers.get("content-type"))

          // Check if response is JSON
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            // If not JSON, get text to see the actual error
            const errorText = await response.text()
            console.error("Non-JSON response:", errorText)
            throw new Error("Server returned an unexpected response. Please try again or use a text file.")
          }

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || `Server error: ${response.status}`)
          }

          if (!result.success) {
            throw new Error(result.error || "PDF processing failed")
          }

          text = result.text

          if (result.extractedPages < result.pages) {
            setUploadProgress(
              `Extracted text from ${result.extractedPages} of ${result.pages} pages (limited for performance)`,
            )
          } else {
            setUploadProgress(`Successfully processed all ${result.pages} pages`)
          }
        } catch (error) {
          console.error("PDF parsing error:", error)

          // Provide user-friendly error messages
          let userMessage = error.message

          if (error.message.includes("Failed to fetch")) {
            userMessage = "Network error. Please check your connection and try again."
          } else if (error.message.includes("timeout")) {
            userMessage = "PDF processing timed out. Please try a smaller file or convert to text."
          } else if (error.message.includes("Server returned an unexpected response")) {
            userMessage = "Server error occurred. Please try again or upload a text file instead."
          }

          throw new Error(userMessage)
        }
      } else {
        throw new Error("Please upload a .txt or .pdf file containing your financial information.")
      }

      setUploadProgress("Validating content...")

      if (!text || text.trim().length === 0) {
        throw new Error("The file appears to be empty or unreadable.")
      }

      if (text.length < 50) {
        throw new Error("The file seems too short to contain meaningful financial data.")
      }

      setUploadProgress("Processing complete!")
      onDataUploaded(text)
      setUploadStatus("success")

      console.log("Uploaded financial text length:", text.length)
      console.log("First 200 characters:", text.substring(0, 200))
    } catch (error) {
      console.error("File upload error:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to process file")
      setUploadProgress("")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Clear progress after a delay
      setTimeout(() => setUploadProgress(""), 3000)
    }
  }

  const downloadSampleTxt = () => {
    const sampleData = `My Financial Information - January 2024

INCOME:
- Salary: $4,500 (monthly)
- Freelance work: $800
- Investment dividends: $150
Total Monthly Income: $5,450

EXPENSES:
Housing:
- Rent: $1,200
- Utilities (electric, water, internet): $180
- Renters insurance: $25

Food & Dining:
- Groceries: $400
- Restaurants: $250
- Coffee shops: $80

Transportation:
- Car payment: $320
- Gas: $120
- Car insurance: $85
- Parking: $40

Entertainment & Lifestyle:
- Netflix/Spotify subscriptions: $25
- Gym membership: $45
- Movies/entertainment: $100
- Shopping: $200

Healthcare:
- Health insurance: $150
- Doctor visits: $50
- Prescriptions: $30

Other:
- Phone bill: $60
- Emergency fund contribution: $500
- 401k contribution: $450

Total Monthly Expenses: $4,315
Net Income: $1,135

FINANCIAL GOALS:
- Build emergency fund to $10,000 (currently at $3,500)
- Save for vacation: $2,000
- Pay off credit card debt: $1,800 remaining

QUESTIONS/CONCERNS:
- Am I saving enough for retirement?
- Should I pay off credit card debt faster?
- How can I reduce my food expenses?
- Is my emergency fund adequate?`

    const blob = new Blob([sampleData], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample_financial_data.txt"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Financial Information Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!financialText ? (
          <div className="text-center py-6">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Upload your financial information text file (.txt) or PDF (.pdf) to get personalized advice
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upload TXT/PDF File"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={downloadSampleTxt}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                disabled={isUploading}
              >
                Download Sample TXT
              </Button>
            </div>

            {/* Upload Progress */}
            {isUploading && uploadProgress && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">{uploadProgress}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully loaded financial information from {fileName}. The AI can now provide personalized advice
                based on your data.
              </AlertDescription>
            </Alert>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {financialText.length} characters loaded from {fileName}
              </span>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                Upload New File
              </Button>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Upload Error:</strong> {errorMessage}
              <br />
              <span className="text-xs mt-1 block">
                💡 Tip: If you're having trouble with PDFs, try converting your document to a .txt file first.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Supported formats:</strong> .txt (text files) and .pdf (PDF documents with readable text)
          </p>
          <p>
            <strong>What to include:</strong> Income, expenses, financial goals, bank statements, budget information
          </p>
          <p>
            <strong>PDF Note:</strong> PDFs must contain readable text (not scanned images). Large PDFs are limited to
            first 10 pages for performance. Max file size: 10MB.
          </p>
          <p>
            <strong>Recommended:</strong> For best results, use .txt files or copy-paste your financial information.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
