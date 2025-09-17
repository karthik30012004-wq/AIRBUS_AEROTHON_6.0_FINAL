import React, { useState } from "react"
import axios from "axios"
import "./DamageDetection.css" // Import the CSS file

function DamageDetection() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [damageResult, setDamageResult] = useState(null)
  const [error, setError] = useState(null)

  const handleImageChange = event => {
    setSelectedImage(event.target.files[0])
  }

  const handleImageUpload = async () => {
    const formData = new FormData()
    formData.append("image", selectedImage)

    try {
      const response = await axios.post("http://localhost:5000/detect_and_recommend", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      setDamageResult(response.data)
    } catch (error) {
      console.error("Error detecting damage:", error)
      setError("An error occurred while processing the image.")
    }
  }

  return (
    <div className="Damage-container">
      <div className="left-content">
        <h2 className="analysis-heading">Damage Detection</h2>
        <p>
          <strong>Choose an image</strong>
        </p>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button className="button btn-1" onClick={handleImageUpload}>
          Detect Damage
        </button>
        {error && <p className="error-message">Error: {error}</p>}
        {damageResult && (
          <div className="analysis-result">
            <h3>Cracks and Dents Detection and Repair Recommendations</h3>
            {damageResult.damage_details && damageResult.damage_details.length > 0 && (
              <div>
                <h3>Detections</h3>
                <p>Detections:</p>
                <ul>
                  {damageResult.damage_details.map((damage, index) => (
                    <li key={index}>
                      Damage {index + 1}: Location = ({damage.location.join(", ")}), Severity = {damage.severity.toFixed(2)}, Type = {damage.type}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {damageResult.repair_recommendations && damageResult.repair_recommendations.length > 0 && (
              <>
                <p>
                  <strong>Repair Recommendations:</strong>
                </p>
                <ul>
                  {damageResult.repair_recommendations.map((recommendation, index) => (
                    <li key={index}>
                      Damage {index + 1}: {recommendation.action} - {recommendation.details}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {damageResult.image && (
              <div>
                <h3>Result Image</h3>
                <img src={`data:image/jpeg;base64,${damageResult.image}`} alt="Result" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DamageDetection
