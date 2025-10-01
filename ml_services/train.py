# ml_service/train.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
import pickle

# 1️⃣ Load dataset
df = pd.read_csv("wl_dataset.csv")
print("Dataset loaded:")
print(df.head())

# 2️⃣ Separate features and target
X = df[["wl_position", "days_left", "class_type", "quota"]]
y = df["confirmed"]  # target: 1 = confirmed, 0 = not confirmed

# 3️⃣ One-hot encode categorical columns (class_type, quota)
encoder = OneHotEncoder(sparse_output=False)
X_encoded = encoder.fit_transform(X[["class_type", "quota"]])


# Combine with numerical columns
import numpy as np
X_final = np.concatenate([X[["wl_position", "days_left"]].values, X_encoded], axis=1)

# Save the encoder columns for later use in prediction
feature_columns = encoder.get_feature_names_out(["class_type", "quota"])
np.save("feature_columns.npy", feature_columns)

# 4️⃣ Split dataset into train and test
X_train, X_test, y_train, y_test = train_test_split(X_final, y, test_size=0.2, random_state=42)

# 5️⃣ Train RandomForest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 6️⃣ Evaluate model
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy*100:.2f}%")

# 7️⃣ Save model
with open("wl_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved as wl_model.pkl")
