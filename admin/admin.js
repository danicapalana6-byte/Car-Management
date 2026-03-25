(function () {
  const state = { bookings: [], services: [], offers: [], clients: [] };
  const pageTitles = {
    dashboard: "Dashboard",
    bookings: "Bookings",
    "services-section": "Services",
    feedbacks: "Feedbacks",
    offers: "Offers",
    analytics: "Analytics",
    reports: "Reports"
  };
  let revenueChartInstance = null;

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("loginForm")) {
      bindLoginPage();
      return;
    }
    if (!checkAuth()) return;
    bindDashboardEvents();
    showPage("dashboard");
  });

  function bindLoginPage() {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("msg");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.classList.add("hidden");
      try {
        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || "Invalid admin credentials.");
        localStorage.setItem("adminToken", payload.token);
        window.location.href = "dashboard.html";
      } catch (error) {
        message.textContent = error.message;
        message.classList.remove("hidden");
      }
    });
  }

  function bindDashboardEvents() {
    [
      ["btnDashboard", "dashboard"],
      ["btnBookings", "bookings"],
      ["btnServices", "services-section"],
      ["btnFeedbacks", "feedbacks"],
      ["btnOffers", "offers"],
      ["btnAnalytics", "analytics"],
      ["btnReports", "reports"]
    ].forEach(([id, page]) => {
      document.getElementById(id)?.addEventListener("click", () => showPage(page));
    });

    document.getElementById("btnLogout")?.addEventListener("click", () => {
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
    });
    document.getElementById("refreshBtn")?.addEventListener("click", async () => {
      await refreshState();
      renderAll();
    });
    document.getElementById("addBookingBtn")?.addEventListener("click", () => openBookingModal());
    document.getElementById("bookingForm")?.addEventListener("submit", saveBooking);
    document.getElementById("addServiceBtn")?.addEventListener("click", () => openServiceModal());
    document.getElementById("addOfferBtn")?.addEventListener("click", () => openOfferModal());
    document.getElementById("serviceForm")?.addEventListener("submit", saveService);
    document.getElementById("offerForm")?.addEventListener("submit", saveOffer);
    document.querySelectorAll(".close-modal").forEach((button) => {
      button.addEventListener("click", () => closeModal(button.dataset.close));
    });
    document.querySelectorAll(".modal-backdrop").forEach((modal) => {
      modal.addEventListener("click", (event) => {
        if (event.target === modal) modal.classList.add("hidden");
      });
    });
  }

  async function showPage(pageId) {
    document.querySelectorAll(".page-section").forEach((section) => {
      section.classList.toggle("hidden", section.id !== pageId);
    });
    document.querySelectorAll(".nav-btn").forEach((button) => {
      button.classList.toggle("active", button.dataset.page === pageId);
    });
    const title = document.getElementById("pageTitle");
    if (title) title.textContent = pageTitles[pageId] || "Dashboard";
    await refreshState();
    renderAll();
  }

async function refreshState() {
    try {
      const [bookingsRes, servicesRes, offersRes, clientsRes, feedbacksRes] = await Promise.all([
        fetchWithAuth("/api/admin/bookings"),
        fetchWithAuth("/api/admin/services"),
        fetchWithAuth("/api/admin/offers"),
        fetchWithAuth("/api/admin/clients"),
        fetchWithAuth("/api/admin/feedbacks")
      ]);
      state.bookings = await bookingsRes.json();
      state.services = await servicesRes.json();
      state.offers = await offersRes.json();
      state.clients = await clientsRes.json();
      state.feedbacks = await feedbacksRes.json();
    } catch (error) {
      console.error("Failed to load admin data:", error);
      openDialog({
        eyebrow: "Load Error",
        title: "Unable to refresh admin data",
        message: "Check the server connection or sign in again.",
        confirmLabel: "Close",
        hideCancel: true
      });
    }
  }

  async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("adminToken");
    const headers = { ...(options.headers || {}), Authorization: token || "" };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 403) {
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
      throw new Error("Admin access denied.");
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || payload.error || `Request failed: ${response.status}`);
    }
    return response;
  }

  function renderAll() {
    renderStats();
    renderLatestBookings();
    renderBookingsTable();
    renderServices();
    renderServiceOverview();
    renderOffers();
    renderActiveOffers();
    renderAnalytics();
    renderReports();
    renderFeedbacks();
    loadServices();
  }

  function loadServices() {
    const tbody = document.querySelector("#services-overview tbody");
    if (!tbody) return;

    fetchWithAuth("/api/admin/services")
      .then((response) => response.json())
      .then((services) => {
        if (services.length > 0) {
          tbody.innerHTML = "";
          services.forEach((service) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${escapeHtml(service.name)}</strong></td>
                <td><span style="color: var(--accent, #1b7a44); font-weight: 600;">${formatCurrency(service.price)}</span></td>
                <td>${escapeHtml(String(service.duration || 0))} mins</td>
                <td style="color: #666; font-size: 0.9em;">${escapeHtml(service.description || "-")}</td>
            `;
            tbody.appendChild(row);
          });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No services published yet.</td></tr>`;
        }
      })
      .catch((error) => {
        console.error("Error loading services:", error);
          tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Error loading services</td></tr>`;
      });
  }

  function renderFeedbacks() {
    const container = document.getElementById("feedbackList");
    if (!container || !state.feedbacks) return;
    
    if (!state.feedbacks.length) {
      container.innerHTML = `<div class="panel empty-state">No feedback yet.</div>`;
      return;
    }
    
    container.innerHTML = state.feedbacks.map(fb => `
      <article class="feedback-card">
        <div class="feedback-header">
          <div>
            <strong>${escapeHtml(fb.user || "Guest")}</strong>
            <span class="rating">${'★'.repeat(Number(fb.rating) || 0)}${'☆'.repeat(Math.max(0, 5 - (Number(fb.rating) || 0)))}</span>
            ${fb.service ? `<span class="service-tag">${escapeHtml(fb.service)}</span>` : ''}
            ${fb.booking ? `<span class="booking-tag">Booking</span>` : ''}
          </div>
          <small>${fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}</small>
        </div>
        <p>${escapeHtml(fb.comment)}</p>
        ${fb.image ? `<img src="${escapeAttribute(fb.image)}" alt="Feedback image">` : ''}
        <div class="card-actions" style="margin-top: 10px;">
          <button class="action-btn danger" data-feedback-delete="${fb._id}">Delete</button>
        </div>
      </article>
    `).join("");

    container.querySelectorAll("[data-feedback-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteFeedback(button.dataset.feedbackDelete));
    });
  }

  function deleteFeedback(id) {
    openDialog({
      eyebrow: "Delete Feedback",
      title: "Remove this feedback?",
      message: "Are you sure you want to delete this feedback?",
      confirmLabel: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        await fetchWithAuth(`/api/admin/feedbacks/${id}`, { method: "DELETE" });
        await refreshState();
        renderAll();
      }
    });
  }

  function renderStats() {
    const today = new Date().toISOString().split("T")[0];
    const confirmedToday = state.bookings.filter((b) => b.date === today && b.status === "confirmed").length;
    const totalRevenue = state.bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + Number(b.price || 0), 0);
    const uniqueClients = new Set(state.bookings.map(b => b.email));
    setText("carsToday", confirmedToday);
    setText("revenueToday", formatCurrency(totalRevenue));
    setText("bookingCount", state.bookings.length);
    setText("offerCount", state.offers.length);
    setText("clientCount", uniqueClients.size);
    setText("serviceCount", state.services.length);
  }

  function renderLatestBookings() {
    const tbody = document.getElementById("latestBookingsTbody");
    if (!tbody) return;
    tbody.innerHTML = [...state.bookings].sort(sortByCreatedAtDesc).slice(0, 5).map((booking) => `
      <tr>
        <td><strong>${escapeHtml(booking.name)}</strong></td>
        <td>${escapeHtml(booking.service)}</td>
        <td>${escapeHtml(vehicleDisplay(booking))}</td>
        <td>${escapeHtml(booking.date)}<br>${escapeHtml(booking.time)}</td>
        <td>${formatCurrency(booking.price)}</td>
        <td>${statusBadge(booking.status)}</td>
      </tr>
    `).join("") || emptyRow(6, "No recent bookings yet.");
  }

  function renderBookingsTable() {
    const tbody = document.getElementById("bookingListTbody");
    if (!tbody) return;
    tbody.innerHTML = [...state.bookings].sort(sortByCreatedAtDesc).map((booking) => `
      <tr>
        <td><strong>${escapeHtml(booking.name)}</strong></td>
        <td>${escapeHtml(booking.service)}</td>
        <td>${escapeHtml(vehicleDisplay(booking))}</td>
        <td>${escapeHtml(booking.date)}<br>${escapeHtml(booking.time)}</td>
        <td>${escapeHtml(booking.email || "-")}</td>
        <td>${formatCurrency(booking.price)}</td>
        <td>${statusBadge(booking.status)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn" data-action="edit" data-id="${booking._id}">Manage</button>
            <button class="action-btn" data-action="confirm" data-id="${booking._id}" ${(booking.status === "confirmed" || booking.status === "completed") ? "disabled" : ""}>Confirm</button>
            <button class="action-btn" data-action="complete" data-id="${booking._id}" ${booking.status === "completed" ? "disabled" : ""}>Complete</button>
            ${(booking.status || "pending").toLowerCase() !== "pending" 
              ? `<button class="action-btn danger" data-action="delete" data-id="${booking._id}">Delete</button>`
              : `<button class="action-btn danger" data-action="reject" data-id="${booking._id}">Reject</button>`
            }
          </div>
        </td>
      </tr>
    `).join("") || emptyRow(8, "No bookings found.");
    tbody.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => handleBookingAction(button.dataset.action, button.dataset.id));
    });
  }

  async function saveBooking(event) {
    event.preventDefault();
    const id = document.getElementById("bookingId").value;
    const payload = {
      name: document.getElementById("bookingName").value.trim(),
      service: document.getElementById("bookingService").value.trim(),
      date: document.getElementById("bookingDate").value,
      time: document.getElementById("bookingTime").value,
      vehicleType: document.getElementById("bookingVehicleType").value.trim(),
      vehicleModel: document.getElementById("bookingVehicleModel").value.trim(),
      plateNumber: document.getElementById("bookingPlateNumber").value.trim(),
      email: document.getElementById("bookingEmail").value.trim(),
      price: Number(document.getElementById("bookingPrice").value),
    };
    await fetchWithAuth(id ? `/api/admin/bookings/${id}` : "/api/admin/bookings", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    closeModal("#bookingModal");
    await refreshState();
    renderAll();
  }

  function openBookingModal(booking) {
    document.getElementById("bookingModalTitle").textContent = booking ? "Manage Booking" : "Add Booking";
    document.getElementById("bookingId").value = booking?._id || "";
    document.getElementById("bookingName").value = booking?.name || "";
    document.getElementById("bookingService").value = booking?.service || "";
    document.getElementById("bookingDate").value = booking?.date || "";
    document.getElementById("bookingTime").value = booking?.time || "";
    document.getElementById("bookingVehicleType").value = booking?.vehicleType || "";
    document.getElementById("bookingVehicleModel").value = booking?.vehicleModel || "";
    document.getElementById("bookingPlateNumber").value = booking?.plateNumber || "";
    document.getElementById("bookingEmail").value = booking?.email || "";
    document.getElementById("bookingPrice").value = booking?.price || "";
    openModal("#bookingModal");
  }

  async function handleBookingAction(action, id) {
    const booking = state.bookings.find((entry) => entry._id === id);
    if (!booking) return;

    if (action === "edit") {
      openBookingModal(booking);
      return;
    }

    if (action === "delete") {
      openDialog({
        eyebrow: "Delete Booking",
        title: "Delete this booking?",
        message: `Permanently delete ${booking.name}'s booking from the system?`,
        confirmLabel: "Delete",
        confirmVariant: "danger",
        onConfirm: async () => {
          await fetchWithAuth(`/api/admin/bookings/${id}`, { method: "DELETE" });
          await refreshState();
          renderAll();
        }
      });
      return;
    }

    if (action === "reject") {
      openDialog({
        eyebrow: "Reject Booking",
        title: "Reject this booking?",
        message: `Set ${booking.name}'s booking for ${booking.service} to cancelled?`,
        confirmLabel: "Reject",
        confirmVariant: "danger",
        onConfirm: async () => {
          await fetchWithAuth(`/api/admin/bookings/${id}`, { 
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "cancelled" })
          });
          await refreshState();
          renderAll();
        }
      });
      return;
    }

    const nextStatus = action === "confirm" ? "confirmed" : "completed";
    await fetchWithAuth(`/api/admin/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    await refreshState();
    renderAll();
  }

function renderServices() {
    const container = document.getElementById("services-list");
    if (!container) return;
    if (!state.services.length) {
      container.innerHTML = `<div class="panel empty-state">No services published yet.</div>`;
      return;
    }
    container.innerHTML = state.services.map((service) => `
      <article class="service-card">
        <img src="${service.image || escapeAttribute("/client/image/logo.png")}" alt="${escapeAttribute(service.name)}">
        <div class="service-body">
          <div>
            <h3>${escapeHtml(service.name)}</h3>
            <p class="service-meta">${escapeHtml(service.description)}</p>
          </div>
          <div class="meta-row"><strong>${formatCurrency(service.price)}</strong></div>
          <div class="card-actions">
            <button class="action-btn" data-service="${service._id}">View</button>
            <button class="action-btn" data-service="${service._id}">Edit</button>
            <button class="action-btn danger" data-service="${service._id}">Delete</button>
          </div>
        </div>
      </article>
    `).join("");

    // Service button event listeners
    container.querySelectorAll("[data-service]").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const serviceId = button.dataset.service;
        const service = state.services.find(s => s._id === serviceId);
        if (!service) return;
        
        if (button.textContent.includes("View")) viewService(serviceId);
        if (button.textContent.includes("Edit")) openServiceModal(service);
        if (button.textContent.includes("Delete")) deleteService(serviceId);
      });
    });
  }

  function renderServiceOverview() {
    const container = document.getElementById("servicesOverview");
    if (!container) return;
    container.innerHTML = state.services.length ? state.services.slice(0, 4).map((service) => `
      <div class="offer-pill">
        <strong>${escapeHtml(service.name)}</strong>
        <div class="service-meta">${formatCurrency(service.price)} - ${escapeHtml(service.description || "Service available")}</div>
      </div>
    `).join("") : `<p class="empty-state">No services available for the client website.</p>`;
  }

async function saveService(event) {
    event.preventDefault();
    const id = document.getElementById("serviceId").value;
    const formData = new FormData();
    formData.append('name', document.getElementById("serviceName").value.trim());
    formData.append('price', Number(document.getElementById("servicePrice").value));
    formData.append('description', document.getElementById("serviceDescription").value.trim());
    formData.append('fullDescription', document.getElementById("serviceFullDescription").value.trim());
    const duration = document.getElementById("serviceDuration").value;
    if (duration) formData.append('duration', Number(duration));
    
    const imageInput = document.getElementById("serviceImage");
    if (imageInput.files && imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }
    
    await fetchWithAuth(id ? `/api/admin/services/${id}` : "/api/admin/services", {
      method: id ? "PUT" : "POST",
      body: formData
    });
    closeModal("#serviceModal");
    await refreshState();
    renderAll();
  }

  function openServiceModal(service) {
    document.getElementById("modalTitle").textContent = service ? "Edit Service" : "Add Service";
    document.getElementById("serviceId").value = service?._id || "";
    document.getElementById("serviceName").value = service?.name || "";
    document.getElementById("servicePrice").value = service?.price || "";
    document.getElementById("serviceDescription").value = service?.description || "";
    document.getElementById("serviceFullDescription").value = service?.fullDescription || "";
    document.getElementById("serviceDuration").value = service?.duration || "";
    
    // Image preview
    const preview = document.getElementById("serviceImagePreview");
    const previewImg = document.getElementById("serviceImagePreviewImg");
    if (service?.image) {
      previewImg.src = service.image;
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
    
    openModal("#serviceModal");
  }

  function viewService(id) {
    const service = state.services.find((entry) => entry._id === id);
    if (!service) return;
    setText("viewModalTitle", service.name);
    
    const bulletList = service.bulletPoints && service.bulletPoints.length ? 
      `<ul class="service-bullets">${service.bulletPoints.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : '';
    
    document.getElementById("viewModalBody").innerHTML = `
      <div class="service-preview">
        <img src="${escapeAttribute(service.image || "/client/image/logo.png")}" alt="${escapeAttribute(service.name)}">
        <div style="line-height:1.6;">
          <p>${escapeHtml(service.fullDescription || service.description || "Professional car wash service.")}</p>
          ${bulletList}
        </div>
      </div>
    `;
    
    document.getElementById("viewModalMeta").innerHTML = `
      <div class="meta-row" style="justify-content:center;gap:24px;align-items:center;">
        <span style="font-weight:800;font-size:1.3rem;color:var(--accent);">${formatCurrency(service.price)}</span>
        <span><strong>${service.duration || 45} mins</strong></span>
      </div>
    `;
    openModal("#viewServiceModal");
  }

  function deleteService(id) {
    const service = state.services.find((entry) => entry._id === id);
    if (!service) return;
    openDialog({
      eyebrow: "Delete Service",
      title: "Remove this service?",
      message: `${service.name} will no longer be available to clients.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        await fetchWithAuth(`/api/admin/services/${id}`, { method: "DELETE" });
        await refreshState();
        renderAll();
      }
    });
  }

  function renderOffers() {
    const container = document.getElementById("offerList");
    if (!container) return;
    if (!state.offers.length) {
      container.innerHTML = `<div class="panel empty-state">No offers published yet.</div>`;
      return;
    }
    container.innerHTML = state.offers.map((offer) => `
      <article class="offer-card">
        <div class="offer-body">
          <div>
            <h3>${escapeHtml(offer.name)}</h3>
            <p class="offer-meta">${escapeHtml(offer.description || "Client-facing promotional offer.")}</p>
          </div>
          <div class="meta-row">
            <strong>${escapeHtml(String(offer.discount))}% off</strong>
            <div>Expiry: ${escapeHtml(offer.expiry || "ongoing")}</div>
          </div>
          <div class="card-actions">
            <button class="action-btn" data-offer-edit="${offer._id}">Edit</button>
            <button class="action-btn danger" data-offer-delete="${offer._id}">Delete</button>
          </div>
        </div>
      </article>
    `).join("");
    container.querySelectorAll("[data-offer-edit]").forEach((button) => {
      button.addEventListener("click", () => openOfferModal(state.offers.find((offer) => offer._id === button.dataset.offerEdit)));
    });
    container.querySelectorAll("[data-offer-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteOffer(button.dataset.offerDelete));
    });
  }

  function renderActiveOffers() {
    const container = document.getElementById("activeOffers");
    if (!container) return;
    container.innerHTML = state.offers.length ? state.offers.map((offer) => `
      <div class="offer-pill">
        <strong>${escapeHtml(offer.name)}</strong>
        <div class="offer-meta">${escapeHtml(String(offer.discount))}% off - ${escapeHtml(offer.expiry || "ongoing")}</div>
      </div>
    `).join("") : `<p class="empty-state">No active offers available.</p>`;
  }

  async function saveOffer(event) {
    event.preventDefault();
    const id = document.getElementById("offerId").value;
    const payload = {
      name: document.getElementById("offerName").value.trim(),
      discount: Number(document.getElementById("offerDiscount").value),
      description: document.getElementById("offerDescription").value.trim(),
      expiry: document.getElementById("offerExpiry").value.trim()
    };
    await fetchWithAuth(id ? `/api/admin/offers/${id}` : "/api/admin/offers", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    closeModal("#offerModal");
    await refreshState();
    renderAll();
  }

  function openOfferModal(offer) {
    document.getElementById("offerModalTitle").textContent = offer ? "Edit Offer" : "Add Offer";
    document.getElementById("offerId").value = offer?._id || "";
    document.getElementById("offerName").value = offer?.name || "";
    document.getElementById("offerDiscount").value = offer?.discount || "";
    document.getElementById("offerDescription").value = offer?.description || "";
    document.getElementById("offerExpiry").value = offer?.expiry || "";
    openModal("#offerModal");
  }

  function deleteOffer(id) {
    const offer = state.offers.find((entry) => entry._id === id);
    if (!offer) return;
    openDialog({
      eyebrow: "Delete Offer",
      title: "Remove this offer?",
      message: `${offer.name} will no longer appear in the admin website and client support panels.`,
      confirmLabel: "Delete",
      confirmVariant: "danger",
      onConfirm: async () => {
        await fetchWithAuth(`/api/admin/offers/${id}`, { method: "DELETE" });
        await refreshState();
        renderAll();
      }
    });
  }

  function renderAnalytics() {
    const counts = {};
    const revenue = {};
    const days = {};
    let confirmedCount = 0;
    let confirmedRevenue = 0;
    state.bookings.forEach((booking) => {
      counts[booking.service] = (counts[booking.service] || 0) + 1;
      if (booking.status === "confirmed" || booking.status === "completed") {
        revenue[booking.service] = (revenue[booking.service] || 0) + Number(booking.price || 0);
        confirmedCount += 1;
        confirmedRevenue += Number(booking.price || 0);
      }
      if (booking.date) {
        const weekday = new Date(booking.date).getDay();
        if (!Number.isNaN(weekday)) days[weekday] = (days[weekday] || 0) + 1;
      }
    });
    const topService = pickMaxKey(counts);
    const peakDayIndex = pickMaxKey(days);
    const peakDay = peakDayIndex === null ? "None" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][Number(peakDayIndex)];
    const averageRevenue = state.bookings.length ? confirmedRevenue / state.bookings.length : 0;
    const conversionRate = state.bookings.length ? (confirmedCount / state.bookings.length) * 100 : 0;
    setText("topService", topService || "None");
    setText("peakDay", peakDay);
    setText("avgRevenue", formatCurrency(averageRevenue));
    setText("conversionRate", `${conversionRate.toFixed(1)}%`);
    renderRevenueChart(revenue);
    renderRevenueTable(revenue, counts);
  }

  function renderRevenueChart(revenueByService) {
    const canvas = document.getElementById("revenueChart");
    if (!canvas) return;
    const labels = Object.keys(revenueByService);
    const values = Object.values(revenueByService);
    revenueChartInstance?.destroy();
    revenueChartInstance = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: labels.length ? labels : ["No revenue"],
        datasets: [{ data: values.length ? values : [1], backgroundColor: ["#1b7a44", "#31955a", "#63b97d", "#98d3aa", "#d7ecd9"], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
    });
  }

  function renderRevenueTable(revenueByService, bookingCountByService) {
    const tbody = document.getElementById("revenueTable");
    if (!tbody) return;
    tbody.innerHTML = Object.keys(bookingCountByService).map((serviceName) => `
      <tr>
        <td>${escapeHtml(serviceName)}</td>
        <td>${bookingCountByService[serviceName]}</td>
        <td>${formatCurrency(revenueByService[serviceName] || 0)}</td>
      </tr>
    `).join("") || emptyRow(3, "No analytics data yet.");
  }

  function renderReports() {
    const summary = document.getElementById("reportSummary");
    const actions = document.getElementById("reportActions");
    if (!summary || !actions) return;
    const pending = state.bookings.filter((booking) => booking.status === "pending").length;
    const confirmedRevenue = state.bookings
      .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
      .reduce((sum, booking) => sum + Number(booking.price || 0), 0);
    summary.innerHTML = [
      `Client accounts registered: ${state.clients.length}`,
      `Services currently published: ${state.services.length}`,
      `Confirmed or completed revenue: ${formatCurrency(confirmedRevenue)}`,
      `Pending booking approvals: ${pending}`
    ].map((line) => `<li>${escapeHtml(line)}</li>`).join("");
    const actionItems = [];
    if (pending > 0) actionItems.push(`Review ${pending} pending booking${pending > 1 ? "s" : ""}.`);
    if (!state.offers.length) actionItems.push("Create at least one active offer to support the client website.");
    if (!state.services.length) actionItems.push("Publish services so the client site has a complete catalog.");
    if (!actionItems.length) actionItems.push("Operations look healthy. Continue monitoring bookings and offers.");
    actions.innerHTML = actionItems.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  }

  function openDialog(options) {
    const cancel = document.getElementById("dialogCancel");
    const confirm = document.getElementById("dialogConfirm");
    document.getElementById("dialogEyebrow").textContent = options.eyebrow || "Action";
    document.getElementById("dialogTitle").textContent = options.title || "Confirm";
    document.getElementById("dialogMessage").textContent = options.message || "";
    confirm.textContent = options.confirmLabel || "Confirm";
    confirm.className = options.confirmVariant === "danger" ? "action-btn danger" : "primary-btn";
    cancel.classList.toggle("hidden", Boolean(options.hideCancel));
    confirm.onclick = async () => {
      closeModal("#dialogModal");
      if (options.onConfirm) await options.onConfirm();
    };
    cancel.onclick = () => closeModal("#dialogModal");
    openModal("#dialogModal");
  }

  function openModal(selector) { document.querySelector(selector)?.classList.remove("hidden"); }
  function closeModal(selector) { document.querySelector(selector)?.classList.add("hidden"); }
  function checkAuth() {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }
  function sortByCreatedAtDesc(a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); }
  function vehicleDisplay(booking) {
    const parts = [booking.vehicleType, booking.vehicleModel].filter(Boolean);
    return booking.vehicle || parts.join(" - ") || "-";
  }
  function pickMaxKey(record) {
    const entries = Object.entries(record);
    if (!entries.length) return null;
    return entries.reduce((best, current) => current[1] > best[1] ? current : best)[0];
  }
  function formatCurrency(value) {
    return `PHP ${Number(value || 0).toLocaleString("en-ph", { maximumFractionDigits: 0 })}`;
  }
  function statusBadge(status) {
    const normalized = (status || "pending").toLowerCase();
    return `<span class="status-badge status-${escapeAttribute(normalized)}">${escapeHtml(normalized)}</span>`;
  }
  function emptyRow(columns, message) {
    return `<tr><td colspan="${columns}" class="empty-state">${escapeHtml(message)}</td></tr>`;
  }
  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function escapeAttribute(value) { return escapeHtml(value); }
})();
