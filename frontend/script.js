async function predictWL() {
    const wl_position = document.getElementById("wl_position").value;
    const days_left = document.getElementById("days_left").value;
    const class_type = document.getElementById("class_type").value;
    const quota = document.getElementById("quota").value;

    if (!wl_position || !days_left) {
        alert("Please enter WL position and Days Left!");
        return;
    }

    const payload = {
        wl_position: Number(wl_position),
        days_left: Number(days_left),
        class_type,
        quota
    };

    try {
        const response = await fetch("http://localhost:4000/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        document.getElementById("result").innerText = `Success Probability: ${data.probability.toFixed(2)}`;

        // Refresh history table
        fetchHistory();

    } catch (err) {
        console.error(err);
        document.getElementById("result").innerText = "Error connecting to backend";
    }
}

async function fetchHistory() {
    try {
        const response = await fetch("http://localhost:4000/api/history");
        const history = await response.json();
        const tbody = document.querySelector("#history-table tbody");
        tbody.innerHTML = "";

        history.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.wl_position}</td>
                <td>${item.days_left}</td>
                <td>${item.class_type}</td>
                <td>${item.quota}</td>
                <td>${item.probability.toFixed(2)}</td>
                <td>${new Date(item.createdAt).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// Fetch history on page load
window.onload = fetchHistory;
