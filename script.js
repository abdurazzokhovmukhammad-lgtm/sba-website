document.addEventListener("DOMContentLoaded", () => {
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzurRgTaiNXfrR1df99UXpWKhAEJ9n8M2sEiYLPp_vN5DSdS9jTw717AN8hPFrM1pFo/exec";

    // Show initial loading screen animation
    gsap.to("#s-logo-container", {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
    });

    gsap.to("#ba-text-container", {
        opacity: 1,
        right: "50%",
        transform: "translateX(0)",
        duration: 1.5,
        ease: "power2.out",
        delay: 1.5,
        onComplete: () => {
            gsap.to("#loading-screen", {
                opacity: 0,
                duration: 1,
                delay: 1,
                onComplete: () => {
                    document.getElementById("loading-screen").style.display = "none";
                    document.getElementById("main-header").classList.remove("hidden");
                },
            });
        },
    });

    // Dynamic text on home page
    const changingText = document.getElementById("changing-text");
    const texts = ["AI + Human", "Art", "Space"];
    let textIndex = 0;

    function changeText() {
        textIndex = (textIndex + 1) % texts.length;
        gsap.to(changingText, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            onComplete: () => {
                changingText.textContent = texts[textIndex];
                gsap.to(changingText, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                });
            },
        });
    }

    setInterval(changeText, 2000);

    // Page navigation
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('nav a');
    const footerLinks = document.querySelectorAll('.footer-links a');

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('data-page');
            showPage(`${pageId}-page`);
        });
    });

    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = e.target.getAttribute('data-page');
            showPage(`${pageId}-page`);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const modal = document.getElementById('search-result-modal');
    const modalDetails = document.getElementById('modal-details');
    const closeModal = document.querySelector('.close-button');

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim().replace(/^#/, '');
            if (searchTerm) {
                searchArtifact(searchTerm);
            }
        }
    });

    closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    async function searchArtifact(id) {
        modalDetails.innerHTML = '<p>Searching...</p>';
        modal.classList.add('show');

        try {
            const response = await fetch(`${WEB_APP_URL}?sheet=Artifacts&id=${id}`);
            const data = await response.json();

            if (data.SBA_ID) {
                modalDetails.innerHTML = `
                    <div class="result-image">
                        <img src="${data['Image URL']}" alt="SBA Artifact">
                    </div>
                    <div class="details">
                        <h3>SBA Artifact #${data['SBA ID']}</h3>
                        <p><strong>Price:</strong> ${data.Price}</p>
                        <p><strong>Description:</strong> ${data.Description}</p>
                        <p><strong>Status:</strong> ${data.Status}</p>
                        <button class="buy-btn">Buy</button>
                    </div>
                `;
            } else {
                modalDetails.innerHTML = `<p>SBA Artifact #${id} not found.</p>`;
            }
        } catch (error) {
            modalDetails.innerHTML = `<p>Error: Could not retrieve data. Please try again later.</p>`;
            console.error('Error fetching search data:', error);
        }
    }

    // Load recent sales
    async function loadRecentSales() {
        const container = document.getElementById('sold-artifacts-container');
        try {
            const response = await fetch(`${WEB_APP_URL}?sheet=Sales Log`);
            const sales = await response.json();
            
            // Show only the last 3 sales
            const recentSales = sales.slice(-3);

            if (recentSales.length > 0) {
                container.innerHTML = recentSales.map(sale => `
                    <div class="sold-card">
                        <div class="sale-date">${sale.Date}</div>
                        <img src="${sale['Image URL']}" alt="SBA Artifact">
                        <div class="sale-price">Sold for ${sale['Selling Price']}</div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p>No recent sales to display.</p>';
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
            container.innerHTML = '<p>Could not load recent sales. Please check the connection.</p>';
        }
    }

    // Load gallery items
    async function loadGallery() {
        const container = document.getElementById('gallery-container');
        try {
            const response = await fetch(`${WEB_APP_URL}?sheet=Artifacts`);
            const artifacts = await response.json();

            if (artifacts.length > 0) {
                container.innerHTML = artifacts.map(artifact => `
                    <div class="gallery-item" data-id="${artifact['SBA ID']}">
                        <img src="${artifact['Image URL']}" alt="SBA Artifact">
                        <div class="gallery-details">
                            <h3>#${artifact['SBA ID']}</h3>
                            <p>${artifact.Price}</p>
                            <button class="buy-btn">Buy</button>
                        </div>
                    </div>
                `).join('');
                
                // Add event listeners for gallery items
                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const id = e.currentTarget.getAttribute('data-id');
                        searchArtifact(id);
                    });
                });
            } else {
                container.innerHTML = '<p>No artifacts to display in the gallery.</p>';
            }
        } catch (error) {
            console.error('Error fetching gallery data:', error);
            container.innerHTML = '<p>Could not load the gallery. Please check the connection.</p>';
        }
    }

    loadRecentSales();
    loadGallery();
});