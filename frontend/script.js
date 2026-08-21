const BACKEND_URL = "http://localhost:4000";
let currentPage = 1;
const limit = 10;
let totalPages = 1;

// Show Toast Notification
function showToast(message, type = "error") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${type === "success" ? "✅" : "⚠️"}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add("removing");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}

// Predict Waitlist Confirmation Probability
async function predictWL() {
    const wl_position = document.getElementById("wl_position").value;
    const days_left = document.getElementById("days_left").value;
    const class_type = document.getElementById("class_type").value;
    const quota = document.getElementById("quota").value;
    const season = document.getElementById("season").value;
    const train_type = document.getElementById("train_type").value;

    if (!wl_position || !days_left) {
        showToast("Please enter WL position and Days Left!");
        return;
    }

    const payload = {
        wl_position: Number(wl_position),
        days_left: Number(days_left),
        class_type,
        quota,
        season,
        train_type
    };

    const predictBtn = document.getElementById("predict-btn");
    predictBtn.classList.add("loading");
    predictBtn.disabled = true;

    try {
        const response = await fetch(`${BACKEND_URL}/api/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || (data.errors ? data.errors.join(", ") : "Prediction failed"));
        }

        const probability = data.probability;
        displayResult(probability);
        showToast("Prediction completed successfully!", "success");

        // Refresh history table
        currentPage = 1;
        fetchHistory();

    } catch (err) {
        console.error(err);
        showToast(err.message || "Error connecting to backend");
    } finally {
        predictBtn.classList.remove("loading");
        predictBtn.disabled = false;
    }
}

// Display Prediction Result in Gauge
function displayResult(probability) {
    const placeholder = document.getElementById("result-placeholder");
    const container = document.getElementById("gauge-container");
    const fill = document.getElementById("gauge-fill");
    const valueEl = document.getElementById("gauge-value");
    const label = document.getElementById("gauge-label");
    const tip = document.getElementById("gauge-tip");

    placeholder.style.display = "none";
    container.classList.add("visible");

    // Percentage conversion
    const percentage = Math.round(probability * 100);
    valueEl.innerHTML = `${percentage}<span class="percent">%</span>`;

    // Circular SVG Dash Offset (radius is 90, circumference is 2 * PI * 90 = 565.48)
    const circumference = 565.48;
    const offset = circumference - (probability * circumference);
    fill.style.strokeDashoffset = offset;

    // Set gauge styling & text color depending on probability
    let color = "";
    let statusText = "";
    let tipText = "";

    if (probability >= 0.75) {
        color = "var(--accent-emerald)";
        statusText = "High Chance of Confirmation";
        tipText = "Excellent probability! This waitlist ticket is highly likely to be confirmed. Safe to book.";
        label.className = "gauge-label high";
    } else if (probability >= 0.4) {
        color = "var(--accent-amber)";
        statusText = "Moderate Chance of Confirmation";
        tipText = "Moderate probability. Depending on cancellations, this has a decent chance of moving. Keep a backup option.";
        label.className = "gauge-label medium";
    } else {
        color = "var(--accent-rose)";
        statusText = "Low Chance of Confirmation";
        tipText = "Low probability. This waitlist ticket is unlikely to confirm. We strongly advise looking for alternatives.";
        label.className = "gauge-label low";
    }

    document.documentElement.style.setProperty('--gauge-color', color);
    label.innerText = statusText;
    tip.innerText = tipText;
}

// Fetch prediction history with pagination
async function fetchHistory() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/history?page=${currentPage}&limit=${limit}`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }
        
        const result = await response.json();
        const history = result.data || [];
        const pagin = result.pagination || { page: 1, totalPages: 1, total: 0 };
        
        totalPages = pagin.totalPages;

        // Update history count badge
        document.getElementById("history-count").innerText = `${pagin.total} Prediction${pagin.total === 1 ? "" : "s"}`;

        const tbody = document.querySelector("#history-table tbody");
        tbody.innerHTML = "";

        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center;">
                        <div class="empty-state">
                            <div class="empty-icon">📂</div>
                            <p>No predictions yet. Submit the form to see history.</p>
                        </div>
                    </td>
                </tr>
            `;
            document.getElementById("pagination").style.display = "none";
            return;
        }

        document.getElementById("pagination").style.display = "flex";

        history.forEach((item, index) => {
            const globalIndex = (currentPage - 1) * limit + index + 1;
            const probPercent = Math.round(item.probability * 100);
            
            let probClass = "low";
            if (item.probability >= 0.75) probClass = "high";
            else if (item.probability >= 0.4) probClass = "medium";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${globalIndex}</td>
                <td>WL ${item.wl_position}</td>
                <td>${item.days_left} days</td>
                <td><span class="class-badge">${item.class_type}</span></td>
                <td>${item.quota}</td>
                <td>${item.season}</td>
                <td>${item.train_type}</td>
                <td>
                    <span class="prob-badge ${probClass}">
                        <span class="dot"></span>
                        ${probPercent}%
                    </span>
                </td>
                <td>${new Date(item.createdAt).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });

        // Update pagination UI
        document.getElementById("page-info").innerText = `Page ${currentPage} of ${totalPages || 1}`;
        document.getElementById("prev-btn").disabled = currentPage <= 1;
        document.getElementById("next-btn").disabled = currentPage >= totalPages;

    } catch (err) {
        console.error(err);
        showToast("Could not retrieve prediction history");
    }
}

// Change page
function changePage(direction) {
    currentPage += direction;
    fetchHistory();
}

// Fetch history on page load
window.onload = fetchHistory;
