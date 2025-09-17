// import React, { useState } from "react"
// import axios from "axios"
// import "./ImageAnalysis.css" // Import the CSS file

// function ImageAnalysis() {
//   const [selectedImage, setSelectedImage] = useState(null)
//   const [analysisResult, setAnalysisResult] = useState(null)

//   const handleImageChange = event => {
//     if (event.target.files && event.target.files.length > 0) {
//       setSelectedImage(event.target.files[0])
//     }
//   }

//   const handleImageUpload = async () => {
//     if (!selectedImage) {
//       console.error("No image selected")
//       return
//     }

//     const formData = new FormData()
//     formData.append("image", selectedImage)

//     try {
//       const response = await axios.post("http://localhost:5000/image-analysis", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data"
//         }
//       })
//       setAnalysisResult(response.data)
//     } catch (error) {
//       console.error("Error analyzing image:", error)
//     }
//   }

//   return (
//     <div className="landing-container">
//       <div className="left-content">
//         <h1 style={{ color: "#1993d1" }}>Image Analysis</h1>
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//         <button className="button btn-1" onClick={handleImageUpload}>
//           Analyze Image
//         </button>
//         {analysisResult && (
//           <div className="analysis-result">
//             <h2>Analysis Result</h2>
//             <img src={`data:image/jpeg;base64,${analysisResult.result_image}`} alt="Result" />
//           </div>
//         )}
//       </div>
//       {analysisResult && (
//         <div className="right-content">
//           <h2>Analysis Details</h2>
//           <table className="analysis-table">
//             <thead>
//               <tr>
//                 <th>Box</th>
//                 <th>Confidence</th>
//                 <th>Label</th>
//               </tr>
//             </thead>
//             <tbody>
//               {analysisResult.detections.map((detection, index) => (
//                 <tr key={index}>
//                   <td>{detection.box.join(", ")}</td>
//                   <td>{detection.confidence}</td>
//                   <td>{detection.label}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }

// export default ImageAnalysis
import React, { useState } from "react"
import axios from "axios"
import "./ImageAnalysis.css" // Import the CSS file

function ImageAnalysis() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleImageChange = event => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedImage(event.target.files[0])
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImage) {
      console.error("No image selected")
      return
    }

    const formData = new FormData()
    formData.append("image", selectedImage)

    try {
      const response = await axios.post("http://localhost:5000/image-analysis", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      setAnalysisResult(response.data)
    } catch (error) {
      console.error("Error analyzing image:", error)
    }
  }

  return (
    <div className="analysis-container">
      <div className="left-content">
        <h1 className="analysis-heading">Image Analysis</h1>
        <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
        <button className="button" onClick={handleImageUpload}>
          Analyze Image
        </button>
        {analysisResult && (
          <div className="image-result">
            <h2>Analysis Result</h2>
            <img src={`data:image/jpeg;base64,${analysisResult.result_image}`} alt="Result" className="result-image" />
          </div>
        )}
      </div>
      {analysisResult && (
        <div className="right-content">
          <h2 className="details-heading">Analysis Details</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Box</th>
                <th>Confidence</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {analysisResult.detections.map((detection, index) => (
                <tr key={index}>
                  <td>{detection.box.join(", ")}</td>
                  <td>{detection.confidence}</td>
                  <td>{detection.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ImageAnalysis
