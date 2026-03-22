function showServerErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'server-error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

const LS_BOOK = "demoBookings_v1";
const LS_FEEDBACK = "demoFeedback_v1"; 

let servicesList = []; // Global services cache

// FORCE FALLBACK - immediate load
servicesList = [
  {
      _id: "basic_wash",
      name: "Basic Wash",
      price: 200,
      duration: 30,
      description: "Quick exterior wash",
      fullDescription: "Our Basic Wash includes exterior hand wash, rims and tire cleaning, hand drying, and light interior vacuum.",
      image: "./image/basic_wash.jpg",
  },
  {
      _id: "deluxe_wash",
      name: "Deluxe Wash",
      price: 400,
      duration: 60,
      description: "Full exterior & interior clean", 
      fullDescription: "Deluxe Wash includes everything in Basic plus detailed interior cleaning.",
      image: "./image/Deluxe_Wash.jpg",
  },
  {
      _id: "wax_polish",
      name: "Wax & Polish",
      price: 800,
      duration: 90,
      description: "Protect and shine your car",
      fullDescription: "Premium carnauba wax and polish protection.",
      image: "./image/Wax_&_Polish.jpg",
  },
  {
      _id: "interior_detail",
      name: "Interior Detailing",
      price: 700,
      duration: 120,
      description: "Deep interior cleaning",
      fullDescription: "Complete interior shampoo and conditioning.",
      image: "./image/Interior_Detailing.jpg",
  },
  {
      _id: "engine_clean",
      name: "Engine Cleaning", 
      price: 900,
      duration: 60,
      description: "Safe engine wash",
      fullDescription: "Engine bay degrease and protection.",
      image: "./image/Engine_Cleaning.jpg",
  },
  {
      _id: "tire_shine",
      name: "Tire & Rim Shine",
      price: 150,
      duration: 20,
      description: "Clean & glossy tires",
      fullDescription: "Premium tire dressing and rim cleaning.",
      image: "./image/tire_shine.jpg",
  },
  {
      _id: "headlight_restore",
      name: "Headlight Restoration",
      price: 300,
      duration: 45,
      description: "Restore headlight clarity",
      fullDescription: "Remove oxidation, restore night visibility.",
      image: "./image/Headlight_restoration.jpg",
  },
  {
      _id: "scratch_removal",
      name: "Scratch Removal",
      price: 1200,
      duration: 90,
      description: "Minor scratch repair",
      fullDescription: "Paint correction for light swirls/scratches.",
      image: "./image/scratch_removal.jpg",
  },
  {
      _id: "ceramic_coating",
      name: "Ceramic Coating",
      price: 5000,
      duration: 180,
      description: "Long-term paint protection",
      fullDescription: "Hydrophobic nano coating for 2+ years protection.",
      image: "./image/Ceramic_coating.jpg",
  },
  {
      _id: "special_offer",
      name: "Special Offer Service",
      price: 999,
      duration: 180,
      description: "Limited-time premium service",
      fullDescription: "Full Deluxe + Wax + Interior + Engine special!",
      image: "./image/sp.png",
  }
];
console.log('✅ Services fallback loaded:', servicesList.length);

// Fetch services dynamically from server
async function loadServicesDynamic() {
  try {
    const response = await fetch('/api/services');
    if (response.ok) {
      servicesList = await response.json();
      console.log('Services loaded from server:', servicesList.length);
    } else {
      console.warn('Server /api/services failed (' + response.status + '), using fallback data');
      servicesList = [
    {
        _id: "basic_wash",
        name: "Basic Wash",
        price: 200,
        duration: 30,
        description: "Quick exterior wash",
        fullDescription: "Our Basic Wash includes exterior hand wash, rims and tire cleaning, hand drying, and light interior vacuum. Perfect for weekly maintenance to keep your car looking fresh.",
        image: "./image/basic_wash.jpg",
    },
    {
        _id: "deluxe_wash",
        name: "Deluxe Wash",
        price: 400,
        duration: 60,
        description: "Full exterior & interior clean",
        fullDescription: "Deluxe Wash includes everything in Basic Wash plus detailed interior cleaning, dashboard wipe down, interior windows, and tire dressing. Ideal for complete cleaning experience.",
        image: "./image/Deluxe_Wash.jpg",
    },
    {
        _id: "wax_polish",
        name: "Wax & Polish",
        price: 800,
        duration: 90,
        description: "Protect and shine your car",
        fullDescription: "Applies premium carnauba wax and polish to exterior after thorough wash. Enhances paint shine, adds protective layer against UV and dirt, includes interior vacuuming.",
        image: "./image/Wax_&_Polish.jpg",
    },
    {
        _id: "interior_detail",
        name: "Interior Detailing",
        price: 700,
        duration: 120,
        description: "Deep interior cleaning",
        fullDescription: "Complete interior cleaning including vacuuming carpets/seats, shampooing fabric seats, cleaning leather, wiping dashboards, vents, and panels. Removes odors and stains effectively.",
        image: "./image/Interior_Detailing.jpg",
    },
    {
        _id: "engine_clean",
        name: "Engine Cleaning",
        price: 900,
        duration: 60,
        description: "Safe engine wash",
        fullDescription: "Careful engine compartment cleaning using degreasers and high-pressure water where safe. Removes grime and protects engine parts for better performance and longevity.",
        image: "./image/Engine_Cleaning.jpg",
    },
    {
        _id: "tire_shine",
        name: "Tire & Rim Shine",
        price: 150,
        duration: 20,
        description: "Clean & glossy tires",
        fullDescription: "We clean and shine all tires and rims using premium tire dressing products. Removes dirt and adds long-lasting glossy finish.",
        image: "./image/tire_shine.jpg",
    },
    {
        _id: "headlight_restore",
        name: "Headlight Restoration",
        price: 300,
        duration: 45,
        description: "Restore headlight clarity",
        fullDescription: "Removes oxidation and yellowing from headlights, restoring brightness and safety during night driving.",
        image: "./image/Headlight_restoration.jpg",
    },
    {
        _id: "scratch_removal",
        name: "Scratch Removal",
        price: 1200,
        duration: 90,
        description: "Minor scratch repair",
        fullDescription: "Removes minor scratches and swirls using polishing compounds. Improves car appearance without repainting.",
        image: "./image/scratch_removal.jpg",
    },
    {
        _id: "ceramic_coating",
        name: "Ceramic Coating",
        price: 5000,
        duration: 180,
        description: "Long-term paint protection",
        fullDescription: "Applies premium ceramic coating to protect paint from UV rays, dirt, and minor scratches. Enhances gloss and makes cleaning easier. Includes wash and prep.",
        image: "./image/Ceramic_coating.jpg",
    },
    {
        _id: "special_offer",
        name: "Special Offer Service",
        price: 999,
        duration: 180,
        description: "Limited-time premium service",
        fullDescription: "Our Special Offer Service is designed for car enthusiasts who want everything done in one go! This includes full exterior wash, premium wax & polish, deep interior detailing, tire & rim shine, engine cleaning, headlight restoration, and minor scratch removal. Perfect for restoring your vehicle to showroom condition. This service is only available for a limited period, so grab it while you can!",
        image: "./image/sp.png",
    },
];
    }
    if (document.readyState !== "loading") {
      loadServices();
      if (typeof loadBookings === "function") {
        loadBookings();
      }
    }
  } catch (error) {
    console.error("Error loading services:", error);
    if (document.readyState !== "loading") {
      loadServices();
      if (typeof loadBookings === "function") {
        loadBookings();
      }
    }
  }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text ? text.toString().replace(/[&<>"']/g, (m) => map[m]) : "";
}
function lsGet(key, def = []) {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(def));
}
function lsSet(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
}
function nowId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function getClientIdentity() {
    const username = localStorage.getItem("clientUsername") || "";
    const email = localStorage.getItem("clientEmail") || "";
    const legacyUsername = localStorage.getItem("clientIdentityUsername") || username;
    const legacyEmail = localStorage.getItem("clientIdentityEmail") || email;

    if (legacyUsername && !localStorage.getItem("clientIdentityUsername")) {
        localStorage.setItem("clientIdentityUsername", legacyUsername);
    }
    if (legacyEmail && !localStorage.getItem("clientIdentityEmail")) {
        localStorage.setItem("clientIdentityEmail", legacyEmail);
    }

    return { username, email, legacyUsername, legacyEmail };
}

function buildIdentityQuery() {
    const { username, email, legacyUsername, legacyEmail } = getClientIdentity();
    const params = new URLSearchParams();

    if (username) params.set("username", username);
    if (email) params.set("email", email);
    if (legacyUsername) params.set("legacyUsername", legacyUsername);
    if (legacyEmail) params.set("legacyEmail", legacyEmail);

    return params.toString();
}

function compressImageForFeedback(file, maxDimension = 1280, quality = 0.72) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error("Could not read the selected image."));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error("Could not process the selected image."));
            img.onload = () => {
                let { width, height } = img;

                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else if (height >= width && height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not prepare the image for upload."));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };

            img.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

function syncSelectedServiceOption(serviceId, serviceName, price = "", duration = "") {
    const serviceSelect = document.getElementById("service");
    if (!serviceSelect) return;

    const normalizedName = `${serviceName || ""}`.trim().toLowerCase();
    const normalizedId = `${serviceId || ""}`.trim();

    let matchingOption = Array.from(serviceSelect.options).find(option => {
        const optionName = option.textContent.split(" - ")[0].trim().toLowerCase();
        return (normalizedId && option.value === normalizedId) || (normalizedName && optionName === normalizedName);
    });

    if (!matchingOption && (normalizedName || normalizedId)) {
        matchingOption = document.createElement("option");
        matchingOption.value = normalizedId || `saved_${Date.now()}`;
        matchingOption.textContent = normalizedName
            ? `${serviceName}${price ? ` - ₱${price}` : ""}`
            : matchingOption.value;
        if (price !== "") matchingOption.dataset.price = price;
        if (duration !== "") matchingOption.dataset.duration = duration;
        serviceSelect.appendChild(matchingOption);
    }

    if (!matchingOption) return;

    serviceSelect.value = matchingOption.value;
    serviceSelect.dataset.selectedServiceName = serviceName || "";
    serviceSelect.dataset.selectedServiceValue = matchingOption.value;
    serviceSelect.dispatchEvent(new Event("change"));
}

document.addEventListener("DOMContentLoaded", async () => {
    const username = localStorage.getItem("clientUsername");
    const token = localStorage.getItem("clientToken");
    if (!username || !token) {
        showServerErrorToast("Please log in to access dashboard.");
        setTimeout(() => {
        window.location.href = '/client/login.html';
        }, 2000);
        return;
    }
    console.log('Dashboard loaded for user:', username);
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            sidebar.classList.toggle('mobile-sidebar');
            sidebar.classList.toggle('active');
            
            // Add overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }
            overlay.classList.toggle('active');
        });
        
        // Close on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sidebar-overlay')) {
                hamburger.classList.remove('active');
                sidebar.classList.remove('mobile-sidebar', 'active');
                e.target.classList.remove('active');
            }
        });
        
        // Keyboard support
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });
    }
    // Header/Sidebar elements
    const nameEl = document.getElementById("name"); 
    const profileUserEl = document.getElementById("profileUser"); 
    const sidebarProfilePic = document.querySelector(".sidebar-profile-pic"); // Ensure you have this class in HTML
    const headerProfilePic = document.querySelector(".header-profile-pic");   // Ensure you have this class in HTML

// Sidebar navigation - with active states
    let currentActiveBtn = null;
    function initSidebar() {
      const btnMap = {
        'overviewBtn': 'dashboardPage',
        'bookServiceBtn': 'bookPage',
        'myBookingsBtn': 'bookingsPage',
        'feedbackBtn': 'feedbackPage',
        'profileBtn': 'profileViewPage'
      };
      Object.entries(btnMap).forEach(([btnId, pageId]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
          btn.addEventListener('click', () => {
            console.log(`Button clicked: ${btnId} → ${pageId}`);
            showPage(pageId);
            // Visual feedback
            if (currentActiveBtn) currentActiveBtn.classList.remove('active');
            btn.classList.add('active');
            currentActiveBtn = btn;
          });
        }
      });
      // Default: activate Overview
      const overviewBtn = document.getElementById('overviewBtn');
      if (overviewBtn) {
        overviewBtn.classList.add('active');
        currentActiveBtn = overviewBtn;
      }
    }

    const profileForm = document.getElementById("profileForm");

    const profilePictureInput = document.getElementById("profilePictureInput");
    const profilePicturePreview = document.getElementById("profilePicturePreview");
    
    // Services/Bookings
    const serviceEl = document.getElementById("service");
    const dateEl = document.getElementById("date");
    const timeEl = document.getElementById("time");
    const bookBtn = document.getElementById("bookBtn");
    const msgEl = document.getElementById("msg");
    const bookingsTbody = document.getElementById("bookings");
    const statUpcoming = document.getElementById("statUpcoming");
    const statPending = document.getElementById("statPending");
    const statConfirmed = document.getElementById("statConfirmed");
    const statRevenue = document.getElementById("statRevenue");
    const servicesOverview = document.getElementById("servicesOverview");
    
    // Modal
    const modal = document.getElementById("serviceModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modalMeta = document.getElementById("modalMeta");
    const modalClose = document.getElementById("modalClose");
    const modalBook = document.getElementById("modalBook");
    const logoutBtn = document.getElementById("logoutBtn");

    // Force close any stuck modal on page load
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        console.log("Modal force-closed on load");
    }

    const feedbackForm = document.getElementById("feedbackForm");
    const myFeedbacksEl = document.getElementById("myFeedbacks");

    // Profile View Page Elements
    const profileFullNameEl = document.getElementById("profileFullName");
    const viewEmail = document.getElementById("viewEmail");
    const viewNumber = document.getElementById("viewNumber");
    const viewUsernameHeader = document.getElementById("viewUsername");
    const displayUsername = document.getElementById("displayUsername");
    const profilePictureView = document.getElementById("profilePictureView");

    function loadProfileView() {
    const name = localStorage.getItem("clientName") || "";
    const user = localStorage.getItem("clientUsername") || "";
    const email = localStorage.getItem("clientEmail") || "-";
    const number = localStorage.getItem("clientNumber") || "-";
    const pic = localStorage.getItem("clientProfilePicture") || "../image/default-profile.png";

    if (timeEl) {
    timeEl.setAttribute("min", "09:00"); // 9 AM
    timeEl.setAttribute("max", "18:00"); // 6 PM
}

    // Header/Sidebar: show username only
    if (nameEl) nameEl.textContent = user; 
    if (profileUserEl) profileUserEl.textContent = user;

    // Profile picture section
    const profileFullNameEl = document.getElementById("profileFullName");
    if (profileFullNameEl) profileFullNameEl.textContent = name;

    // Profile details grid
    const gridFullNameEl = document.getElementById("gridFullName");
    if (gridFullNameEl) gridFullNameEl.textContent = name;

    if (viewUsernameHeader) viewUsernameHeader.textContent = "@" + user;
    if (displayUsername) displayUsername.textContent = user;
    if (viewEmail) viewEmail.textContent = email;
    if (viewNumber) viewNumber.textContent = number;

    // Update profile images everywhere
    const allProfilePics = [profilePictureView, profilePicturePreview, sidebarProfilePic, headerProfilePic];
    allProfilePics.forEach(img => { if (img) img.src = pic; });
}
loadProfileView();
    initSidebar();

    const vehicleTypeSelect = document.getElementById("vehicleType");
    const otherVehicleInput = document.getElementById("otherVehicleType");

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
        const today = new Date().toISOString().split("T")[0];
        dateEl.setAttribute("min", today);
        dateEl.addEventListener('change', function() {
            // Auto-suggest next available time based on service duration
            const selectedService = serviceEl.selectedOptions[0];
            if (selectedService && selectedService.dataset.duration) {
                const duration = parseInt(selectedService.dataset.duration);
                console.log('Service duration:', duration, 'mins');
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const currentUsername = localStorage.getItem("clientUsername") || "";
            const currentEmail = localStorage.getItem("clientEmail") || "";
            const updatedUser = document.getElementById("profileUsername").value || "guest";
            const updatedName = document.getElementById("profileName").value || "Guest";
            const updatedEmail = document.getElementById("profileEmail").value || "-";
            const updatedNumber = document.getElementById("profileNumber").value || "-";

            if (currentUsername && !localStorage.getItem("clientIdentityUsername")) {
                localStorage.setItem("clientIdentityUsername", currentUsername);
            }
            if (currentEmail && !localStorage.getItem("clientIdentityEmail")) {
                localStorage.setItem("clientIdentityEmail", currentEmail);
            }

            localStorage.setItem("clientUsername", updatedUser);
            localStorage.setItem("clientName", updatedName);
            localStorage.setItem("clientEmail", updatedEmail);
            localStorage.setItem("clientNumber", updatedNumber);

            const saveAndShowSuccess = () => {
                loadProfileView();
                showPage("profileViewPage");
                showSuccessModal("Success", "Profile updated successfully!");
            };

            if (profilePictureInput.files && profilePictureInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    localStorage.setItem("clientProfilePicture", evt.target.result);
                    saveAndShowSuccess();
                };
                reader.readAsDataURL(profilePictureInput.files[0]);
            } else {
                saveAndShowSuccess();
            }
        });
    }

    function showSuccessModal(title, message) {
        const modal = document.getElementById("successModal");
        if (!modal) return;

        document.getElementById("successModalTitle").textContent = title;
        document.getElementById("successModalMessage").textContent = message;

        const closeBtn = document.getElementById("successModalClose");

        const closeHandler = () => {
            modal.style.display = "none";
            modal.removeEventListener("click", overlayClickHandler);
        };

        const overlayClickHandler = (e) => {
            if (e.target === modal) {
                closeHandler();
            }
        };

        closeBtn.onclick = closeHandler;
        modal.addEventListener("click", overlayClickHandler);

        modal.style.display = "flex";
    }


    // Live Preview in Edit Mode
    if (profilePictureInput) {
        profilePictureInput.addEventListener("change", function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = e => {
                    if (profilePicturePreview) profilePicturePreview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    function showPage(pageId) {
        ["dashboardPage","bookPage","bookingsPage","feedbackPage","servicesPanel","profileViewPage","profileEditPage"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = id === pageId ? "block" : "none";
        });

        const activeButtonMap = {
            dashboardPage: "overviewBtn",
            bookPage: "bookServiceBtn",
            bookingsPage: "myBookingsBtn",
            feedbackPage: "feedbackBtn",
            profileViewPage: "profileBtn",
            profileEditPage: "profileBtn"
        };

        const nextActiveBtn = document.getElementById(activeButtonMap[pageId]);
        if (currentActiveBtn && currentActiveBtn !== nextActiveBtn) {
            currentActiveBtn.classList.remove("active");
        }
        if (nextActiveBtn) {
            nextActiveBtn.classList.add("active");
            currentActiveBtn = nextActiveBtn;
        }
    }
    window.showPage = showPage;

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
window.location.href = "/client/login.html";
        });
    }

function closeModal() {
        if (modal) {
            modal.classList.remove("show");
            modal.style.display = 'none';
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = ''; // Restore scroll
            const sidebarOverlay = document.querySelector('.sidebar-overlay');
            if (sidebarOverlay) {
                sidebarOverlay.classList.remove('active');
            }
            console.log('✅ Modal properly closed with overlay cleanup');
        }
    }
    function openModal() {
        if (modal) {
            modal.style.display = "";
            modal.classList.add("show");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
            console.log('Modal opened');
        }
    }
// Robust event delegation for modal (prevents timing issues)
    document.addEventListener('click', function(e) {
        if (e.target.id === 'modalClose' || e.target.matches('.modal-backdrop')) {
            console.log('Modal close clicked');
            closeModal();
        }
        if (e.target.id === 'modalBook') {
            console.log('Modal book clicked');
            const serviceId = modalBook.dataset.serviceId;
            if (serviceId) {
                showPage("bookPage");
                serviceEl.value = serviceId;
                serviceEl.dispatchEvent(new Event("change"));
            }
            closeModal();
        }
    });
    
    if (modalBook) {
        modalBook.addEventListener("click", () => {
            const serviceId = modalBook.dataset.serviceId;
            showPage("bookPage");
            serviceEl.value = serviceId;
            serviceEl.dispatchEvent(new Event("change"));
            closeModal();
            document.getElementById("bookPage").scrollIntoView({ behavior: "smooth" });
        });
    }

function loadServices() {
    console.log('🔧 loadServices() called, servicesList:', servicesList.length);
    
    const servicesOverview = document.getElementById('servicesOverview');
    const serviceEl = document.getElementById('service');
    const previousServiceValue = serviceEl ? (serviceEl.dataset.selectedServiceValue || serviceEl.value) : "";
    const previousServiceName = serviceEl && serviceEl.selectedOptions[0]
        ? serviceEl.selectedOptions[0].textContent.split(" - ")[0].trim().toLowerCase()
        : ((serviceEl && serviceEl.dataset.selectedServiceName) || "").trim().toLowerCase();
    
    if (!servicesOverview) {
        console.error('❌ servicesOverview not found!');
        return;
    }
    
    // CRITICAL FIX: Complete loading cleanup - ensure services render IMMEDIATELY
    servicesOverview.innerHTML = ''; // Wipe everything first
    servicesOverview.classList.remove('loading', 'loading-spinner');
    servicesOverview.style.minHeight = '0';
    servicesOverview.style.display = 'grid';
    servicesOverview.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    servicesOverview.style.gap = '14px';
    
    console.log('✅ Services container reset and ready');

    // Populate dropdown
    if (serviceEl) {
        serviceEl.innerHTML = '<option value="">Choose Service</option>';
        servicesList.forEach(s => {
            const o = document.createElement("option");
            o.value = s._id;
            o.textContent = `${s.name} - ₱${s.price}`;
            o.dataset.price = s.price;
            o.dataset.duration = s.duration;
            o.dataset.description = s.description;
            serviceEl.appendChild(o);
        });
        
        // NEW: Live price preview and time validation
        serviceEl.onchange = function() {
            const selected = this.selectedOptions[0];
            const pricePreview = document.getElementById('pricePreview');
            if (pricePreview && selected) {
                pricePreview.textContent = `₱${selected.dataset.price || "0"}`;
            }
            
            // Keep the guidance aligned with the accepted booking window.
            if (selected && selected.dataset.duration) {
                showMsg("Booking hours are 09:00 AM to 06:00 PM only.", true);
            }
        };
        console.log('✅ Dropdown populated with live preview');
    }

    if (serviceEl && (previousServiceValue || previousServiceName)) {
        syncSelectedServiceOption(previousServiceValue, serviceEl.dataset.selectedServiceName || previousServiceName);
    }

    // Populate cards
    servicesList.forEach((s, index) => {
        const card = document.createElement("div");
        card.className = "service-card card";
        card.style = "display:flex; flex-direction:column; padding:12px; gap:8px;";
        card.innerHTML = `
            <div style="height:120px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#f6fff8">
                <img src="${s.image}" alt="${escapeHtml(s.name)}" style="max-height:100%; max-width:100%; object-fit:contain;" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjZmZmY4Ii8+PHRleHQgeD0iNTAlIiB5PSI5NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzRhN2EyMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';">
            </div>
            <div>
                <h4 style="margin:6px 0 4px">${escapeHtml(s.name)}</h4>
                <p class="small muted" style="margin-top:8px;">${escapeHtml(s.description || "Professional care for a cleaner, fresher vehicle.")}</p>
                <div class="small muted">₱${s.price} • ${s.duration} mins</div>
            </div>
            <div style="margin-top:auto;display:flex;justify-content:flex-end">
                <button class="primary btn-view">View</button>
            </div>
        `;
        
        // Safe modal bindings
        card.querySelector(".btn-view").onclick = () => {
            if (modalTitle && modalBody && modalMeta && modalBook) {
                modalTitle.textContent = s.name;
                modalBody.innerHTML = `
                    <div style="text-align:center;margin-bottom:12px"><img src="${s.image}" alt="${escapeHtml(s.name)}" style="max-width:100%;border-radius:8px;" onerror="this.style.display='none';"></div>
                    <p style="margin-bottom:12px;">${escapeHtml(s.fullDescription || s.description || "Professional car care service.")}</p>
                    <div style="background:#f7fbf7;border:1px solid #dcefdc;border-radius:12px;padding:12px;display:grid;gap:8px;">
                        <div><strong>Why customers choose this service</strong></div>
                        <div class="small muted">Reliable cleaning, careful handling, and a finish designed to keep your vehicle looking fresh and well-maintained.</div>
                        <div class="small muted">A good choice for drivers who want comfort, convenience, and a more satisfying car wash experience.</div>
                    </div>
                `;
                modalMeta.innerHTML = `<strong>Price:</strong> ₱${s.price} &nbsp; <strong>Duration:</strong> ${s.duration} mins`;
                modalBook.dataset.serviceId = s._id;
                if (typeof openModal === 'function') openModal();
            }
        };
        
        servicesOverview.appendChild(card);
        console.log(`✅ Added service ${index+1}: ${s.name}`);
    });
    
    console.log('🎉 loadServices() complete!');
}

let editingBookingId = null;
let originalBookBtnHandler = null;

async function loadBookings() {
    const { username, email, legacyUsername, legacyEmail } = getClientIdentity();
    if (!username && !email && !legacyUsername && !legacyEmail) {
        renderBookings([]);
        showServerErrorToast('Login expired. Redirecting...');
        setTimeout(() => window.location.href = '/client/login.html', 2000);
        return;
    }
    try {
        const response = await fetch(`/api/clientBookings?${buildIdentityQuery()}`);
        if (response.ok) {
            const list = await response.json();
            renderBookings(list);

            //-- NEW: Populate feedback dropdown
            const feedbackTopicEl = document.getElementById("feedbackTopic");
            if (feedbackTopicEl) {
              const previouslySelectedTopic = feedbackTopicEl.value;
              feedbackTopicEl.innerHTML = '<option value="">-- Select a booking or service --</option>'; // Clear previous
              
              // Add completed bookings
              const completedBookings = list.filter(b => b.status === 'completed');
              if (completedBookings.length > 0) {
                const bookingGroup = document.createElement('optgroup');
                bookingGroup.label = "My Completed Bookings";
                completedBookings.forEach(b => {
                  const option = document.createElement('option');
                  option.value = b._id;
                  option.textContent = `${b.service} on ${formatReadableDate(b.date)}`;
                  bookingGroup.appendChild(option);
                });
                feedbackTopicEl.appendChild(bookingGroup);
              }

              // Add general services
              const serviceGroup = document.createElement('optgroup');
              serviceGroup.label = "General Services";
              Array.from(serviceEl.options)
                .filter(serviceOption => serviceOption.value)
                .forEach(serviceOption => {
                const feedbackOption = document.createElement('option');
                feedbackOption.value = `service_${serviceOption.value}`; // Prefix to distinguish from booking IDs
                feedbackOption.textContent = serviceOption.textContent;
                serviceGroup.appendChild(feedbackOption);
              });
              feedbackTopicEl.appendChild(serviceGroup);

              if (previouslySelectedTopic) {
                const matchingTopic = Array.from(feedbackTopicEl.options).find(option => option.value === previouslySelectedTopic);
                if (matchingTopic) {
                  feedbackTopicEl.value = previouslySelectedTopic;
                }
              }
            }
            //-- END NEW

            // Cache in localStorage
            lsSet(LS_BOOK, list);
        } else {
            // Fallback to localStorage
            renderBookings(lsGet(LS_BOOK, []));
        }
    } catch (error) {
        console.error("Load bookings error:", error);
        renderBookings(lsGet(LS_BOOK, []));
    }
}
function renderBookings(list) {
    // Filter to upcoming (future dates) + limit 10 most recent
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let upcomingBookings = list.filter(b => {
        if (!b.date) return false;
        const bookingDate = new Date(b.date + 'T00:00:00');
        return bookingDate >= today;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
    
    // Stats from ALL bookings (unfiltered)
    const allUpcoming = list.filter(b => b.status !== "completed");
    const allPending = list.filter(b => b.status === "pending");
    const allConfirmed = list.filter(b => b.status === "confirmed");
    const revenue = list.reduce((s, b) => s + (Number(b.price) || 0), 0);

        if (statUpcoming) statUpcoming.textContent = allUpcoming.length;
        if (statPending) statPending.textContent = allPending.length;
        if (statConfirmed) statConfirmed.textContent = allConfirmed.length;
        if (statRevenue) statRevenue.textContent = "₱" + revenue;

        if (bookingsTbody) {
            bookingsTbody.innerHTML = upcomingBookings.length ? "" : '<tr><td colspan="8">No upcoming bookings</td></tr>'; 
            list.forEach(b => {
                const tr = document.createElement("tr");
                let actionsHtml = '<button data-id="' + b._id + '" class="cancelBtn btn-danger">Cancel</button>';
                if (b.status === "pending") {
                    actionsHtml = '<button data-id="' + b._id + '" class="editBtn btn-primary small">Edit</button> ' + actionsHtml;
                }
                
                tr.innerHTML = `
                    <td>${escapeHtml(b.service)}</td>
                    <td>${escapeHtml((b.vehicleType || '') + (b.vehicleModel ? ' ' + b.vehicleModel : '')) || 'N/A'}</td>
                    <td>${escapeHtml(b.plateNumber || '-')}</td>
                    <td>${formatReadableDate(b.date)}</td>
                    <td>${escapeHtml(formatTime12(b.time))}</td>
                    <td>${escapeHtml(b.status)}</td>
                    <td title="${escapeHtml(b.notes || b.location || 'No notes')}">${escapeHtml((b.notes || '').substring(0,30) + (b.notes && b.notes.length > 30 ? '...' : '') || (b.location ? '📍 Loc' : '-'))}</td>
                    <td>${actionsHtml}</td>
                `;

                tr.onclick = (e) => { 
                    if (!e.target.classList.contains("cancelBtn") && !e.target.classList.contains("editBtn")) {
                        showBookingDetails(b); 
                    }
                };
                bookingsTbody.appendChild(tr);
            });

            // Cancel buttons
            document.querySelectorAll(".cancelBtn").forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const bookingId = btn.dataset.id;
                    const identityQuery = buildIdentityQuery();
                    if (!identityQuery) {
                        alert("Please login first");
                        return;
                    }
                    
                    showDeleteBookingPopup("Are you sure you want to cancel this booking?", async () => {
                        try {
                            const response = await fetch(`/api/book/${bookingId}?${identityQuery}`, {
                                method: 'DELETE'
                            });
                            const result = await response.json();
                            
                            if (response.ok) {
                                console.log("Booking cancelled:", result.message);
                                loadBookings(); // Refresh from server
                            } else {
                                alert("Cancel failed: " + (result.message || "Unknown error"));
                            }
                        } catch (error) {
                            console.error("Delete error:", error);
                            alert("Network error. Please try again.");
                            // Fallback to LS delete
                            let list = lsGet(LS_BOOK, []);
                            list = list.filter(x => x._id !== bookingId);
                            lsSet(LS_BOOK, list);
                            loadBookings();
                        }
                    });
                };
            });

            // Edit buttons - only for pending
            document.querySelectorAll(".editBtn").forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    const bookingId = btn.dataset.id;
                    startEdit(bookingId);
                };
            });
        }
    }

    async function startEdit(bookingId) {
        editingBookingId = bookingId;
        
        // Fetch current booking details from server
        try {
            const response = await fetch(`/api/book/${bookingId}`);
            const booking = await response.json();
            
            if (!response.ok) {
                showMsg(booking.message || "Failed to load booking", false);
                return;
            }

            // Populate form
            if (serviceEl.options.length <= 1) {
                loadServices();
            }

            const bookingServiceName = `${booking.service || ""}`.trim();
            const serviceInfo = servicesList.find(s =>
                s.name === booking.service ||
                s._id === booking.service ||
                `${s.name}`.trim().toLowerCase() === bookingServiceName.toLowerCase()
            );

            if (serviceInfo) {
                syncSelectedServiceOption(serviceInfo._id, serviceInfo.name, serviceInfo.price, serviceInfo.duration);
            } else {
                const matchingOption = Array.from(serviceEl.options).find(option => {
                    const optionLabel = option.textContent.split(" - ")[0].trim().toLowerCase();
                    return optionLabel === bookingServiceName.toLowerCase();
                });

                if (matchingOption) {
                    syncSelectedServiceOption(matchingOption.value, bookingServiceName, matchingOption.dataset.price || booking.price || "", matchingOption.dataset.duration || "");
                } else if (bookingServiceName) {
                    syncSelectedServiceOption(`saved_${bookingId}`, bookingServiceName, booking.price || "", "");
                } else {
                    serviceEl.value = "";
                }
            }

            dateEl.value = booking.date || '';
            
            // Convert 12h/24h to 24h for time input (robust parsing)
            const rawTime = (booking.time || "").trim();
            let timeMatch = rawTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); // 12h first
            if (!timeMatch) {
                timeMatch = rawTime.match(/(\d{1,2}):(\d{2})/); // Fallback 24h
            }
            if (timeMatch) {
                let [ , h, m, ampm = '' ] = timeMatch;
                h = parseInt(h);
                m = parseInt(m);
                if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
                if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
                timeEl.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            } else {
                console.warn('Invalid time format:', booking.time);
                timeEl.value = '';
            }
            
            const savedVehicleType = booking.vehicleType || '';
            const hasPresetVehicleType = Array.from(vehicleTypeSelect.options).some(option => option.value === savedVehicleType);
            vehicleTypeSelect.value = hasPresetVehicleType ? savedVehicleType : (savedVehicleType ? 'other' : '');

            if (vehicleTypeSelect.value === 'other') {
                otherVehicleInput.style.display = 'block';
                otherVehicleInput.value = savedVehicleType;
            } else if (otherVehicleInput) {
                otherVehicleInput.style.display = 'none';
                otherVehicleInput.value = '';
            }
            document.getElementById("vehicleModel").value = booking.vehicleModel || '';
            document.getElementById("plateNumber").value = booking.plateNumber || '';
            document.getElementById("location").value = booking.location || '';
            document.getElementById("email").value = booking.email || '';
            document.getElementById("notes").value = booking.notes || '';

            // Update button
            originalBookBtnHandler = bookBtn.onclick;
            bookBtn.textContent = "Update Booking";
            bookBtn.onclick = updateBooking;
            
            // Add cancel edit button
            let cancelEditBtn = document.getElementById('cancelEditBtn');
            if (!cancelEditBtn) {
                cancelEditBtn = document.createElement('button');
                cancelEditBtn.id = 'cancelEditBtn';
                cancelEditBtn.className = 'btn-cancel';
                cancelEditBtn.textContent = 'Cancel Edit';
                cancelEditBtn.style.marginLeft = '10px';
                bookBtn.parentNode.appendChild(cancelEditBtn);
            }
            cancelEditBtn.onclick = cancelEdit;
            
            showPage("bookPage");
            showEditModePopup("You are in Edit Mode", "Update your booking details below and click 'Update Booking' to save changes.");
            
        } catch (error) {
            console.error("Load booking error:", error);
            showMsg("Failed to load booking details", false);
        }
    }

    function showEditModePopup(title, message) {
    const overlay = document.createElement("div");
    overlay.className = 'modal-backdrop show';
    overlay.style.zIndex = "10001"; 

    overlay.innerHTML = `
        <div class="modal-card" style="border-top: 5px solid #007bff; text-align:center;">
            <h3 style="color: #007bff;">${title}</h3>
            <p style="margin: 15px 0; color: #555;">${message}</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="editModeOkBtn" class="primary" style="padding:10px 20px;">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector("#editModeOkBtn").onclick = () => {
        overlay.remove();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };
}

function cancelEdit() {
    editingBookingId = null;
    bookBtn.textContent = "Confirm Booking";
    bookBtn.onclick = submitBooking; // ✅ reset properly

    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) cancelEditBtn.remove();

    clearBookingForm();
    showPage("bookingsPage");
    
    // ✅ Success validation
    showSuccessModal("Edit Successful", "Booking form has been edited successfully!");
}

    async function updateBooking() {
        const svcOpt = serviceEl.selectedOptions[0];
        if (!svcOpt.value) return showMsg("Please select a service.", false);

        const time = timeEl.value;
        if (time < "09:00" || time > "18:00") {
            return showErrorPopup("Please select a time between 9:00 AM to 6:00 PM.");
        }

        const vehicleType = vehicleTypeSelect.value === "other" ? otherVehicleInput.value : vehicleTypeSelect.value;
        
        const updatedBooking = {
            service: svcOpt.textContent.split(" - ")[0],
            vehicleType,
            vehicleModel: document.getElementById("vehicleModel").value,
            plateNumber: document.getElementById("plateNumber").value,
            location: document.getElementById("location").value,
            email: document.getElementById("email").value,
            notes: document.getElementById("notes").value,
            date: dateEl.value,
            time: formatTime12(timeEl.value),
            price: svcOpt.dataset.price
        };

        showBookingPopup(`Update booking with new details?`, async () => {
            try {
                const response = await fetch(`/api/book/${editingBookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedBooking)
                });
                const result = await response.json();

                if (response.ok) {
                    // Update local storage
                    let currentBookings = lsGet(LS_BOOK, []);
                    const index = currentBookings.findIndex(b => b._id === editingBookingId);
                    if (index !== -1) {
                        currentBookings[index] = result;
                        lsSet(LS_BOOK, currentBookings);
                    }
                    
                    cancelEdit();
                    loadBookings();
                } else {
                    showMsg(result.message || "Update failed", false);
                }
            } catch (error) {
                console.error("Update error:", error);
                showMsg("Update failed. Please try again.", false);
            }
        });
    }

function showDeleteBookingPopup(message, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = 'modal-backdrop show';
    overlay.style.zIndex = "10000";

    overlay.innerHTML = `
        <div class="modal-card" style="border-top: 5px solid #dc3545; text-align:center;">
            <h3 style="color: #dc3545;">Confirm Cancellation</h3>
            <p style="margin: 15px 0; color: #555;">${message}</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                <button id="confirmCancelYes" class="primary" style="padding:10px 20px; background-color: #dc3545; border:none;">Yes, Cancel</button>
                <button id="confirmCancelNo" class="btn-cancel" style="padding:10px 20px;">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector("#confirmCancelYes").onclick = () => {
        onConfirm();
        overlay.remove();
    };
    overlay.querySelector("#confirmCancelNo").onclick = () => overlay.remove();

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };
}

function formatTime12(timeValue) {
        if (!timeValue) return "";

        const trimmed = `${timeValue}`.trim();
        const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (twelveHourMatch) {
            let [, hour, minute, period] = twelveHourMatch;
            let normalizedHour = parseInt(hour, 10) % 12 || 12;
            return `${normalizedHour.toString().padStart(2, '0')}:${minute} ${period.toUpperCase()}`;
        }

        const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
        if (!twentyFourHourMatch) return trimmed;

        let [, hour, minute] = twentyFourHourMatch;
        let h = parseInt(hour, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `${h.toString().padStart(2, '0')}:${minute} ${ampm}`;
    }

function getSuggestedTimeSlot(durationMins) {
    const now = new Date();
    const hour = now.getHours();
    let suggestedHour = Math.max(9, hour + 1); // Next hour after current
    if (suggestedHour + Math.ceil(durationMins/60) > 18) suggestedHour = 9;
    return `${suggestedHour.toString().padStart(2,'0')}:00`;
}

function formatReadableDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00"); // Add time to parse properly
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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

    function showBookingDetails(booking) {
    const modal = document.getElementById("bookingDetailModal");
    if (!modal) return;

    const modalBody = document.getElementById("bookingDetailBody");
    
    const serviceInfo = servicesList.find(s => s.name === booking.service);
    const serviceDesc = serviceInfo ? serviceInfo.fullDescription : 'No description available.';
    
    const vehicleParts = booking.vehicle ? booking.vehicle.split(' - ') : [];
    const vType = booking.vehicleType || vehicleParts[0] || 'N/A';
    const vModel = booking.vehicleModel || vehicleParts[1] || booking.vehicle || 'N/A';
    
    const formattedDate = formatReadableDate(booking.date);
    
    modalBody.innerHTML = `
        <p><strong>Service:</strong> ${escapeHtml(booking.service)}</p>
        <div style="margin: 8px 0; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 0.9em;">
            ${serviceDesc}
        </div>
        <p><strong>Vehicle Type:</strong> ${escapeHtml(vType)}</p>
        <p><strong>Vehicle Model:</strong> ${escapeHtml(vModel)}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${escapeHtml(booking.time)}</p>
        <p><strong>Status:</strong> ${escapeHtml(booking.status)}</p>
        <p><strong>Price:</strong> ₱${escapeHtml(booking.price || '0')}</p>
    `;

    const closeBtn = document.getElementById("bookingDetailClose");

    const closeHandler = () => {
        modal.style.display = "none";
        modal.removeEventListener("click", overlayClickHandler);
    };

    const overlayClickHandler = (e) => {
        if (e.target === modal) {
            closeHandler();
        }
    };

    closeBtn.onclick = closeHandler;
    modal.addEventListener("click", overlayClickHandler);

    modal.style.display = "flex";
}

async function submitBooking() {
    const svcOpt = serviceEl.selectedOptions[0];
    const date = dateEl.value;
    const time = timeEl.value;
    const vehicleType = vehicleTypeSelect.value === "other" ? otherVehicleInput.value : vehicleTypeSelect.value;
    const vehicleModel = document.getElementById("vehicleModel").value;
    const clientName = localStorage.getItem("clientName");
    const email = document.getElementById("email").value;

    if (!clientName) return showMsg("Please log in to book a service.", false);
    if (!email) return showMsg("Please enter your email address.", false);

    if (!svcOpt.value || !date || !time) return showMsg("Please complete the form.", false);

    if (time < "09:00" || time > "18:00") {
        return showErrorPopup("Please select a time between 9:00 AM to 6:00 PM.");
    }

    const formattedTime = formatTime12(time);

    const newBooking = {
        id: nowId(),
        service: svcOpt.textContent.split(" - ")[0],
        vehicleType,
        vehicleModel: document.getElementById("vehicleModel").value,
        plateNumber: document.getElementById("plateNumber").value,
        location: document.getElementById("location").value,
        email: document.getElementById("email").value,
        notes: document.getElementById("notes").value,
        date,
        time: formattedTime,
        price: svcOpt.dataset.price,
        status: "pending",
        clientName: localStorage.getItem("clientName") || "",
        clientUser: localStorage.getItem("clientUsername") || ""
    };

showBookingPopup(`<b>Service:</b> ${svcOpt.textContent}<br><b>Time:</b> ${formattedTime}<br>Proceed?`, async () => {
    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBooking)
        });

        const result = await response.json();

        if (response.ok) {
            const list = lsGet(LS_BOOK, []);
            list.push(result.booking);
            lsSet(LS_BOOK, list);

            clearBookingForm();

           // ✅ FIX: show only for NEW booking (not editing)
if (!editingBookingId) {
    showFeedbackPopup("Booking confirmed!");
}
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
    delete serviceEl.dataset.selectedServiceName;
    delete serviceEl.dataset.selectedServiceValue;
    vehicleTypeSelect.value = "";
    
    dateEl.value = "";
    timeEl.value = "";
    document.getElementById("vehicleModel").value = "";
    document.getElementById("plateNumber").value = "";
    document.getElementById("location").value = "";
    document.getElementById("email").value = "";
    document.getElementById("notes").value = "";
    
    if (otherVehicleInput) {
        otherVehicleInput.value = "";
        otherVehicleInput.style.display = "none";
    }

    const pricePreview = document.getElementById("pricePreview");
    if (pricePreview) pricePreview.textContent = "₱0";
    
    document.getElementById("bookPage").scrollTop = 0;
}
clearBookingForm();
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

    const resetBtn = document.getElementById("resetBtn");

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            // Enhanced form reset with full cleanup
            showConfirmPopup(
                "Are you sure you want to clear all booking details? All entered information will be lost.",
                () => {
                    clearBookingForm(); // Use the comprehensive clear function
                    showMsg("✅ Form completely reset. Ready for new booking!", true);
                }
            );
        });
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

if (bookBtn) {
    bookBtn.onclick = submitBooking;
}
    function showMsg(txt, success = true) {
        if (!msgEl) return;
        msgEl.textContent = txt;
        msgEl.style.color = success ? "#0f5132" : "#b91c1c";
        msgEl.style.display = "block";
        setTimeout(() => { msgEl.style.display = "none"; }, 4000);
    }

    let selectedFeedbackRating = 0;
    const stars = Array.from(document.querySelectorAll("#starRating .star"));
    stars.forEach((star, index) => {
        star.onclick = () => {
            selectedFeedbackRating = index + 1;
            stars.forEach((s, i) => s.textContent = i < selectedFeedbackRating ? "★" : "☆");
        };
    });

    async function loadMyFeedbacks() {
        if (!myFeedbacksEl) return;

        const { username, email, legacyUsername, legacyEmail } = getClientIdentity();
        if (!username && !email && !legacyUsername && !legacyEmail) {
            myFeedbacksEl.innerHTML = "<p>Please log in to see your feedbacks.</p>";
            return;
        }

        try {
            const response = await fetch(`/api/feedback/my-feedbacks?${buildIdentityQuery()}`);
            const feedbacks = await response.json();

            myFeedbacksEl.innerHTML = feedbacks.length ? "" : "<p>No feedback yet.</p>";
            feedbacks.forEach(fb => {
                const div = document.createElement("div");
                div.style = "border:1px solid #ccc; padding:15px; margin-bottom:10px; border-radius:10px; position:relative; background:#fff;";
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <strong>${escapeHtml(fb.user)}</strong><br>
                            <small class="muted">${new Date(fb.createdAt).toLocaleDateString()}</small>
                        </div>
                        <button class="btn-danger feedback-remove-btn" data-id="${fb._id}" style="padding:8px 12px;">Remove</button>
                    </div>

                    <div style="color:#f5c518; margin:5px 0;">
                        ${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}
                    </div>

                    <p style="margin:0;">${escapeHtml(fb.comment)}</p>

                    ${fb.image ? `<div style="margin-top:10px;"><img src="${fb.image}" style="max-width:100%; border-radius:8px; border:1px solid #ccc;"></div>` : ""}
                `;
                myFeedbacksEl.appendChild(div);
            });
            myFeedbacksEl.querySelectorAll(".feedback-remove-btn").forEach(btn => {
                btn.onclick = () => {
                    showDeleteFeedbackPopup("Are you sure you want to remove this feedback?", async () => {
                        try {
                            const response = await fetch(`/api/feedback/${btn.dataset.id}?${buildIdentityQuery()}`, {
                                method: 'DELETE'
                            });
                            const result = await response.json();

                            if (!response.ok) {
                                alert(result.message || "Failed to remove feedback.");
                                return;
                            }

                            loadMyFeedbacks();
                        } catch (err) {
                            console.error('Failed to delete feedback:', err);
                            alert("Could not remove feedback.");
                        }
                    });
                };
            });
        } catch (err) {
            console.error('Failed to load my feedbacks:', err);
            myFeedbacksEl.innerHTML = "<p>Could not load feedbacks.</p>";
        }
    }

function showDeleteFeedbackPopup(message, onConfirm) {
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




    if (feedbackForm) {
    feedbackForm.addEventListener("submit", e => {
        e.preventDefault();

        const comment = document.getElementById("feedbackComments").value;
        const imageInput = document.getElementById("feedbackImage");
        const topicEl = document.getElementById("feedbackTopic");
        const bookingId = topicEl.value;

        if (!bookingId) return alert("Please select a booking or service to review.");
        if (!selectedFeedbackRating) return alert("Please rate us!");

        const saveFeedback = async (imageData = "") => {
            const topicValue = topicEl.value;
            const selectedTopicOption = topicEl.selectedOptions[0];
            const newFb = {
                user: localStorage.getItem("clientUsername") || "Guest",
                email: localStorage.getItem("clientEmail") || "",
                rating: selectedFeedbackRating,
                comment,
                image: imageData
            };

            if (topicValue.startsWith('service_')) {
                const serviceLabel = selectedTopicOption
                    ? selectedTopicOption.textContent.split(" - ")[0].trim()
                    : "";
                newFb.service = serviceLabel || topicValue.replace('service_', '');
            } else {
                newFb.booking = topicValue;
            }

            try {
                const response = await fetch('/api/feedback/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newFb)
                });

                let result = {};
                try {
                    result = await response.json();
                } catch (parseError) {
                    result = { message: `Server returned ${response.status}` };
                }

                if (response.ok) {
                    showFeedbackPopup("Feedback submitted!");
                    loadMyFeedbacks(); // Reload feedbacks to show the new one

                    feedbackForm.reset();
                    selectedFeedbackRating = 0;
                    stars.forEach(s => s.textContent = "☆");
                    document.getElementById("feedbackTopic").value = "";
                } else {
                    alert('Feedback submission failed: ' + result.message);
                }
            } catch (err) {
                console.error('Feedback submission error:', err);
                alert('An error occurred while submitting feedback. Please try again.');
            }
        };

        // If image selected
        if (imageInput.files && imageInput.files[0]) {
            compressImageForFeedback(imageInput.files[0])
                .then((compressedImage) => {
                    saveFeedback(compressedImage);
                })
                .catch((error) => {
                    console.error("Feedback image compression error:", error);
                    alert(error.message || "Could not prepare the selected image.");
                });
        } else {
            saveFeedback();
        }
    });
}

   function showFeedbackPopup(message) {
    const overlay = document.createElement("div");
    overlay.className = 'feedback-popup-overlay';
    overlay.style.display = "flex";

    overlay.innerHTML = `
        <div class="feedback-popup-box" style="border-top:4px solid #2e7d32; max-width:420px; text-align:center;">
            <h3 style="color:#2e7d32; margin-bottom:10px;">Success</h3>
            <p style="margin-bottom:16px; color:#355b39;">${message}</p>
            <button id="okBtn" class="primary" style="padding:10px 18px;">OK</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const closePopup = () => overlay.remove();
    overlay.querySelector("#okBtn").onclick = closePopup;
    overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
    };
}

async function submitBooking() {
    const svcOpt = serviceEl.selectedOptions[0];
    const date = dateEl.value;
    const time = timeEl.value;
    const vehicleType = vehicleTypeSelect.value === "other" ? otherVehicleInput.value : vehicleTypeSelect.value;
    const clientName = localStorage.getItem("clientName");
    const email = document.getElementById("email").value;

    if (!clientName) return showMsg("Please log in to book a service.", false);
    if (!email) return showMsg("Please enter your email address.", false);
    if (!svcOpt.value || !date || !time) return showMsg("Please complete the form.", false);

    if (time < "09:00" || time > "18:00") {
        return showErrorPopup("Please select a time between 9:00 AM to 6:00 PM.");
    }

    const formattedTime = formatTime12(time);
    const newBooking = {
        id: nowId(),
        service: svcOpt.textContent.split(" - ")[0],
        vehicleType,
        vehicleModel: document.getElementById("vehicleModel").value,
        plateNumber: document.getElementById("plateNumber").value,
        location: document.getElementById("location").value,
        email,
        notes: document.getElementById("notes").value,
        date,
        time: formattedTime,
        price: svcOpt.dataset.price,
        status: "pending",
        clientName: localStorage.getItem("clientName") || "",
        clientUser: localStorage.getItem("clientUsername") || ""
    };

    showBookingPopup(`<b>Service:</b> ${svcOpt.textContent}<br><b>Time:</b> ${formattedTime}<br>Proceed?`, async () => {
        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking)
            });

            const result = await response.json();

            if (!response.ok) {
                showMsg(result.message || "Booking failed.", false);
                return;
            }

            const savedBooking = result.booking || newBooking;
            const list = lsGet(LS_BOOK, []);
            list.push(savedBooking);
            lsSet(LS_BOOK, list);

            clearBookingForm();
            await loadBookings();
            showPage("bookingsPage");
            showFeedbackPopup("Booking successful! Your booking is now listed in My Bookings.");
        } catch (error) {
            console.error("Booking error:", error);
            showMsg("An error occurred. Please try again.", false);
        }
    });
}

    // Init map after services (uses fallback images)
    if (typeof L !== 'undefined' && document.getElementById('map')) {
      const map = L.map('map').setView([14.5995, 120.9842], 13); // Manila default
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([14.5995, 120.9842]).addTo(map).bindPopup('CarWash Pro Location');
    }

// IMMEDIATE SERVICES LOAD - no waiting!
console.log('🚀 DOM ready - forcing services load NOW');
loadServices();
setTimeout(() => loadServicesDynamic().catch(e => console.warn('Dynamic load failed, using fallback:', e)), 500);

// Background API refresh (non-blocking)
loadServicesDynamic().catch(e => console.warn('API refresh failed:', e));
loadBookings();
loadMyFeedbacks();
    
    // Refresh bookings periodically
    setInterval(loadBookings, 3000);
});
