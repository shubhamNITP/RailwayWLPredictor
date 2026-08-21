import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report
import pickle
import os

# 1. Load dataset
df = pd.read_csv("wl_dataset.csv")
print(f"Dataset loaded: {len(df)} samples")
print(df.head())
print(f"\nClass distribution:")
print(df["confirmed"].value_counts())

# 2. Separate features and target
X = df[["wl_position", "days_left", "class_type", "quota", "season", "train_type"]]
y = df["confirmed"]

# 3. One-hot encode categorical columns
categorical_cols = ["class_type", "quota", "season", "train_type"]
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
X_encoded = encoder.fit_transform(X[categorical_cols])

# Combine with numerical columns
X_final = np.concatenate([X[["wl_position", "days_left"]].values, X_encoded], axis=1)

# Print feature names
feature_names = ["wl_position", "days_left"] + list(encoder.get_feature_names_out(categorical_cols))
print(f"\nFeature columns ({len(feature_names)}): {feature_names}")

# 4. Split dataset
X_train, X_test, y_train, y_test = train_test_split(X_final, y, test_size=0.2, random_state=42)

# 5. Train RandomForest model
model = RandomForestClassifier(n_estimators=200, random_state=42, max_depth=15, min_samples_split=5)
model.fit(X_train, y_train)

# 6. Evaluate
accuracy = model.score(X_test, y_test)
print(f"\nModel accuracy: {accuracy*100:.2f}%")
print(f"\nClassification Report:")
print(classification_report(y_test, model.predict(X_test)))

# 7. Cross-validation
cv_scores = cross_val_score(model, X_final, y, cv=5)
print(f"\nCross-validation scores: {cv_scores}")
print(f"Mean CV accuracy: {cv_scores.mean()*100:.2f}% (+/- {cv_scores.std()*200:.2f}%)")

# 8. Feature importances
print(f"\nFeature Importances:")
for name, importance in sorted(zip(feature_names, model.feature_importances_), key=lambda x: -x[1]):
    print(f"  {name}: {importance:.4f}")

# 9. Save model and encoder
os.makedirs("models", exist_ok=True)
with open("models/wl_model.pkl", "wb") as f:
    pickle.dump(model, f)
with open("models/encoder.pkl", "wb") as f:
    pickle.dump(encoder, f)

print("\nModel saved as models/wl_model.pkl")
print("Encoder saved as models/encoder.pkl")
