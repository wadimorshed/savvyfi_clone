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

    let extractedText = ""
    let pagesProcessed = 0

    try {
      // Use a simplified PDF text extraction approach
      const textResult = await extractTextFromPDF(arrayBuffer)
      extractedText = textResult.text
      pagesProcessed = textResult.pages
      console.log("PDF text extraction successful:", extractedText.length, "characters")
    } catch (error) {
      console.error("PDF processing error:", error)
      return Response.json(
        {
          error: `Failed to process PDF: ${error.message}. Please try converting to a text file.`,
          success: false,
        },
        { status: 400 },
      )
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      return Response.json(
        {
          error:
            "Could not extract readable text from PDF. The document might be a scanned image, password protected, or contain only non-text elements. Please try converting to a .txt file.",
          success: false,
        },
        { status: 400 },
      )
    }

    // Clean up the extracted text
    const cleanedText = cleanExtractedText(extractedText)

    console.log("PDF processing successful")
    console.log("Final text length:", cleanedText.length)
    console.log("First 200 characters:", cleanedText.substring(0, 200))

    return Response.json({
      text: cleanedText,
      pages: pagesProcessed,
      extractedPages: pagesProcessed,
      extractionMethod: "text",
      success: true,
    })
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

// Simplified PDF text extraction using browser-compatible approach
async function extractTextFromPDF(arrayBuffer) {
  try {
    // Use dynamic import to avoid server-side issues
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js")

    // Configure worker for browser environment
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
    } else {
      // For server-side, disable worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = null
    }

    const uint8Array = new Uint8Array(arrayBuffer)

    // Load the PDF document with minimal configuration
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      verbosity: 0,
      useSystemFonts: false,
      disableFontFace: true,
      isEvalSupported: false,
      isOffscreenCanvasSupported: false,
      maxImageSize: -1,
      cMapUrl: null,
      cMapPacked: false,
    })

    // Set a timeout for PDF loading
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("PDF loading timeout after 15 seconds")), 15000)
    })

    const pdf = await Promise.race([loadingTask.promise, timeoutPromise])
    const maxPages = Math.min(pdf.numPages, 5) // Limit to 5 pages for performance

    let fullText = ""

    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false,
        })

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

        // Also try to get annotations
        try {
          const annotations = await page.getAnnotations()
          for (const annotation of annotations) {
            if (annotation.contents) {
              fullText += annotation.contents + " "
            }
          }
        } catch (annotationError) {
          // Ignore annotation errors
        }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError.message)
        // Continue with other pages
      }
    }

    return {
      text: fullText,
      pages: maxPages,
    }
  } catch (error) {
    console.error("PDF text extraction error:", error)
    throw new Error(`PDF text extraction failed: ${error.message}`)
  }
}

// Text cleaning function
function cleanExtractedText(text) {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Remove excessive line breaks
    .replace(/[^\x20-\x7E\n\t]/g, "") // Remove non-printable characters except newlines and tabs
    .trim()
}
