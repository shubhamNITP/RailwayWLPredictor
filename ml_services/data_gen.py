# ml_service/data_gen.py
import pandas as pd
import random

n_samples = 1000

data = []

classes = ["Sleeper", "3A", "2A"]
quotas = ["GN", "Tatkal", "Ladies"]

for _ in range(n_samples):
    wl_position = random.randint(1, 100)
    days_left = random.randint(0, 30)
    class_type = random.choice(classes)
    quota = random.choice(quotas)

    # Simple rule to simulate confirmation
    # More days left and lower WL → higher chance of confirmation
    if wl_position <= 10 and days_left > 2:
        confirmed = 1
    elif wl_position <= 20 and days_left > 5:
        confirmed = 1
    else:
        confirmed = 0

    data.append([wl_position, days_left, class_type, quota, confirmed])

df = pd.DataFrame(data, columns=["wl_position", "days_left", "class_type", "quota", "confirmed"])
df.to_csv("wl_dataset.csv", index=False)
print("Dataset generated: wl_dataset.csv")
