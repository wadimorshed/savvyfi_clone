"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Edit3, Save, RotateCcw, History, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DataUpdatePanel({ financialText, onDataUpdate, updateHistory, isVisible, onToggleVisibility }) {
  const [editedData, setEditedData] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showRawData, setShowRawData] = useState(false)

  const handleStartEdit = () => {
    setEditedData(financialText)
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    if (editedData.trim() && editedData !== financialText) {
      onDataUpdate(editedData, "Manual data edit")
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedData("")
    setIsEditing(false)
  }

  const handleRevertToOriginal = () => {
    // This would require storing the original data
    // For now, we'll just show a message
    alert("Feature coming soon: Revert to original uploaded data")
  }

  if (!isVisible) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <Button
            onClick={onToggleVisibility}
            variant="outline"
            className="w-full justify-between text-orange-700 border-orange-300 hover:bg-orange-100 bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>Data Management Panel</span>
              {updateHistory.length > 0 && (
                <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                  {updateHistory.length} updates
                </Badge>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-orange-800">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Data Management Panel
            {updateHistory.length > 0 && (
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                {updateHistory.length} updates
              </Badge>
            )}
          </div>
          <Button
            onClick={onToggleVisibility}
            variant="ghost"
            size="sm"
            className="text-orange-700 hover:bg-orange-100"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleStartEdit}
            disabled={isEditing}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100 bg-transparent"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Manual Edit
          </Button>

          <Button
            onClick={() => setShowRawData(!showRawData)}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            {showRawData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showRawData ? "Hide" : "View"} Raw Data
          </Button>

          <Button
            onClick={() => setShowHistory(!showHistory)}
            size="sm"
            variant="outline"
            className="text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <History className="w-4 h-4 mr-2" />
            Update History
          </Button>

          <Button
            onClick={handleRevertToOriginal}
            size="sm"
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-100 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Revert to Original
          </Button>
        </div>

        {/* Manual Edit Interface */}
        {isEditing && (
          <div className="space-y-3">
            <Alert>
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                Edit your financial data directly. Changes will be saved and used for future AI analysis.
              </AlertDescription>
            </Alert>

            <Textarea
              value={editedData}
              onChange={(e) => setEditedData(e.target.value)}
              placeholder="Edit your financial information..."
              className="min-h-[200px] font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancelEdit} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Raw Data View */}
        {showRawData && !isEditing && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-800">Current Financial Data:</h4>
            <div className="bg-white rounded-md p-3 border border-orange-200 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">{financialText}</pre>
            </div>
            <p className="text-xs text-orange-600">Data length: {financialText.length} characters</p>
          </div>
        )}

        {/* Update History */}
        {showHistory && updateHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-800">Recent Updates:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {updateHistory.map((update) => (
                <div key={update.id} className="bg-white rounded-md p-3 border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{update.description}</p>
                      <p className="text-xs text-gray-500">{update.timestamp}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(update.dataLength / 1000)}k chars
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && updateHistory.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-orange-600">No updates yet. Try asking the AI to modify your data!</p>
          </div>
        )}

        {/* Natural Language Update Examples */}
        <div className="bg-white rounded-md p-3 border border-orange-200">
          <h4 className="text-sm font-medium text-orange-800 mb-2">Natural Language Updates:</h4>
          <div className="text-xs text-orange-700 space-y-1">
            <p>• "Add $200 monthly gym membership to my expenses"</p>
            <p>• "Update my salary to $5500 per month"</p>
            <p>• "Remove Netflix subscription from my expenses"</p>
            <p>• "Add goal to save $5000 for vacation"</p>
            <p>• "Change my rent from $1200 to $1300"</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
