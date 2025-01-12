import os
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
import pandas as pd

# Define the Dataset class
class CustomDataset(Dataset):
    def __init__(self, images_folder, transform=None):
        self.images_folder = images_folder
        self.transform = transform
        
        # Get the folder names and map them to class labels
        self.class_names = sorted(os.listdir(images_folder))  # Sort to ensure consistent class ordering
        self.class_to_idx = {folder_name: idx for idx, folder_name in enumerate(self.class_names)}

        print(f"Class names: {self.class_names}")  # Debug print
        
        # List all image paths and their corresponding labels
        self.image_paths = []
        self.labels = []

        for folder_name in self.class_names:
            folder_path = os.path.join(images_folder, folder_name)
            if os.path.isdir(folder_path):
                print(f"Processing folder: {folder_name}")  # Debug print
                for filename in os.listdir(folder_path):
                    if filename.endswith(".jpg") or filename.endswith(".png"):  # Adjust image formats if needed
                        image_path = os.path.join(folder_path, filename)
                        self.image_paths.append(image_path)
                        self.labels.append(self.class_to_idx[folder_name])

        print(f"Found {len(self.image_paths)} images.")  # Debug print

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        label = self.labels[idx]
        
        image = Image.open(image_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        return image, label

# Define transformations (normalization, resizing, etc.)
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Resize the image
    transforms.ToTensor(),          # Convert to tensor
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Normalize to ImageNet stats
])

# Paths
images_folder = 'train'  # Path to your images folder
classes_file = 'classes.txt'  # Path to your classes.txt file

# Initialize dataset and dataloader
dataset = CustomDataset(images_folder, transform=transform)
print("len(dataset)")
print(len(dataset))
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

# Define the model (e.g., a pre-trained ResNet)
model = models.resnet18(pretrained=True)
num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, len(dataset.class_names))  # Adjust final layer to match number of classes

# Move model to GPU if available
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)

# Loss and optimizer
criterion = torch.nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Training loop
num_epochs = 20
for epoch in range(num_epochs):
    model.train()  # Set the model to training mode
    running_loss = 0.0
    correct = 0
    total = 0
    
    for inputs, labels in dataloader:
        inputs, labels = inputs.to(device), labels.to(device)

        # Zero the parameter gradients
        optimizer.zero_grad()

        # Forward pass
        outputs = model(inputs)
        loss = criterion(outputs, labels)

        # Backward pass and optimization
        loss.backward()
        optimizer.step()

        # Calculate running loss and accuracy
        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()
    
    print(f"Epoch {epoch+1}/{num_epochs}, Loss: {running_loss/len(dataloader):.4f}, Accuracy: {100 * correct / total:.2f}%")

# Save the model
torch.save(model.state_dict(), 'model2.pth')

