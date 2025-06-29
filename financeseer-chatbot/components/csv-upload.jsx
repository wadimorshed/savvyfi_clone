"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Copy, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function FinancialUpload({ onDataUploaded, financialText, userId = "default@example.com" }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fileName, setFileName] = useState("")
  const [uploadProgress, setUploadProgress] = useState("")
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false)
  const fileInputRef = useRef(null)

  const saveToDatabase = async (filename, fileType, rawData, extractionMethod = "text") => {
    try {
      setIsSavingToDatabase(true)
      setUploadProgress("Parsing and saving to database...")

      const response = await fetch("/api/financial-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          filename,
          fileType,
          rawData,
          processedData: rawData,
          fileSize: rawData.length,
          extractionMethod,
          isIncremental: false, // This is a full upload, not incremental
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log("Data saved to database. Transactions saved:", result.transactionsSaved)
        if (result.duplicatesSkipped > 0) {
          setUploadProgress(
            `✅ Saved ${result.transactionsSaved} new transactions (${result.duplicatesSkipped} duplicates preserved)!`,
          )
        } else {
          setUploadProgress(`✅ Saved ${result.transactionsSaved} transactions to database!`)
        }
      } else {
        console.warn("Database save failed:", result.error)
        setUploadProgress("⚠️ Upload successful, database save failed")
      }
    } catch (error) {
      console.error("Database save error:", error)
      setUploadProgress("⚠️ Upload successful, database save failed")
    } finally {
      setIsSavingToDatabase(false)
    }
  }

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
      let extractionMethod = "text"

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        // Handle text files
        setUploadProgress("Reading text file...")
        text = await file.text()
        extractionMethod = "text"
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // Handle PDF files
        setUploadProgress("Processing PDF file...")
        extractionMethod = "pdf"

        try {
          const formData = new FormData()
          formData.append("file", file)

          setUploadProgress("Extracting text from PDF...")
          const response = await fetch("/api/parse-pdf", {
            method: "POST",
            body: formData,
          })

          console.log("PDF API Response status:", response.status)

          // Get response text first to handle both JSON and non-JSON responses
          const responseText = await response.text()
          console.log("PDF API Response text:", responseText)

          // Try to parse as JSON
          let result
          try {
            result = JSON.parse(responseText)
          } catch (parseError) {
            console.error("Failed to parse response as JSON:", parseError)
            throw new Error("PDF_PROCESSING_ERROR")
          }

          if (!response.ok) {
            throw new Error("PDF_PROCESSING_ERROR")
          }

          if (!result.success) {
            throw new Error("PDF_PROCESSING_ERROR")
          }

          text = result.text
          extractionMethod = result.extractionMethod || "pdf"
          setUploadProgress(`📄 Successfully processed ${result.pages} pages`)
        } catch (error) {
          console.error("PDF parsing error:", error)
          throw new Error("PDF_PROCESSING_ERROR")
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

      // Save to database
      await saveToDatabase(file.name, file.type, text, extractionMethod)

      setUploadProgress("Processing complete!")
      onDataUploaded(text)
      setUploadStatus("success")

      console.log("Uploaded financial text length:", text.length)
      console.log("First 200 characters:", text.substring(0, 200))
    } catch (error) {
      console.error("File upload error:", error)
      setUploadStatus("error")

      // Show simplified error message for PDF processing issues
      if (error.message === "PDF_PROCESSING_ERROR") {
        setErrorMessage(
          "The PDF could not be read. Please try converting to a text file (.txt) or copy and paste your data into a text file and resubmit.",
        )
      } else {
        setErrorMessage(error instanceof Error ? error.message : "Failed to process file")
      }

      setUploadProgress("")
    } finally {
      setIsUploading(false)
      setIsSavingToDatabase(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Clear progress after a delay
      setTimeout(() => setUploadProgress(""), 5000)
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

  const copyToClipboard = async () => {
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

    try {
      await navigator.clipboard.writeText(sampleData)
      alert("Sample data copied to clipboard! You can paste it into a text file.")
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      downloadSampleTxt()
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Financial Information Upload
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            Text Files Recommended
          </Badge>
          <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
            <Database className="w-3 h-3 mr-1" />
            Full Database
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!financialText ? (
          <div className="text-center py-6">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Upload your financial information as a text file (.txt) or PDF (.pdf) to get personalized advice with full
              historical database tracking (preserves all previous data)
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
                    {isSavingToDatabase ? "Saving..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={downloadSampleTxt}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                disabled={isUploading}
              >
                Download Sample
              </Button>
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                disabled={isUploading}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Sample
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
                <div className="flex items-center justify-between">
                  <span>
                    Successfully loaded financial information from {fileName}. FinanceSeer can now provide personalized
                    educational insights based on your complete financial database with full historical data
                    preservation.
                  </span>
                </div>
              </AlertDescription>
            </Alert>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {financialText.length} characters loaded from {fileName}
                <span className="text-blue-600 ml-2">• Historical data preserved</span>
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
                💡 <strong>Recommended:</strong> Copy your financial information into a text file (.txt) for best
                results, or use the "Copy Sample" button above to see the format.
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
            <strong>✅ Recommended:</strong> .txt files (instant processing, 100% reliable)
          </p>
          <p>
            <strong>⚠️ Limited support:</strong> .pdf files (text-based PDFs only, may have issues)
          </p>
          <p>
            <strong>💾 Historical preservation:</strong> All uploads add to your database without overwriting previous
            data
          </p>
          <p>
            <strong>🔄 Duplicate protection:</strong> System automatically prevents duplicate transactions
          </p>
          <p>
            <strong>💡 Best approach:</strong> Copy your financial data into a text file or use the sample format above
          </p>
          <p>
            <strong>What to include:</strong> Income, expenses, financial goals, bank statements, budget information for
            FinanceSeer to analyze
          </p>
          <p>
            <strong>File limits:</strong> Max 10MB for PDFs, unlimited for text files
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
