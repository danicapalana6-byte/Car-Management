document.addEventListener('DOMContentLoaded', function() {
    (function () {
        // localStorage keys
        const LS_BOOKINGS = 'admin_bookings_v1',
              LS_SERVICES = 'admin_services_v1',
              LS_OFFERS = 'admin_offers_v1';

        // UI Elements - now safe after DOM ready
        const sections = {
            dashboard: document.getElementById('dashboard'),
            bookings: document.getElementById('bookings'),
            'services-section': document.getElementById('services-section'),
            analytics: document.getElementById('analytics'),
            offers: document.getElementById('offers'),
            reports: document.getElementById('reports')
        };

        const btns = {
            dashboard: document.getElementById('btnDashboard'),
            bookings: document.getElementById('btnBookings'),
            services: document.getElementById('btnServices'),
            analytics: document.getElementById('btnAnalytics'),
            offers: document.getElementById('btnOffers'),
            reports: document.getElementById('btnReports'),
            logout: document.getElementById('btnLogout')
        };

    // Data (loaded from API)
    let bookings = [];
    let offers = JSON.parse(localStorage.getItem(LS_OFFERS)) || [
        { id: 'off1', name: '10% off Mon-Wed', discount: 10 }
    ];
    let services = [];

    function saveOffers() {
        localStorage.setItem(LS_OFFERS, JSON.stringify(offers));
    }

    async function fetchWithAuth(url, options = {}) {
        const token = localStorage.getItem('adminToken');
        const headers = {
            ...options.headers,
            'Authorization': token
        };

        const response = await fetch(url, { ...options, headers });

        if (response.status === 403) {
            window.location.href = 'login.html';
            throw new Error('Forbidden');
        }

        return response;
    }


    // Load data from backend
    async function loadData() {
        try {
            const [bRes, sRes] = await Promise.all([
                fetchWithAuth('/api/admin/bookings'),
                fetchWithAuth('/api/admin/services')
            ]);
            bookings = await bRes.json();
            services = await sRes.json();
        } catch (e) {
            console.error('Load data failed:', e);
            bookings = [];
            services = [];
        }
    }

    // Navigation Logic
    async function showPage(pageId) {
        // Hide all sections first
        Object.values(sections).forEach(s => {
            if (s) s.classList.add('hidden');
        });

        // Show the selected section
        if (sections[pageId]) {
            sections[pageId].classList.remove('hidden');
        } else if (pageId === 'dashboard') {
            sections.dashboard.classList.remove('hidden');
        }


        // Load data and render all components
        await loadData();
        renderAll();
    }

    // Sidebar button event listeners
    btns.dashboard.addEventListener('click', () => showPage('dashboard'));
    btns.bookings.addEventListener('click', () => showPage('bookings'));
    btns.services.addEventListener('click', () => showPage('services-section'));
    btns.analytics.addEventListener('click', () => showPage('analytics'));
    btns.offers.addEventListener('click', () => showPage('offers'));
    btns.reports.addEventListener('click', () => showPage('reports'));

    btns.logout.addEventListener('click', () => {
        if(confirm('Logout?')) {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        }
    });

    function saveAll() {
        console.log("Saving data (not implemented yet)...", { bookings, services, offers });
    }

    // Render Bookings
    function renderBookings() {
        const el = document.getElementById('bookingListTbody');
        if (!el || !bookings.length) { 
            if(el) el.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>'; 
            return; 
        }
        el.innerHTML = '';
        bookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(b.name)}</td>
                <td>${escapeHtml(b.service)}</td>
                <td>${escapeHtml(b.vehicle) || ''}</td>
                <td>${escapeHtml(b.date)} at ${escapeHtml(b.time)}</td>
                <td>₱${escapeHtml(b.price)}</td>
                <td>${escapeHtml(b.status)}</td>
                <td>
                    <button class="confirmBtn" data-id="${b.id}" style="color:green" ${b.status === 'confirmed' ? 'disabled' : ''}>
                        ${b.status === 'confirmed' ? '✓ Confirmed' : 'Confirm'}
                    </button>
                    <button class="rejectBtn" data-id="${b.id}" style="color:red">Reject</button>
                </td>
            `;
            el.appendChild(tr);
        });

        el.querySelectorAll('.rejectBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                showDeleteConfirmPopup('Are you sure you want to reject this booking?', async () => {
                    try {
                        const response = await fetchWithAuth(`/api/admin/bookings/${btn.dataset.id}`, { method: 'DELETE' });
                        if (response.ok) {
                            bookings = bookings.filter(x => x.id !== btn.dataset.id);
                            renderBookings();
                            updateStats();
                        } else {
                            alert('Failed to delete booking.');
                        }
                    } catch (error) {
                        console.error('Delete booking error:', error);
                        alert('An error occurred while deleting the booking.');
                    }
                });
            });
        });

        el.querySelectorAll('.confirmBtn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to confirm this booking?')) {
                    const b = bookings.find(x => x.id === btn.dataset.id);
                    if (b) {
                        try {
                            const response = await fetchWithAuth(`/api/admin/bookings/${b.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'confirmed' })
                            });
                            if (response.ok) {
                                b.status = 'confirmed';
                                renderBookings();
                            } else {
                                alert('Failed to confirm booking.');
                            }
                        } catch (error) {
                            console.error('Confirm booking error:', error);
                            alert('An error occurred while confirming the booking.');
                        }
                    }
                }
            });
        });
    }

    // Render Services
    function renderServices() {
        const el = document.getElementById('services-list');
        if(!el) return;
        el.innerHTML = '';

        if (!services.length) {
            el.innerHTML = '<p>No services available.</p>';
            return;
        }

        services.forEach(s => {
            const div = document.createElement('div');
            div.className = 'service-card card';
            div.innerHTML = `
                <div style="height:120px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f6fff8">
                    <img src="${s.image}" alt="${escapeHtml(s.name)}" style="max-height:100%; max-width:100%; object-fit:contain;">
                </div>
                <div>
                    <h4 style="margin:6px 0 4px">${escapeHtml(s.name)}</h4>
                    <div class="small muted">₱${s.price} • ${s.duration} mins</div>
                </div>
                <div style="margin-top:auto;display:flex;justify-content:flex-end;gap:8px;">
                    <button data-id="${s.id}" class="primary btn-view">View</button>
                    <button data-id="${s.id}" class="edit-btn">Edit</button>
                    <button data-id="${s.id}" class="btn-danger svcDelete">Remove</button>
                </div>
            `;
            el.appendChild(div);
        });

        // Add event listeners for buttons
        el.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const s = services.find(x => x.id === btn.dataset.id);
                if (s) {
                    document.getElementById('viewModalTitle').textContent = s.name;
                    document.getElementById('viewModalBody').innerHTML = `<div style="text-align:center;margin-bottom:10px"><img src="${s.image}" style="max-width:100%;border-radius:8px;"></div><p>${s.fullDescription}</p>`;
                    document.getElementById('viewModalMeta').innerHTML = `<strong>Price:</strong> ₱${s.price} &nbsp; <strong>Duration:</strong> ${s.duration} mins`;
                    document.getElementById('viewServiceModal').style.display = 'flex';
                }
            });
        });
        
        el.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const service = services.find(s => s.id === btn.dataset.id);
                openModal(service);
            });
        });

        el.querySelectorAll('.svcDelete').forEach(btn => {
            btn.addEventListener('click', () => {
                showDeleteConfirmPopup('Are you sure you want to delete this service?', async () => {
                    try {
                        const response = await fetchWithAuth(`/api/admin/services/${btn.dataset.id}`, { method: 'DELETE' });
                        if (response.ok) {
                            await loadData();
                            renderServices();
                            updateStats();
                        } else {
                            alert('Failed to delete service.');
                        }
                    } catch (error) {
                        console.error('Delete service error:', error);
                        alert('An error occurred while deleting the service.');
                    }
                });
            });
        });
    }

    function showDeleteConfirmPopup(message, onConfirm) {
        const overlay = document.createElement("div");
        overlay.className = 'modal-backdrop show';
        overlay.style.zIndex = "10000";

        overlay.innerHTML = `
            <div class="modal-card" style="border-top: 5px solid #dc3545; text-align:center;">
                <h3 style="color: #dc3545;">Confirm Deletion</h3>
                <p style="margin: 15px 0; color: #555;">${message}</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="confirmDeleteYes" class="primary" style="padding:10px 20px; background-color: #dc3545; border:none;">Yes, Delete</button>
                    <button id="confirmDeleteNo" class="btn-cancel" style="padding:10px 20px;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector("#confirmDeleteYes").onclick = () => {
            onConfirm();
            overlay.remove();
        };
        overlay.querySelector("#confirmDeleteNo").onclick = () => overlay.remove();

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }

    function showSuccessPopup(message) {
        const overlay = document.createElement("div");
        overlay.className = 'modal-backdrop show';
        overlay.style.zIndex = "10000";

        overlay.innerHTML = `
            <div class="modal-card" style="border-top: 5px solid #28a745; text-align:center;">
                <h3 style="color: #28a745;">Success</h3>
                <p style="margin: 15px 0; color: #555;">${message}</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="successOkBtn" class="primary" style="padding:10px 20px;">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector("#successOkBtn").onclick = () => {
            overlay.remove();
        };
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }

    // Modal Close
    const modals = document.querySelectorAll('.modal-backdrop, .modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    const closeBtns = document.querySelectorAll('.close-btn, .btn-cancel');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal, .modal-backdrop').style.display = 'none';
        });
    });


    // Render Offers
    function renderOffers() {
        const el = document.getElementById('offerList');
        el.innerHTML = '';
        offers.forEach(o => {
            const div = document.createElement('div');
            div.className = 'svcItem';
            div.innerHTML = `<strong>${escapeHtml(o.name)}</strong> - ${o.discount}% Off 
                            <button data-id="${o.id}" class="offerDelete" style="margin-left:10px">Delete</button>`;
            el.appendChild(div);
        });
        el.querySelectorAll('.offerDelete').forEach(btn => {
            btn.addEventListener('click', () => {
                showDeleteConfirmPopup('Are you sure you want to delete this offer?', () => {
                    offers = offers.filter(x => x.id !== btn.dataset.id);
                    saveAll(); renderOffers(); updateStats();
                });
            });
        });
    }

    // Update Dashboard Stats
    function updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => b.date === today && b.status === 'confirmed');
        document.getElementById('carsToday').innerText = todayBookings.length;
        const totalRev = bookings.reduce((acc, b) => acc + (b.status === 'confirmed' ? Number(b.price || 0) : 0), 0);
        document.getElementById('revenueToday').innerText = '₱' + totalRev.toLocaleString();
        document.getElementById('bookingCount').innerText = bookings.length;
        document.getElementById('offerCount').innerText = offers.length;
    }
    
function renderServicesOverview() {
    const el = document.getElementById('servicesOverview');
    if (!el || !services.length) {
        el.innerHTML = '<p class="small muted">No services available.</p>';
        return;
    }
    el.innerHTML = '';
    services.slice(0, 6).forEach(s => { // Show top 6 services
        const card = document.createElement('div');
        card.className = 'service-card card';
        card.style = 'display:flex;flex-direction:column;padding:12px;gap:8px;';
        card.innerHTML = `
            <div style="height:120px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f6fff8">
                <img src="${s.image}" alt="${escapeHtml(s.name)}" style="max-height:100%;max-width:100%;object-fit:contain;">
            </div>
            <div>
                <h4 style="margin:6px 0 4px">${escapeHtml(s.name)}</h4>
                <div class="small muted">₱${s.price} • ${s.duration} mins</div>
            </div>
            <button class="primary btn-view" data-id="${s.id}">View Details</button>
        `;
        el.appendChild(card);
    });

    // Add modal listeners
    el.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            const service = services.find(x => x.id === btn.dataset.id);
            if (service) {
                document.getElementById('viewModalTitle').textContent = service.name;
                document.getElementById('viewModalBody').innerHTML = `<div style="text-align:center;margin-bottom:10px"><img src="${service.image}" style="max-width:100%;border-radius:8px;"></div><p>${service.fullDescription}</p>`;
                document.getElementById('viewModalMeta').innerHTML = `<strong>Price:</strong> ₱${service.price} &nbsp; <strong>Duration:</strong> ${service.duration} mins`;
                document.getElementById('viewServiceModal').style.display = 'flex';
            }
        });
    });
}

function renderActiveOffers() {
    const el = document.getElementById('activeOffers');
    if (!el) return;
    if (!offers.length) {
        el.innerHTML = '<p class="small muted">No active offers</p>';
        return;
    }
    el.innerHTML = offers.map(o => `<div class="small"><strong>${escapeHtml(o.name)}</strong> - ${o.discount}% OFF</div>`).join('');
}

function renderAnalytics() {
    if (!document.getElementById('analytics')) return;

    // Top service
    const serviceCounts = {};
    bookings.forEach(b => {
        serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1;
    });
    const topService = Object.entries(serviceCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
    document.getElementById('topService').textContent = topService[0] || 'None';

    // Peak day
    const dayCounts = {};
    bookings.forEach(b => {
        const day = new Date(b.date).getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const peakDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Object.entries(dayCounts).reduce((a, b) => a[1] > b[1] ? a : b, [0, 0])[0]];
    document.getElementById('peakDay').textContent = peakDay || 'None';

    // Avg revenue
    const confirmedRev = bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + Number(b.price || 0), 0);
    const avgRev = confirmedRev / Math.max(bookings.length, 1);
    document.getElementById('avgRevenue').textContent = '₱' + avgRev.toFixed(0);

    // Conversion rate
    const conversion = (bookings.filter(b => b.status === 'confirmed').length / Math.max(bookings.length, 1)) * 100;
    document.getElementById('conversionRate').textContent = conversion.toFixed(1) + '%';

    // Revenue chart
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx) {
        const serviceRev = {};
        bookings.filter(b => b.status === 'confirmed').forEach(b => {
            serviceRev[b.service] = (serviceRev[b.service] || 0) + Number(b.price || 0);
        });
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(serviceRev),
                datasets: [{ data: Object.values(serviceRev), backgroundColor: ['#2e7d32', '#43a047', '#66bb6a', '#a5d6a7', '#c8e6c9'] }]
            }
        });
    }

    // Revenue table
    const tableBody = document.getElementById('revenueTable');
    if (tableBody) {
        tableBody.innerHTML = Object.entries(serviceRev).map(([service, rev]) => {
            const count = bookings.filter(b => b.service === service).length;
            return `<tr><td>${escapeHtml(service)}</td><td>${count}</td><td>₱${rev.toLocaleString()}</td></tr>`;
        }).join('') || '<tr><td colspan="3">No data</td></tr>';
    }
}

    function renderLatestBookings() {
        const tbody = document.getElementById('latestBookingsTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const latestBookings = bookings.slice(-5).reverse();

        if (!latestBookings.length) {
            tbody.innerHTML = '<tr><td colspan="6">No recent bookings.</td></tr>';
            return;
        }

        latestBookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(b.name)}</td>
                <td>${escapeHtml(b.service)}</td>
                <td>${escapeHtml(b.vehicle)}</td>
                <td>${escapeHtml(b.date)} ${escapeHtml(b.time)}</td>
                <td>₱${escapeHtml(b.price)}</td>
                <td>${escapeHtml(b.status)}</td>
            `;
            tbody.appendChild(tr);
        });
    }



    document.getElementById('addServiceBtn').onclick = () => {
        openModal();
    };
    
    function openModal (service) {
        const serviceModal = document.getElementById('serviceModal');
        serviceModal.style.display = 'flex';
        if (service) {
            document.getElementById('modalTitle').textContent = 'Edit Service';
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceName').value = service.name;
            document.getElementById('servicePrice').value = service.price;
            document.getElementById('serviceDuration').value = service.duration;
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('serviceFullDescription').value = service.fullDescription;
            document.getElementById('serviceImage').value = service.image;
        } else {
            document.getElementById('modalTitle').textContent = 'Add Service';
            document.getElementById('serviceForm').reset();
            document.getElementById('serviceId').value = '';
        }
    }

    document.getElementById('addServiceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('serviceId').value;
        const serviceData = {
            name: document.getElementById('serviceName').value,
            price: Number(document.getElementById('servicePrice').value),
            duration: Number(document.getElementById('serviceDuration').value),
            description: document.getElementById('serviceDescription').value,
            fullDescription: document.getElementById('serviceFullDescription').value,
            image: document.getElementById('serviceImage').value || 'https://via.placeholder.com/300x150?text=Custom+Wash'
        };

        if(id) {
            //update
        } else {
            //add
        }

        try {
            const response = await fetchWithAuth(id ? `/api/admin/services/${id}` : '/api/admin/services', {
                method: id? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serviceData)
            });

            if (response.ok) {
                await loadData();
                renderServices();
                updateStats();
                document.getElementById('serviceModal').style.display = 'none';
                document.getElementById('addServiceForm').reset();
                showSuccessPopup(`Service ${id ? 'updated' : 'added'} successfully!`);
            } else {
                alert(`Failed to ${id ? 'update' : 'add'} service.`);
            }
        } catch (error) {
            console.error(`Add/update service error:`, error);
            alert(`An error occurred while ${id ? 'updating' : 'adding'} the service.`);
        }
    });

    document.getElementById('addOfferBtn').onclick = () => {
        document.getElementById('addOfferModal').style.display = 'flex';
    };

    document.getElementById('addOfferForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('offerName').value;
        const disc = document.getElementById('offerDiscount').value;
        if (name && disc) {
            if (confirm('Are you sure you want to add this offer?')) {
                offers.push({ id: 'o' + Date.now(), name, discount: disc });
                saveAll();
                renderOffers();
                updateStats();
                document.getElementById('addOfferModal').style.display = 'none';
                document.getElementById('addOfferForm').reset();
                showSuccessPopup('Offer added successfully!');
            }
        }
    });


    renderBookings(); 
    renderOffers(); 
    updateStats(); 
    renderLatestBookings(); 
    renderServices(); 
    renderAnalytics();
}

    function escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    // Auth check - redirect if not logged in
    function checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Login function for login.html
    window.login = async function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const msg = document.getElementById('msg');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const { token } = await response.json();
                localStorage.setItem('adminToken', token);
                window.location.href = 'dashboard.html';
            } else {
                msg.textContent = 'Invalid credentials';
                msg.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            msg.textContent = 'An error occurred during login.';
            msg.style.display = 'block';
        }
    };

    // New booking form logic
    const serviceEl = document.getElementById("service");
    const dateEl = document.getElementById("date");
    const timeEl = document.getElementById("time");
    const bookBtn = document.getElementById("bookBtn");
    const msgEl = document.getElementById("msg");
    const vehicleTypeSelect = document.getElementById("vehicleType");
    const otherVehicleInput = document.getElementById("otherVehicleType");
    const viewBookingsBtn = document.getElementById('viewBookingsBtn');
    const bookingList = document.getElementById('bookingList');

    if(viewBookingsBtn){
        viewBookingsBtn.addEventListener('click', () => {
            bookingList.classList.toggle('hidden');
        });
    }

    if (vehicleTypeSelect) {
        vehicleTypeSelect.addEventListener("change", () => {
            if (vehicleTypeSelect.value === "other") {
                otherVehicleInput.style.display = "block";
            } else {
                otherVehicleInput.style.display = "none";
                otherVehicleInput.value = "";
            }
        });
    }

    if (dateEl) {
        dateEl.setAttribute("min", new Date().toISOString().split("T")[0]);
    }
    
    function loadServicesForBooking() {
        if (serviceEl) {
            serviceEl.innerHTML = '<option value="">Choose Service</option>';
            services.forEach(s => {
                const o = document.createElement("option");
                o.value = s.id;
                o.textContent = `${s.name} - ₱${s.price}`;
                o.dataset.price = s.price;
                o.dataset.duration = s.duration;
                o.dataset.description = s.description;
                serviceEl.appendChild(o);
            });
        }
    }

    function formatTime12(time24) {
        if(!time24) return "";
        const [hour, minute] = time24.split(":");
        let h = parseInt(hour);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h}:${minute} ${ampm}`;
    }

    function showErrorPopup(message) {
        const overlay = document.createElement("div");
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;";

        overlay.innerHTML = `
            <div style="background:white; padding:20px; border-radius:12px; text-align:center; max-width:300px; color:#333;">
                <h3 style="color:#b91c1c; margin-bottom:10px;">Invalid Time</h3>
                <p style="margin:15px 0; color:#555;">${message}</p>
                <button id="errorOkBtn" class="primary" style="padding:8px 16px; background-color:#b91c1c; border:none; color:white;">OK</button>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector("#errorOkBtn").onclick = () => overlay.remove();
        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    }

    function showBookingPopup(message, onConfirm) {
        const overlay = document.createElement("div");
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;";
        overlay.innerHTML = `
            <div style="background:white; padding:20px; border-radius:12px; text-align:center; max-width:300px; color:#333;">
                <p>${message}</p>
                <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
                    <button id="confirmBtn" class="primary" style="padding:8px 16px;">Confirm</button>
                    <button id="cancelBtn" style="padding:8px 16px;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector("#confirmBtn").onclick = () => {
            onConfirm();
            overlay.remove();
        };
        overlay.querySelector("#cancelBtn").onclick = () => overlay.remove();
    }

    async function submitBooking() {
        const svcOpt = serviceEl.selectedOptions[0];
        const date = dateEl.value;
        const time = timeEl.value;
        const vehicleType = vehicleTypeSelect.value === "other" ? otherVehicleInput.value : vehicleTypeSelect.value;
        const vehicleModel = document.getElementById("vehicleModel").value;
        const customerName = document.getElementById("customerName").value;
        const email = document.getElementById("email").value;

        if (!svcOpt.value || !date || !time || !customerName) return showMsg("Please complete the form.", false);

        if (time < "09:00" || time > "18:00") {
            return showErrorPopup("Please select a time between 9:00 AM to 6:00 PM.");
        }

        const formattedTime = formatTime12(time);

        const newBooking = {
            id: '_' + Math.random().toString(36).substr(2, 9),
            service: svcOpt.textContent.split(" - ")[0],
            vehicle: `${vehicleType} - ${vehicleModel}`,
            date,
            time: formattedTime,
            price: svcOpt.dataset.price,
            status: "confirmed", // Walk-in bookings are confirmed by default
            name: customerName,
            email: email,
        };

        showBookingPopup(`<b>Service:</b> ${svcOpt.textContent}<br><b>Time:</b> ${formattedTime}<br>Proceed?`, async () => {
            try {
                const response = await fetchWithAuth('/api/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBooking)
                });
                const result = await response.json();

                if (response.ok) {
                    await loadData();
                    renderBookings();
                    updateStats();
                    clearBookingForm();
                    showSuccessPopup("Booking confirmed!");
                } else {
                    showMsg(result.message || "Booking failed.", false);
                }
            } catch (error) {
                console.error("Booking error:", error);
                showMsg("An error occurred. Please try again.", false);
            }
        });
    }

    function clearBookingForm() {
        serviceEl.value = "";
        vehicleTypeSelect.value = "";
        
        dateEl.value = "";
        timeEl.value = "";
        document.getElementById("vehicleModel").value = "";
        document.getElementById("plateNumber").value = "";
        document.getElementById("customerName").value = "";
        document.getElementById("email").value = "";
        document.getElementById("notes").value = "";
        
        if (otherVehicleInput) {
            otherVehicleInput.value = "";
            otherVehicleInput.style.display = "none";
        }

        const pricePreview = document.getElementById("pricePreview");
        if (pricePreview) pricePreview.textContent = "";
    }
    
    function showConfirmPopup(message, onConfirm) {
        const overlay = document.createElement("div");
        overlay.className = 'modal-backdrop show'; 
        overlay.style.zIndex = "10000";
        
        overlay.innerHTML = `
            <div class="modal-card" style="border-top: 5px solid #28a745; text-align:center;">
                <h3 style="color: #28a745;">Confirm Reset</h3>
                <p style="margin: 15px 0; color: #555;">${message}</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button id="confirmResetYes" class="primary" style="padding:10px 20px; background-color: #28a745; border:none;">Yes, Reset</button>
                    <button id="confirmResetNo" class="btn-cancel" style="padding:10px 20px;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector("#confirmResetYes").onclick = () => {
            onConfirm();
            overlay.remove();
        };
        overlay.querySelector("#confirmResetNo").onclick = () => overlay.remove();
        
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    }

    if (bookBtn) bookBtn.addEventListener("click", submitBooking);

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            showConfirmPopup(
                "Are you sure you want to clear all the booking details you've entered?",
                () => {
                    clearBookingForm();
                    showMsg("Form cleared successfully.", true);
                }
            );
        });
    }

    function showMsg(txt, success = true) {
        if (!msgEl) return;
        msgEl.textContent = txt;
        msgEl.style.color = success ? "#0f5132" : "#b91c1c";
        msgEl.style.display = "block";
        setTimeout(() => { msgEl.style.display = "none"; }, 4000);
    }
    
    // Start
    if (checkAuth()) {
        showPage('dashboard').then(() => {
            loadServicesForBooking();
        });
    }

})();
