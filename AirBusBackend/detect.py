import os
import cv2
import base64
from ultralytics import YOLO
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Define the model path
model_path = os.path.join(os.path.dirname(__file__), 'modelfiles', 'best.pt')

# Load the YOLO model
model = YOLO(model_path)  # Path to your trained model

@app.route('/image-analysis', methods=['POST'])
def detect_damage():
    if 'image' not in request.files:
        logging.error("No image provided in the request.")
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    try:
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    except Exception as e:
        logging.error(f"Error decoding image: {e}")
        return jsonify({"error": "Error decoding image"}), 400

    try:
        # Perform inference
        results = model(img, conf=0.1, imgsz=1280)
    except Exception as e:
        logging.error(f"Error during model inference: {e}")
        return jsonify({"error": "Error during model inference"}), 500

    # Get class labels from the model metadata
    labels = model.module.names if hasattr(model, 'module') else model.names

    # Extract bounding box information and annotate image
    detections = []
    try:
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                conf = box.conf[0].cpu().item()
                cls = int(box.cls[0].cpu().item())

                # Get the label corresponding to the class index
                label = labels[cls]
                detections.append({
                    "label": label,
                    "confidence": conf,
                    "box": [x1, y1, x2, y2]
                })

                # Draw bounding box on the image
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(img, f'{label} {conf:.2f}', (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        # Encode the image as base64 string
        _, img_encoded = cv2.imencode('.jpg', img)
        img_base64 = base64.b64encode(img_encoded).decode('utf-8')
    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return jsonify({"error": "Error processing image"}), 500

    return jsonify({"detections": detections, "result_image": img_base64})

# Function to identify cracks and dents in an aircraft surface image
def identify_cracks_and_dents(image, threshold_area=100):
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply Canny edge detection
    edges = cv2.Canny(blurred, 50, 150)
    
    # Find contours in the edge-detected image
    contours, _ = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Initialize lists to store locations and severities of damage
    damage_details = []
    
    # Iterate over contours to identify cracks and dents
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > threshold_area:  # You may need to adjust the threshold based on your dataset
            # Calculate centroid of the contour
            M = cv2.moments(contour)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"])
                cY = int(M["m01"] / M["m00"])
            else:
                cX, cY = 0, 0
            
            # Estimate severity based on contour area
            severity = area / 100  # Adjust the divisor as needed
            
            # Determine type of damage based on shape analysis (simplified for this example)
            damage_type = "crack" if len(contour) > 10 else "dent"
            
            # Get the bounding box of the contour
            x, y, w, h = cv2.boundingRect(contour)
            
            # Draw a rectangle and label the contour with location and severity
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(image, f"Location: ({cX}, {cY})", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            cv2.putText(image, f"Severity: {severity:.2f}", (x, y - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            # Store location and severity of damage
            damage_details.append({
                "location": (cX, cY),
                "severity": severity,
                "type": damage_type,
                "bounding_box": (x, y, w, h)
            })
    
    return image, damage_details

# Function to provide detailed repair recommendations
def get_repair_recommendations(damage_details):
    recommendations = []
    for damage in damage_details:
        severity = damage["severity"]
        damage_type = damage["type"]
        recommendation = {
            "location": damage["location"],
            "type": damage_type,
            "severity": severity,
            "action": "",
            "details": ""
        }
        if severity >= 8.0:
            recommendation["action"] = "Immediate repair required"
            recommendation["details"] = f"Severe {damage_type} detected. Immediate action is necessary to prevent further damage."
        elif severity >= 5.0:
            recommendation["action"] = "Schedule repair within a month"
            recommendation["details"] = f"Moderate {damage_type} detected. Repair should be scheduled within a month to maintain safety and integrity."
        else:
            recommendation["action"] = "Monitor for further damage"
            recommendation["details"] = f"Minor {damage_type} detected. Regular monitoring is recommended to ensure it does not worsen."
        recommendations.append(recommendation)
    return recommendations

# Endpoint for damage detection and repair recommendations
@app.route('/detect_and_recommend', methods=['POST'])
def detect_and_recommend():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    try:
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    except Exception as e:
        return jsonify({"error": "Error decoding image"}), 400

    # Identify cracks and dents in the image
    identified_image, damage_details = identify_cracks_and_dents(img.copy())

    # Convert the identified image to base64 for sending in the response
    _, img_encoded = cv2.imencode('.jpg', identified_image)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    # Get repair recommendations
    repair_recommendations = get_repair_recommendations(damage_details)

    # Prepare response data
    response_data = {
        "image": img_base64,
        "damage_details": damage_details,
        "repair_recommendations": repair_recommendations
    }

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)