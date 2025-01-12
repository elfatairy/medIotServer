import os
import re
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import models, transforms
from PIL import Image
import pandas as pd

# Get the folder names and map them to class labels
images_folder = 'train'  # Path to your images folder
class_names = sorted(os.listdir(images_folder))  # Sort to ensure consistent class ordering
classes_arr = [re.sub("[A-Za-z]*___", "", folder_name).replace("_", " ") for idx, folder_name in enumerate(class_names)]

print(classes_arr)
