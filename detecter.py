from ultralytics import YOLO

# Load the trained model
model = YOLO("weights/best.pt", task="detect")

# Run detection on the test image
results = model.predict(
    source="test.jpeg",
    save=True,
    conf=0.25
)

print("✅ Detection complete!")

# Function to use later in the project
def detect(image_path):
    results = model.predict(source=image_path)

    detections = []

    for r in results:
        for box in r.boxes:
            detections.append({
                "class": int(box.cls),
                "confidence": float(box.conf),
                "bbox": box.xyxy.tolist()[0]
            })

    return detections