import pandas as pd
import numpy as np
import random

np.random.seed(42)
random.seed(42)

n_samples = 5000
data = []

classes = ["Sleeper", "3A", "2A", "1A"]
quotas = ["GN", "Tatkal", "Ladies"]
seasons = ["Peak", "Off-peak"]
train_types = ["Rajdhani", "Shatabdi", "Superfast", "Express"]

# Max WL that can confirm per class (realistic limits)
max_wl_confirm = {"Sleeper": 100, "3A": 60, "2A": 30, "1A": 12}

# Quota multipliers (how much quota affects confirmation chance)
quota_multiplier = {"GN": 1.0, "Tatkal": 0.4, "Ladies": 0.85}

# Season effect
season_multiplier = {"Peak": 0.8, "Off-peak": 1.0}

# Train type effect
train_multiplier = {"Rajdhani": 0.9, "Shatabdi": 0.85, "Superfast": 1.0, "Express": 1.05}

for _ in range(n_samples):
    wl_position = random.randint(1, 60) # smaller waitlists are more realistic to monitor
    days_left = random.randint(0, 45)
    class_type = random.choice(classes)
    quota = random.choice(quotas)
    season = random.choice(seasons)
    train_type = random.choice(train_types)
    
    # Base probability from WL position relative to class capacity
    max_wl = max_wl_confirm[class_type]
    if wl_position <= max_wl:
        base_prob = 1.0 - (wl_position / max_wl) ** 0.45
    else:
        base_prob = max(0, 0.2 * (1 - (wl_position - max_wl) / 30))
    
    # Days left effect (more days = higher chance)
    if days_left >= 8:
        days_factor = 1.0
    elif days_left >= 3:
        days_factor = 0.7 + 0.3 * (days_left - 3) / 5
    elif days_left >= 1:
        days_factor = 0.4 + 0.3 * (days_left - 1) / 2
    else:
        days_factor = 0.15  # chart prepared, very low chance
    
    # Combine all factors
    final_prob = base_prob * days_factor * quota_multiplier[quota] * season_multiplier[season] * train_multiplier[train_type]
    final_prob = min(max(final_prob, 0), 1)
    
    # Add noise and determine outcome
    noise = np.random.normal(0, 0.05)
    confirmed = 1 if (final_prob + noise) > 0.3 else 0
    
    data.append([wl_position, days_left, class_type, quota, season, train_type, confirmed])

df = pd.DataFrame(data, columns=["wl_position", "days_left", "class_type", "quota", "season", "train_type", "confirmed"])
df.to_csv("wl_dataset.csv", index=False)
print(f"Dataset generated: {len(df)} samples")
print(f"Confirmed: {df['confirmed'].sum()} ({df['confirmed'].mean()*100:.1f}%)")
print(f"Not confirmed: {(1-df['confirmed']).sum()} ({(1-df['confirmed']).mean()*100:.1f}%)")
