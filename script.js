
const form = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const search = document.getElementById("search");
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");

let items = JSON.parse(localStorage.getItem("campusItems")) || [];

function saveItems() {
    localStorage.setItem("campusItems", JSON.stringify(items));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Add new item report
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const photoFile = document.getElementById("photo").files[0];

    if (photoFile && !photoFile.type.startsWith("image/")) {
        alert("Please upload a valid image.");
        return;
    }

    if (photoFile && photoFile.size > 2 * 1024 * 1024) {
        alert("Image must be 2MB or smaller.");
        return;
    }

    const createItem = (photoData) => {
        const newItem = {
            id: Date.now().toString(),
            reporter: document.getElementById("reporter").value.trim(),
            name: document.getElementById("itemName").value.trim(),
            type: document.getElementById("itemType").value,
            category: document.getElementById("category").value,
            location: document.getElementById("location").value.trim(),
            date: document.getElementById("date").value,
            description: document.getElementById("description").value.trim(),
            photo: photoData,
            status: "Open"
        };

        items.unshift(newItem);
        saveItems();
        displayItems();
        form.reset();

        alert("Your report has been submitted successfully!");
        document.getElementById("items").scrollIntoView({
            behavior: "smooth"
        });
    };

    if (photoFile) {
        const reader = new FileReader();

        reader.onload = function() {
            createItem(reader.result);
        };

        reader.onerror = function() {
            alert("Unable to read the uploaded image.");
        };

        reader.readAsDataURL(photoFile);
    } else {
        createItem("");
    }
});

// Display items
function displayItems() {
    const keyword = search.value.toLowerCase();
    const selectedType = filterType.value;
    const selectedStatus = filterStatus.value;

    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(keyword) ||
            item.location.toLowerCase().includes(keyword) ||
            item.category.toLowerCase().includes(keyword);

        const matchesType =
            selectedType === "All" || item.type === selectedType;

        const matchesStatus =
            selectedStatus === "All" || item.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    itemList.innerHTML = "";

    if (filteredItems.length === 0) {
        itemList.innerHTML =
            '<p class="empty">No items found. Try another search.</p>';
    }

    filteredItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        const image = item.photo
            ? `<img src="${item.photo}" alt="Item photo">`
            : `<img src="https://placehold.co/400x200?text=No+Image" alt="No image uploaded">`;

        card.innerHTML = `
            ${image}
            <div class="item-content">
                <span class="tag">${escapeHTML(item.type)}</span>
                <h3>${escapeHTML(item.name)}</h3>
                <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
                <p><strong>Location:</strong> ${escapeHTML(item.location)}</p>
                <p><strong>Date:</strong> ${escapeHTML(item.date)}</p>
                <p><strong>Reported by:</strong> ${escapeHTML(item.reporter)}</p>
                <p><strong>Status:</strong>
                    <span class="status">${escapeHTML(item.status)}</span>
                </p>

                <div class="card-buttons">
                    <button onclick="viewDetails('${item.id}')">
                        View Details
                    </button>

                    ${item.status === "Open" ? `
                        <button onclick="updateStatus('${item.id}', 'Claimed')">
                            Claim
                        </button>
                    ` : ""}

                    ${item.status !== "Returned" ? `
                        <button onclick="updateStatus('${item.id}', 'Returned')">
                            Mark Returned
                        </button>
                    ` : ""}

                    <button class="delete-btn"
                        onclick="deleteItem('${item.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;

        itemList.appendChild(card);
    });

    updateStatistics();
}

// View item details
function viewDetails(id) {
    const item = items.find(item => item.id === id);

    if (!item) return;

    alert(
        "ITEM DETAILS\n\n" +
        "Name: " + item.name + "\n" +
        "Type: " + item.type + "\n" +
        "Category: " + item.category + "\n" +
        "Location: " + item.location + "\n" +
        "Date: " + item.date + "\n" +
        "Reporter: " + item.reporter + "\n" +
        "Description: " + item.description + "\n" +
        "Status: " + item.status
    );
}

// Update item status
function updateStatus(id, newStatus) {
    const item = items.find(item => item.id === id);

    if (!item) return;

    const confirmed = confirm(
        "Are you sure you want to change this item's status to " +
        newStatus + "?"
    );

    if (confirmed) {
        item.status = newStatus;
        saveItems();
        displayItems();
        alert("Item status updated successfully!");
    }
}

// Delete item
function deleteItem(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this report?"
    );

    if (confirmed) {
        items = items.filter(item => item.id !== id);
        saveItems();
        displayItems();
        alert("Report deleted successfully!");
    }
}

// Update dashboard statistics
function updateStatistics() {
    document.getElementById("totalItems").textContent = items.length;

    document.getElementById("lostItems").textContent =
        items.filter(item => item.type === "Lost" && item.status === "Open").length;

    document.getElementById("foundItems").textContent =
        items.filter(item => item.type === "Found" && item.status === "Open").length;

    document.getElementById("returnedItems").textContent =
        items.filter(item => item.status === "Returned").length;
}

// Search and filter events
search.addEventListener("input", displayItems);
filterType.addEventListener("change", displayItems);
filterStatus.addEventListener("change", displayItems);

// Initial display
displayItems();
