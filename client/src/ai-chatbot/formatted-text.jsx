"use client"

export function FormattedText({ content }) {
  // Function to format text with simple, clean styling
  const formatText = (text) => {
    if (!text) return ""

    // Split text into lines for processing
    const lines = text.split("\n")
    const formattedLines = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle bold text within lines (**text**)
      if (line.includes("**")) {
        const parts = line.split(/(\*\*.*?\*\*)/)
        const formattedParts = parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <span key={index} className="font-bold text-blue-700 bg-blue-50 px-1 rounded">
                {part.replace(/^\*\*|\*\*$/g, "")}
              </span>
            )
          }
          return part
        })
        formattedLines.push(
          <div key={i} className="mb-2 leading-relaxed">
            {formattedParts}
          </div>,
        )
      }
      // Handle simple bullet points
      else if (line.match(/^[•·-]\s+/)) {
        const bulletText = line.replace(/^[•·-]\s+/, "")
        formattedLines.push(
          <div key={i} className="ml-3 mb-2 flex items-start">
            <span className="text-blue-500 mr-2 text-lg leading-none">•</span>
            <span className="leading-relaxed">{bulletText}</span>
          </div>,
        )
      }
      // Handle questions (lines ending with ?)
      else if (line.trim().endsWith("?")) {
        formattedLines.push(
          <div key={i} className="mb-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <span className="text-blue-800 font-medium">{line}</span>
          </div>,
        )
      }
      // Handle empty lines
      else if (line.trim() === "") {
        formattedLines.push(<div key={i} className="h-3"></div>)
      }
      // Handle regular text
      else if (line.trim() !== "") {
        formattedLines.push(
          <div key={i} className="mb-2 leading-relaxed">
            {line}
          </div>,
        )
      }
    }

    return formattedLines
  }

  return <div className="space-y-1">{formatText(content)}</div>
}
