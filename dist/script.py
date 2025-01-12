import torch
from torchvision import models, transforms
from PIL import Image
import os
import argparse

# Define the transformation (same as during training)
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize the image
    transforms.ToTensor(),          # Convert to tensor
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Normalize to ImageNet stats
])

# Load the model architecture
model = models.resnet18(weights=None)  # We don't want pre-trained weights here
num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, 39)  # Adjust for the number of classes (change 3 to your number of classes)

# Load the saved model weights
model.load_state_dict(torch.load('dist/model2.pth', weights_only=True, map_location=torch.device('cpu')))
model.eval()  # Set the model to evaluation mode

def load_classes(file_path):
    class_names = []
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
        for line in lines:
            parts = line.strip().split(' ', 1)  # Split the line into ID and name
            if len(parts) == 2:
                class_name = parts[1]  # Get the name parttets
                class_names.append(class_name)
    
    return class_names

# Function to predict the class of an image
def predict_image(image_path):
    image = Image.open(image_path).convert('RGB')  # Open and convert the image to RGB
    image = transform(image)  # Apply the same transformations as during training
    image = image.unsqueeze(0)  # Add batch dimension (1, 3, 224, 224)
    
    # Move the image to the GPU if available
    device = torch.device('cpu')
    image = image.to(device)
    model.to(device)
    
    # Get the model's prediction
    with torch.no_grad():  # Disable gradient calculation for inference
        outputs = model(image)
    
    # Get the predicted class
    _, predicted_idx = torch.max(outputs, 1)
    
    # Map the predicted index to the class name
    predicted_class = predicted_idx.item()
    return predicted_class

def main():
    # Create argument parser
    parser = argparse.ArgumentParser(description="Process a given file or directory path.")
    
    # Add argument for the path
    parser.add_argument("path", type=str, help="The path to a file or directory.")
    
    # Parse the arguments
    args = parser.parse_args()
    
    # Get the path from arguments
    path = args.path
    
    # Check if the path exists
    if os.path.exists(path):
        if os.path.isfile(path):
            image_path = path
            class_names = ['Aphids', 'Apple scab', 'Apple Black rot', 'Apple Cedar apple rust', 'Apple healthy', 'Blueberry healthy', 'Cherry (including sour)Powdery mildew', 'Cherry (including sour) healthy', 'Corn (maize)Cercospora leaf spot Gray leaf spot', 'Corn (maize)Common rust', 'Corn (maize)Northern Leaf Blight', 'Corn (maize) healthy', 'Grape Black rot', 'Grape Esca (Black Measles)', 'Grape Leaf blight (Isariopsis Leaf Spot)', 'Grape healthy', 'Orange Haunglongbing (Citrus greening)', 'Peach Bacterial spot', 'Peach healthy', 'Pepper, Bacterial spot', 'Pepper, healthy', 'Potato Early blight', 'Potato Late blight', 'Potato healthy', 'Raspberry healthy', 'Soybean healthy', 'Squash Powdery mildew', 'Strawberry Leaf scorch', 'Strawberry healthy', 'Tomato Bacterial spot', 'Tomato Early blight', 'Tomato Late blight', 'Tomato Leaf Mold', 'Tomato Septoria leaf spot', 'Tomato Spider mites Two-spotted spider mite', 'Tomato Target Spot', 'Tomato Yellow Leaf Curl Virus', 'Tomato mosaic virus', 'Tomato healthy']
            predicted_class = predict_image(image_path)
            print(class_names[predicted_class], end="")
        else:
            print(f"The path '{path}' exists but is neither a file nor a directory.")
    else:
        print(f"The path '{path}' does not exist.")

if __name__ == "__main__":
    main()

