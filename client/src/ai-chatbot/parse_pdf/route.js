// pdf parsing
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Processing PDF file:", file.name, "Size:", file.size)

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "PDF file is too large. Please use files smaller than 10MB." }, { status: 400 })
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return Response.json({ error: "File appears to be empty or corrupted" }, { status: 400 })
    }

    console.log("PDF buffer created, size:", arrayBuffer.byteLength)

    try {
      // Dynamic import to avoid build issues
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js")

      // Configure worker for server environment
      if (typeof window === "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
      }

      const uint8Array = new Uint8Array(arrayBuffer)

      // Load the PDF document with timeout
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true,
        verbosity: 0,
        maxImageSize: 1024 * 1024, // 1MB max per image
        isEvalSupported: false,
        isOffscreenCanvasSupported: false,
      })

      // Set a timeout for PDF loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("PDF loading timeout")), 30000) // 30 second timeout
      })

      const pdf = await Promise.race([loadingTask.promise, timeoutPromise])
      console.log("PDF loaded successfully, pages:", pdf.numPages)

      let fullText = ""
      const maxPages = Math.min(pdf.numPages, 10) // Limit to 10 pages for better performance

      // Extract text from each page
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()

          // Combine text items with proper spacing
          const pageText = textContent.items
            .map((item) => {
              if (item.str && item.str.trim()) {
                return item.str.trim()
              }
              return ""
            })
            .filter((text) => text.length > 0)
            .join(" ")

          if (pageText.trim()) {
            fullText += pageText + "\n\n"
          }

          console.log(`Page ${pageNum} processed, text length:`, pageText.length)
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError.message)
          // Continue with other pages
        }
      }

      // Clean up the extracted text
      fullText = fullText
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive line breaks
        .trim()

      console.log("Total extracted text length:", fullText.length)

      if (!fullText || fullText.length < 10) {
        return Response.json(
          {
            error:
              "Could not extract readable text from PDF. The PDF might contain only images, be password protected, or have complex formatting. Please try converting it to a text file.",
            success: false,
          },
          { status: 400 },
        )
      }

      console.log("PDF parsing successful")
      console.log("First 200 characters:", fullText.substring(0, 200))

      return Response.json({
        text: fullText,
        pages: pdf.numPages,
        extractedPages: maxPages,
        success: true,
      })
    } catch (pdfError) {
      console.error("PDF processing error:", pdfError)

      // Provide specific error messages based on the error type
      let errorMessage = "Failed to parse PDF. "

      if (pdfError.message.includes("Invalid PDF") || pdfError.message.includes("PDF header")) {
        errorMessage += "The file appears to be corrupted or not a valid PDF."
      } else if (pdfError.message.includes("password") || pdfError.message.includes("encrypted")) {
        errorMessage += "The PDF is password protected or encrypted."
      } else if (pdfError.message.includes("timeout")) {
        errorMessage += "The PDF is too complex or large to process. Please try a smaller file or convert to text."
      } else {
        errorMessage +=
          "Please ensure the PDF contains readable text and try converting it to a text file if issues persist."
      }

      return Response.json(
        {
          error: errorMessage,
          success: false,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("General PDF parsing error:", error)
    return Response.json(
      {
        error: "Failed to process the PDF file. Please try uploading a text file instead.",
        success: false,
      },
      { status: 500 },
    )
  }
}
