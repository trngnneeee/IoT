import torch
import torch.nn as nn

class CustomCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(CustomCNN, self).__init__()

        self.backbone = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1), #(B, 64, 224,224)
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), #(B, 64, 112, 112)

            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1), #(B, 128, 112, 112)
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), #(B, 128, 56, 56)

            nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1), #(B, 256, 56, 56)
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), #(B, 256, 28, 28)

            nn.Conv2d(256, 512, kernel_size=3, stride=1, padding=1), #(B, 512, 28, 28)
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2), #(B, 512, 14, 14)

            nn.Conv2d(512, 1024, kernel_size=3, stride=1, padding=1), #(B, 1024, 14, 14)
            nn.BatchNorm2d(1024),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))  # Đảm bảo đầu ra có shape (B, 1024, 1, 1)
        )

        self.classifier = nn.Sequential(
            nn.Flatten(),  # Chuyển (B, 1024, 1, 1) → (B, 1024)
            nn.Linear(1024, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),

            # nn.Linear(512, 256),
            # nn.BatchNorm1d(256),
            # nn.ReLU(inplace=True),
            # nn.Dropout(0.5),

            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),

            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),

            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        x = self.backbone(x)
        x = self.classifier(x)
        return x