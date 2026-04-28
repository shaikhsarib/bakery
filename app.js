document.addEventListener('DOMContentLoaded', () => {
    // === 1. State Management ===
    let cart = JSON.parse(localStorage.getItem('maharashtra_bakery_cart')) || [];
    let currentGalleryIndex = 0;

    // === 2. UI Elements ===
    const header = document.querySelector('header');
    const cartCountElements = document.querySelectorAll('a[aria-label^="Cart"] span');
    const revealElements = document.querySelectorAll('.reveal-hidden');

    // === 3. Helper Functions ===
    const updateCartCountUI = () => {
        const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
        });
        const cartLinks = document.querySelectorAll('a[aria-label^="Cart"]');
        cartLinks.forEach(link => {
            link.setAttribute('aria-label', `Cart with ${totalItems} items`);
        });

        // Update mobile menu "View Cart (X)" buttons
        const mobileCartBtns = document.querySelectorAll('.mobile-menu a[href="checkout.html"]');
        mobileCartBtns.forEach(btn => {
            if (btn.textContent.includes('View Cart')) {
                const svg = btn.querySelector('svg');
                if (svg) {
                    btn.innerHTML = '';
                    btn.appendChild(svg);
                    btn.appendChild(document.createTextNode(`View Cart (${totalItems})`));
                }
            }
        });

        localStorage.setItem('maharashtra_bakery_cart', JSON.stringify(cart));
    };

    const addToCart = (product) => {
        const quantity = Number(product.quantity) || 1;
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        updateCartCountUI();
    };

    const buyNow = (product) => {
        // Redirect to product detail page with product ID
        window.location.href = `product-detail.html?product=${product.id}`;
    };

    const updateCartItem = (productId, newQuantity) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            } else {
                item.quantity = newQuantity;
            }
            updateCartCountUI();
            renderCheckoutCart();
        }
    };

    const getCartTotal = () => {
        const subtotal = cart.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (price * quantity);
        }, 0);
        const gst = Math.round(subtotal * 0.05);
        const total = subtotal + gst;
        return { subtotal, gst, total };
    };

    const renderCheckoutCart = () => {
        if (!window.location.pathname.includes('checkout.html')) return;

        const cartContainer = document.querySelector('[data-cart-items]');
        const orderSummaryContainer = document.querySelector('[data-order-summary-items]');

        if (!cartContainer || !orderSummaryContainer) return;

        // Clear existing items
        const existingItems = cartContainer.querySelectorAll('.flex.gap-4.bg-white.rounded-3xl');
        existingItems.forEach(item => item.remove());

        const existingSummaryItems = orderSummaryContainer.querySelectorAll('.flex.gap-3.items-center');
        existingSummaryItems.forEach(item => item.remove());

        if (cart.length === 0) {
            cartContainer.insertAdjacentHTML('afterbegin', `
                <div class="rounded-3xl p-6 border border-brand-border bg-brand-surface text-brand-muted">
                    Your cart is empty. Add items from Collections or the homepage.
                </div>
            `);
            updateOrderSummary();
            return;
        }

        // Render cart items
        cart.forEach(item => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            const itemTotal = price * quantity;

            // Main cart item
            const cartItemHTML = `
                <div class="cart-item flex gap-4 bg-white rounded-3xl p-4 border border-brand-border shadow-card" data-product-id="${item.id}" data-unit-price="${price}">
                    <div class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-surface border border-brand-border-light">
                        <img alt="${item.name}" loading="lazy" width="80" height="80" class="w-full h-full object-cover bg-gray-200" style="color: transparent" src="${item.image}" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-brand-foreground leading-snug">${item.name}</p>
                        <p class="text-xs text-brand-subtle mt-0.5">${item.weight}</p>
                        <div class="cart-item-controls flex items-center justify-between mt-3">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-0 border border-brand-border rounded-xl overflow-hidden">
                                    <button class="qty-btn w-9 h-9 flex items-center justify-center text-brand-muted" aria-label="Decrease" data-product-id="${item.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" width="14" height="14">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"></path>
                                        </svg>
                                    </button>
                                    <span class="w-9 h-9 flex items-center justify-center text-sm font-bold text-brand-foreground border-x border-brand-border">${quantity}</span>
                                    <button class="qty-btn w-9 h-9 flex items-center justify-center text-brand-muted" aria-label="Increase" data-product-id="${item.id}">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" width="14" height="14">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path>
                                        </svg>
                                    </button>
                                </div>
                                <button type="button" class="text-xs font-semibold text-red-600 hover:text-red-800 transition remove-btn inline-flex items-center gap-1" data-remove-product-id="${item.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" class="text-red-600">
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4.5a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5V6" />
                                        <path d="M19 6 18.2 19.2A2 2 0 0 1 16.2 21H7.8a2 2 0 0 1-1.8-1.8L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                    </svg>
                                    Remove
                                </button>
                            </div>
                            <p class="text-base font-bold text-brand-foreground">₹${itemTotal.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `;

            // Order summary item
            const summaryItemHTML = `
                <div class="flex gap-3 items-center">
                    <div class="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-surface border border-brand-border-light">
                        <img alt="${item.name}" loading="lazy" width="56" height="56" class="w-full h-full object-cover bg-gray-200" style="color: transparent" src="${item.image}" />
                        <span class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">${quantity}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-brand-foreground truncate">${item.name}</p>
                        <p class="text-xs text-brand-subtle">${item.weight}</p>
                    </div>
                    <p class="text-sm font-bold text-brand-foreground flex-shrink-0">₹${itemTotal.toLocaleString()}</p>
                </div>
            `;

            cartContainer.insertAdjacentHTML('afterbegin', cartItemHTML);
            orderSummaryContainer.insertAdjacentHTML('afterbegin', summaryItemHTML);
        });

        updateOrderSummary();
    };

    const updateOrderSummary = () => {
        const { subtotal, gst, total } = getCartTotal();

        // Update main cart summary
        const summaryElements = document.querySelectorAll('.bg-white.rounded-3xl.p-5.border.border-brand-border.shadow-card.space-y-3');
        summaryElements.forEach(summary => {
            const spans = summary.querySelectorAll('span');
            spans.forEach(span => {
                if (span.textContent.includes('Subtotal')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${subtotal.toLocaleString()}`;
                }
                if (span.textContent.includes('GST (5%)')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${gst.toLocaleString()}`;
                }
                if (span.textContent.includes('Total')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${total.toLocaleString()}`;
                }
            });
        });

        // Update order summary sidebar
        const sidebarSummary = document.querySelector('.space-y-2\\.5');
        if (sidebarSummary) {
            const spans = sidebarSummary.querySelectorAll('span');
            spans.forEach(span => {
                if (span.textContent.includes('Subtotal')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${subtotal.toLocaleString()}`;
                }
                if (span.textContent.includes('GST (5%)')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${gst.toLocaleString()}`;
                }
                if (span.textContent.includes('Total')) {
                    const nextSpan = span.nextElementSibling;
                    if (nextSpan) nextSpan.textContent = `₹${total.toLocaleString()}`;
                }
            });
        }
    };

    // === 4. Feature Initializations ===

    // Header scroll
    let isScrolled = false;
    window.addEventListener('scroll', () => {
        if (!isScrolled) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                isScrolled = false;
            });
            isScrolled = true;
        }
    });

    // Mobile Menu
    const menuBtn = document.querySelector('button[aria-label="Open menu"]');
    const closeBtn = document.querySelector('button[aria-label="Close menu"]');
    const mobileMenu = document.querySelector('.mobile-menu');
    const backdrop = document.querySelector('.backdrop');

    const toggleMenu = (open) => {
        if (mobileMenu && backdrop) {
            mobileMenu.classList.toggle('hidden', !open);
            backdrop.classList.toggle('hidden', !open);
            menuBtn?.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        }
    };

    if (menuBtn) menuBtn.addEventListener('click', () => toggleMenu(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    if (backdrop) backdrop.addEventListener('click', () => toggleMenu(false));

    // Product Gallery
    const thumbs = document.querySelectorAll('.thumb-item');
    if (thumbs.length > 0) {
        const mainImg = document.querySelector('.product-img-wrap img');
        const prevBtn = document.querySelector('button[aria-label="Previous image"]');
        const nextBtn = document.querySelector('button[aria-label="Next image"]');

        const updateGallery = (index) => {
            currentGalleryIndex = index;
            const newSrc = thumbs[index].querySelector('img').src;
            if (mainImg) mainImg.src = newSrc;

            thumbs.forEach(t => t.classList.remove('active'));
            thumbs[index].classList.add('active');

            const dots = document.querySelectorAll('button[aria-label^="View image"]');
            dots.forEach((dot, i) => {
                dot.style.width = (i === index) ? '24px' : '6px';
                dot.style.backgroundColor = (i === index) ? '#fff' : 'rgba(255,255,255,0.5)';
            });
        };

        thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => updateGallery(index)));
        if (prevBtn) prevBtn.addEventListener('click', () => updateGallery((currentGalleryIndex - 1 + thumbs.length) % thumbs.length));
        if (nextBtn) nextBtn.addEventListener('click', () => updateGallery((currentGalleryIndex + 1) % thumbs.length));
    }

    // Quantity Adjusters + Remove buttons
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-remove-product-id]');
        if (removeBtn) {
            const productId = removeBtn.getAttribute('data-remove-product-id');
            const itemRow = removeBtn.closest('[data-product-id]');
            if (itemRow) {
                itemRow.classList.add('removing-cart-item');
            }
            if (productId) {
                setTimeout(() => updateCartItem(productId, 0), 220);
            }
            return;
        }

        const btn = e.target.closest('button');
        if (!btn) return;

        const productId = btn.getAttribute('data-product-id');
        const isDecrease = btn.getAttribute('aria-label')?.startsWith('Decrease');
        const isIncrease = btn.getAttribute('aria-label')?.startsWith('Increase');

        if (isDecrease) {
            const span = btn.nextElementSibling;
            if (span) {
                const currentQty = parseInt(span.textContent, 10);
                if (currentQty > 1) {
                    span.textContent = currentQty - 1;
                    if (productId) updateCartItem(productId, currentQty - 1);
                }
            }
        } else if (isIncrease) {
            const span = btn.previousElementSibling;
            if (span) {
                const currentQty = parseInt(span.textContent, 10);
                span.textContent = currentQty + 1;
                if (productId) updateCartItem(productId, currentQty + 1);
            }
        }
    });

    // Add to Cart and Buy Now
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a');
        if (!btn) return;

        // Stop bubbling so the parent card doesn't also click
        if (btn.closest('.collection-card')) {
            e.stopPropagation();
        }

        const text = btn.textContent.trim().toLowerCase();
        const isAddBtn = text === 'add' || text.includes('add to cart') || btn.getAttribute('aria-label')?.includes('Add');
        const isBuyNowBtn = text.includes('buy now');

        if (isAddBtn || isBuyNowBtn) {
            e.preventDefault();

            // Get product details from the card
            const card = btn.closest('.collection-card') || btn.closest('[data-product]');
            if (!card) return;

            const productData = card.getAttribute('data-product');
            let product;

            if (productData) {
                product = JSON.parse(productData);
            } else {
                // Extract product info from DOM
                const img = card.querySelector('img');
                const nameEl = card.querySelector('h2, h3, h1');
                const priceEl = card.querySelector('p.font-bold, .text-3xl.font-bold');
                const weightEl = card.querySelector('p.text-xs, p.text-sm');

                if (!nameEl || !priceEl) return;

                const name = nameEl.textContent.trim();
                const price = parseInt(priceEl.textContent.replace(/[^\d]/g, ''));
                const image = img ? img.src : '';
                const weight = weightEl ? weightEl.textContent.trim() : '250g';

                // Generate unique ID based on name
                const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                product = {
                    id,
                    name,
                    price,
                    quantity: 1, // Will be updated below
                    image,
                    weight
                };
            }

            // Always update quantity based on the UI
            let qtyToAdd = 1;
            if (text.includes('add to cart')) {
                const qtySpan = document.querySelector('.w-12.h-11.flex.items-center.justify-center');
                if (qtySpan) qtyToAdd = parseInt(qtySpan.textContent, 10) || 1;
            }
            product.quantity = qtyToAdd;

            if (isBuyNowBtn) {
                // For Buy Now on collections page, redirect to detail.
                // For Buy Now on detail page (which says Instant Checkout), add to cart and go to checkout.
                if (text.includes('checkout')) {
                    addToCart(product);
                    window.location.href = 'checkout.html';
                } else {
                    buyNow(product);
                }
            } else {
                addToCart(product);

                // Visual feedback
                const originalHTML = btn.innerHTML;
                btn.innerHTML = 'Added!';
                btn.classList.add('bg-success');
                setTimeout(() => {
                    window.location.href = 'collections.html';
                }, 500);
            }
        }
    });

    // Pack Size Selector
    const packBtns = document.querySelectorAll('button.relative.px-5.py-3.rounded-2xl');
    packBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            packBtns.forEach(b => {
                b.classList.remove('border-primary', 'bg-primary/5', 'text-primary');
                b.classList.add('border-brand-border', 'text-brand-muted');
            });
            btn.classList.add('border-primary', 'bg-primary/5', 'text-primary');
            btn.classList.remove('border-brand-border', 'text-brand-muted');
        });
    });

    // Reveal on Scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Proceed button behavior
    const proceedToDeliveryBtn = document.querySelector('#proceedToDeliveryButton');
    const orderConfirmationScreen = document.querySelector('#orderConfirmationScreen');
    const checkoutMain = document.querySelector('main');
    const orderIdText = document.querySelector('#orderIdText');
    const continueShoppingBtn = document.querySelector('#continueShoppingBtn');

    if (proceedToDeliveryBtn) {
        proceedToDeliveryBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!cart.length) {
                alert('Your cart is empty. Add items before proceeding to delivery.');
                return;
            }

            const generatedOrderId = `CM${Date.now().toString().slice(-6)}`;
            if (orderIdText) {
                orderIdText.textContent = generatedOrderId;
            }

            cart = [];
            updateCartCountUI();
            localStorage.setItem('maharashtra_bakery_cart', JSON.stringify(cart));

            if (checkoutMain) checkoutMain.classList.add('hidden');
            if (orderConfirmationScreen) orderConfirmationScreen.classList.remove('hidden');
        });
    }

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Product Detail Page Dynamic Loading
    if (window.location.pathname.includes('product-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');

        if (productId) {
            // Product data mapping
            const products = {
                'almond-fingers': {
                    name: 'Almond Fingers',
                    price: 395,
                    weight: '250g',
                    image: 'assets/images/DSC02867.jpg',
                    gallery: ['assets/images/DSC02867.jpg', 'assets/images/DSC02868.jpg', 'assets/images/DSC02869.jpg'],
                    description: 'Buttery, crumbly shortbread loaded with roasted almond flakes from Maharashtra Bakery in Maharashtra, India. India\'s bestselling cookie.',
                    category: 'Classic Cookies'
                },
                'choco-chip-delight': {
                    name: 'Choco Chip Delight',
                    price: 349,
                    weight: '250g',
                    image: 'assets/images/DSC02868.jpg',
                    gallery: ['assets/images/DSC02868.jpg', 'assets/images/DSC02867.jpg', 'assets/images/DSC02870.jpg'],
                    description: 'Rich chocolate chip cookies with premium Belgian chocolate chunks and a perfect chewy texture.',
                    category: 'Gourmet Cookies'
                },
                'assorted-gift-tin': {
                    name: 'Assorted Gift Tin',
                    price: 895,
                    weight: '500g',
                    image: 'assets/images/DSC02869.jpg',
                    gallery: ['assets/images/DSC02869.jpg', 'assets/images/DSC02867.jpg', 'assets/images/DSC02868.jpg'],
                    description: 'A perfect assortment of our finest cookies in an elegant gift tin, ideal for special occasions.',
                    category: 'Gift Tins'
                },
                'double-chocolate-melt': {
                    name: 'Double Chocolate Melt',
                    price: 425,
                    weight: '250g',
                    image: 'assets/images/DSC02870.jpg',
                    gallery: ['assets/images/DSC02870.jpg', 'assets/images/DSC02868.jpg', 'assets/images/DSC02869.jpg'],
                    description: 'Decadent double chocolate cookies that literally melt in your mouth with rich cocoa flavor.',
                    category: 'Indulgence'
                },
                'millet-jaggery-cookies': {
                    name: 'Millet Jaggery Cookies',
                    price: 295,
                    weight: '250g',
                    image: 'assets/images/DSC02871.jpg',
                    gallery: ['assets/images/DSC02871.jpg', 'assets/images/DSC02870.jpg', 'assets/images/DSC02872.jpg'],
                    description: 'Healthy and nutritious cookies made with millet flour and natural jaggery sweetener.',
                    category: 'Health First'
                },
                'oatmeal-raisin': {
                    name: 'Oatmeal & Raisin',
                    price: 350,
                    weight: '250g',
                    image: 'assets/images/DSC02872.jpg',
                    gallery: ['assets/images/DSC02872.jpg', 'assets/images/DSC02871.jpg', 'assets/images/DSC02867.jpg'],
                    description: 'Classic oatmeal cookies with plump raisins and a wholesome texture, naturally sugar-free.',
                    category: 'Sugar Free'
                }
            };

            const product = products[productId];
            if (product) {
                // Update page title
                document.title = `${product.name} ${product.weight} — Maharashtra Bakery`;

                // Update main product title
                const titleElement = document.querySelector('h1 span');
                if (titleElement) titleElement.textContent = `${product.name} ${product.weight}`;

                // Update price
                const priceElement = document.querySelector('.text-4xl.font-bold');
                if (priceElement) priceElement.textContent = `₹${product.price}`;

                // Update category
                const categoryElement = document.querySelector('.text-\\[10px\\].font-bold.uppercase.tracking-widest');
                if (categoryElement) categoryElement.textContent = product.category.toUpperCase();

                // Update main image
                const mainImage = document.querySelector('.product-img-wrap img');
                if (mainImage) mainImage.src = product.image;

                // Update gallery thumbnails
                const thumbs = document.querySelectorAll('.thumb-item img');
                thumbs.forEach((thumb, index) => {
                    if (product.gallery[index]) {
                        thumb.src = product.gallery[index];
                    }
                });

                // Update meta description
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.content = product.description;

                // Update product data attribute for cart functionality
                const productContainer = document.querySelector('[data-product]');
                if (productContainer) {
                    const productData = {
                        id: productId,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image,
                        weight: product.weight
                    };
                    productContainer.setAttribute('data-product', JSON.stringify(productData));
                }
            }
        }
    }

    // Initial UI Sync
    updateCartCountUI();
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutCart();
    }
});

// --- Premium Warm Ambient GSAP Effect ---
function initAmbientBackground() {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    script.onload = () => {
        const bodyOrMain = document.querySelector('.min-h-screen') || document.body;

        // Remove existing ambient bg if re-initialized
        const existing = document.querySelector('.ambient-premium-bg');
        if (existing) existing.remove();

        const bgContainer = document.createElement('div');
        bgContainer.className = 'ambient-premium-bg';

        const orbs = [
            '<div class="glowing-orb orb-1"></div>',
            '<div class="glowing-orb orb-2"></div>',
            `<svg class="floating-cookie cookie-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cookie-grad1" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#dfa974"/>
                        <stop offset="70%" stop-color="#c38647"/>
                        <stop offset="100%" stop-color="#9a622a"/>
                    </radialGradient>
                    <radialGradient id="chip-grad" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stop-color="#4a2a14"/>
                        <stop offset="100%" stop-color="#2a1608"/>
                    </radialGradient>
                    <filter id="shadow1" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="3" dy="5" stdDeviation="4" flood-opacity="0.25"/>
                    </filter>
                </defs>
                <!-- Organic uneven cookie shape -->
                <path d="M50 5 C75 5 95 20 95 50 C95 80 80 95 50 95 C25 95 5 80 5 50 C5 25 25 5 50 5 Z" fill="url(#cookie-grad1)" filter="url(#shadow1)" />
                <!-- Bake cracks/texture -->
                <path d="M20 50 Q30 40 40 45" stroke="#a66e38" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round"/>
                <path d="M60 80 Q70 70 80 75" stroke="#a66e38" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round"/>
                <path d="M75 25 Q65 30 55 20" stroke="#a66e38" stroke-width="1.5" fill="none" opacity="0.5" stroke-linecap="round"/>
                <!-- Chocolate Chips -->
                <circle cx="30" cy="40" r="6.5" fill="url(#chip-grad)" />
                <circle cx="65" cy="30" r="5.5" fill="url(#chip-grad)" />
                <circle cx="70" cy="65" r="7.5" fill="url(#chip-grad)" />
                <circle cx="40" cy="68" r="5.5" fill="url(#chip-grad)" />
                <circle cx="52" cy="50" r="8.5" fill="url(#chip-grad)" />
                <circle cx="22" cy="60" r="4.5" fill="url(#chip-grad)" />
                <circle cx="80" cy="48" r="4.5" fill="url(#chip-grad)" />
                <circle cx="45" cy="20" r="5" fill="url(#chip-grad)" />
            </svg>`,
            `<svg class="floating-cookie cookie-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="cookie-grad2" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stop-color="#c98c50"/>
                        <stop offset="80%" stop-color="#a66e38"/>
                        <stop offset="100%" stop-color="#7a4c21"/>
                    </radialGradient>
                    <filter id="shadow2" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.25"/>
                    </filter>
                </defs>
                <path d="M50 10 C70 10 90 25 88 50 C85 75 75 90 50 88 C25 85 10 75 12 50 C15 25 30 10 50 10 Z" fill="url(#cookie-grad2)" filter="url(#shadow2)" />
                <path d="M30 65 Q40 55 35 45" stroke="#875627" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
                <path d="M70 40 Q60 50 65 60" stroke="#875627" stroke-width="1.5" fill="none" opacity="0.4" stroke-linecap="round"/>
                <circle cx="35" cy="45" r="5.5" fill="url(#chip-grad)" />
                <circle cx="60" cy="35" r="6.5" fill="url(#chip-grad)" />
                <circle cx="65" cy="65" r="5.5" fill="url(#chip-grad)" />
                <circle cx="45" cy="60" r="7.5" fill="url(#chip-grad)" />
                <circle cx="25" cy="30" r="4.5" fill="url(#chip-grad)" />
                <circle cx="75" cy="50" r="5" fill="url(#chip-grad)" />
            </svg>`
        ];

        bgContainer.innerHTML = orbs.join('');

        // Prepend to body so it sits behind the relative sections
        bodyOrMain.prepend(bgContainer);

        // Ensure content displays above the ambient GSAP background
        const mainEls = document.querySelectorAll('main, footer');
        mainEls.forEach(el => {
            el.style.position = 'relative';
            el.style.zIndex = '10';
        });

        // Slow glow orb movement
        gsap.to('.glowing-orb', {
            y: "random(-20, 20)vh",
            x: "random(-20, 20)vw",
            duration: "random(10, 15)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Floating cookies movement
        gsap.to('.floating-cookie', {
            y: "-=30",
            x: "+=20",
            rotation: "random(-15, 15)",
            duration: "random(15, 20)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 2
        });

        gsap.to('.floating-cookie', {
            rotation: 360,
            duration: "random(40, 60)",
            repeat: -1,
            ease: "linear"
        });
    };
    if (!document.head.querySelector('script[src*="gsap.min.js"]')) {
        document.head.appendChild(script);
    } else {
        script.onload();
    }
}

// --- Premium Preloader GSAP Effect ---
function initPreloader() {
    const preloaderHTML = `
        <div class="premium-preloader" id="premium-preloader">
            <div class="preloader-overlay" id="preloader-overlay"></div>
            <!-- Falling ingredients container -->
            <div class="falling-ingredients" id="falling-ingredients">
                <!-- Chocolate chips (repeating) -->
                <svg class="falling-chip chocolate-chip" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M30 4 C42 3 56 12 56 30 C56 47 45 56 30 56 C15 56 4 47 4 30 C4 14 16 5 30 4 Z" fill="#2f1a0e"/>
                    <path d="M30 8 C40 8 50 16 50 30 C50 43 41 50 30 50 C19 50 10 43 10 30 C10 17 20 8 30 8 Z" fill="#3d2314"/>
                    <ellipse cx="22" cy="22" rx="9" ry="7" fill="#533018" opacity="0.55"/>
                    <ellipse cx="23" cy="20" rx="4" ry="3" fill="#6b3b1b" opacity="0.7"/>
                    <ellipse cx="39" cy="40" rx="6" ry="5" fill="#1f1209" opacity="0.35"/>
                </svg>
                <svg class="falling-chip chocolate-chip" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M30 4 C42 3 56 12 56 30 C56 47 45 56 30 56 C15 56 4 47 4 30 C4 14 16 5 30 4 Z" fill="#2f1a0e"/>
                    <path d="M30 8 C40 8 50 16 50 30 C50 43 41 50 30 50 C19 50 10 43 10 30 C10 17 20 8 30 8 Z" fill="#3d2314"/>
                    <ellipse cx="22" cy="22" rx="9" ry="7" fill="#533018" opacity="0.55"/>
                    <ellipse cx="23" cy="20" rx="4" ry="3" fill="#6b3b1b" opacity="0.7"/>
                    <ellipse cx="39" cy="40" rx="6" ry="5" fill="#1f1209" opacity="0.35"/>
                </svg>
                <svg class="falling-chip chocolate-chip" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M30 4 C42 3 56 12 56 30 C56 47 45 56 30 56 C15 56 4 47 4 30 C4 14 16 5 30 4 Z" fill="#2f1a0e"/>
                    <path d="M30 8 C40 8 50 16 50 30 C50 43 41 50 30 50 C19 50 10 43 10 30 C10 17 20 8 30 8 Z" fill="#3d2314"/>
                    <ellipse cx="22" cy="22" rx="9" ry="7" fill="#533018" opacity="0.55"/>
                    <ellipse cx="23" cy="20" rx="4" ry="3" fill="#6b3b1b" opacity="0.7"/>
                    <ellipse cx="39" cy="40" rx="6" ry="5" fill="#1f1209" opacity="0.35"/>
                </svg>
                <!-- Cashew/Kaju (repeating) -->
                <svg class="falling-chip cashew-chip" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 10 C38 0 64 12 68 34 C72 56 54 70 38 66 C22 62 14 40 20 10 Z" fill="#caa07a"/>
                    <path d="M26 14 C40 6 58 16 60 34 C62 50 50 60 38 58 C26 56 20 38 26 14 Z" fill="#d9b088"/>
                    <path d="M30 20 C38 14 50 22 50 32 C50 42 42 48 34 46 C26 44 24 30 30 20 Z" fill="#f0c8a0" opacity="0.75"/>
                    <path d="M48 50 C54 46 62 50 62 58 C60 64 52 66 46 62" fill="none" stroke="#b48a62" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
                </svg>
                <svg class="falling-chip cashew-chip" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 10 C38 0 64 12 68 34 C72 56 54 70 38 66 C22 62 14 40 20 10 Z" fill="#caa07a"/>
                    <path d="M26 14 C40 6 58 16 60 34 C62 50 50 60 38 58 C26 56 20 38 26 14 Z" fill="#d9b088"/>
                    <path d="M30 20 C38 14 50 22 50 32 C50 42 42 48 34 46 C26 44 24 30 30 20 Z" fill="#f0c8a0" opacity="0.75"/>
                    <path d="M48 50 C54 46 62 50 62 58 C60 64 52 66 46 62" fill="none" stroke="#b48a62" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
                </svg>
                <svg class="falling-chip cashew-chip" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 10 C38 0 64 12 68 34 C72 56 54 70 38 66 C22 62 14 40 20 10 Z" fill="#caa07a"/>
                    <path d="M26 14 C40 6 58 16 60 34 C62 50 50 60 38 58 C26 56 20 38 26 14 Z" fill="#d9b088"/>
                    <path d="M30 20 C38 14 50 22 50 32 C50 42 42 48 34 46 C26 44 24 30 30 20 Z" fill="#f0c8a0" opacity="0.75"/>
                    <path d="M48 50 C54 46 62 50 62 58 C60 64 52 66 46 62" fill="none" stroke="#b48a62" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
                </svg>
                <!-- Almond/Badam (repeating) -->
                <svg class="falling-chip almond-chip" viewBox="0 0 70 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M35 5 C48 8 58 26 60 45 C62 66 48 84 35 86 C22 84 8 66 10 45 C12 26 22 8 35 5 Z" fill="#c7925e"/>
                    <path d="M35 10 C44 12 52 28 53 45 C54 62 44 78 35 80 C26 78 16 62 17 45 C18 28 26 12 35 10 Z" fill="#d9a876"/>
                    <path d="M30 20 C36 18 42 24 42 32 C42 40 36 46 30 44 C24 42 24 26 30 20 Z" fill="#f0c39b" opacity="0.65"/>
                    <path d="M42 60 C46 62 50 68 46 72" fill="none" stroke="#b58353" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
                </svg>
                <svg class="falling-chip almond-chip" viewBox="0 0 70 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M35 5 C48 8 58 26 60 45 C62 66 48 84 35 86 C22 84 8 66 10 45 C12 26 22 8 35 5 Z" fill="#c7925e"/>
                    <path d="M35 10 C44 12 52 28 53 45 C54 62 44 78 35 80 C26 78 16 62 17 45 C18 28 26 12 35 10 Z" fill="#d9a876"/>
                    <path d="M30 20 C36 18 42 24 42 32 C42 40 36 46 30 44 C24 42 24 26 30 20 Z" fill="#f0c39b" opacity="0.65"/>
                    <path d="M42 60 C46 62 50 68 46 72" fill="none" stroke="#b58353" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
                </svg>
                <svg class="falling-chip almond-chip" viewBox="0 0 70 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M35 5 C48 8 58 26 60 45 C62 66 48 84 35 86 C22 84 8 66 10 45 C12 26 22 8 35 5 Z" fill="#c7925e"/>
                    <path d="M35 10 C44 12 52 28 53 45 C54 62 44 78 35 80 C26 78 16 62 17 45 C18 28 26 12 35 10 Z" fill="#d9a876"/>
                    <path d="M30 20 C36 18 42 24 42 32 C42 40 36 46 30 44 C24 42 24 26 30 20 Z" fill="#f0c39b" opacity="0.65"/>
                    <path d="M42 60 C46 62 50 68 46 72" fill="none" stroke="#b58353" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
                </svg>
            </div>
            <div class="preloader-brand">Maharashtra Bakery</div>
            <div class="preloader-text">Freshly Baked</div>
            <div class="preloader-line"></div>
        </div>
    `;

    // Inject preloader as the very first element
    document.body.insertAdjacentHTML('afterbegin', preloaderHTML);

    // Wait for GSAP to load
    const checkGSAP = setInterval(() => {
        if (window.gsap) {
            clearInterval(checkGSAP);
            runPreloaderAnimation();
        }
    }, 50);

    function runPreloaderAnimation() {
        const tl = gsap.timeline();
        const brandEl = document.querySelector('.preloader-brand');
        const textEl = document.querySelector('.preloader-text');
        const chipContainer = document.getElementById('falling-ingredients');
        if (chipContainer && !chipContainer.dataset.populated) {
            chipContainer.dataset.populated = 'true';
            const baseChips = Array.from(chipContainer.querySelectorAll('.falling-chip'));
            const targetCount = 30;
            for (let i = baseChips.length; i < targetCount; i++) {
                const clone = baseChips[i % baseChips.length].cloneNode(true);
                chipContainer.appendChild(clone);
            }
        }
        const chips = chipContainer ? chipContainer.querySelectorAll('.falling-chip') : [];

        // Convert text to span chars for letter-by-letter animation
        if (brandEl) {
            brandEl.innerHTML = brandEl.textContent.split('').map(char =>
                `<span style="display:inline-block;opacity:0;transform:translateY(20px) scale(0.8);">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');
        }

        if (textEl) {
            textEl.innerHTML = textEl.textContent.split('').map(char =>
                `<span style="display:inline-block;opacity:0;transform:translateY(15px) scale(0.9);">${char === ' ' ? '&nbsp;' : char}</span>`
            ).join('');
        }

        // Animate falling chips infinitely with randomized paths
        const rand = gsap.utils.random;
        if (chips.length) {
            chips.forEach((chip) => {
                gsap.set(chip, {
                    x: rand(0, window.innerWidth),
                    y: rand(-220, -60),
                    xPercent: -50,
                    scale: rand(1.0, 2.2),
                    rotation: rand(-120, 120),
                    opacity: rand(0.65, 0.95)
                });

                gsap.to(chip, {
                    y: () => window.innerHeight + rand(120, 220),
                    x: () => rand(0, window.innerWidth),
                    rotation: () => rand(120, 360),
                    duration: () => rand(3.5, 6.5),
                    delay: () => rand(0, 1.8),
                    repeat: -1,
                    repeatRefresh: true,
                    ease: 'none',
                    onRepeat: () => {
                        gsap.set(chip, {
                            x: rand(0, window.innerWidth),
                            y: rand(-220, -60),
                            xPercent: -50,
                            scale: rand(1.0, 2.2),
                            rotation: rand(-120, 120),
                            opacity: rand(0.65, 0.95)
                        });
                    }
                });
            });
        }

        // 1. Staggered letter reveal for brand with scale & rotation
        tl.to('.preloader-brand span', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'back.out(1.2)'
        }, 0.2)

            // 2. Add a subtle rotation pulse to each brand letter
            .to('.preloader-brand span', {
                rotation: 2,
                duration: 0.3,
                stagger: 0.05,
                ease: 'sine.inOut'
            }, 0.2)

            // 3. Staggered letter reveal for tagline with delay
            .to('.preloader-text span', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.04,
                ease: 'back.out(1.1)'
            }, 0.5)

            // 4. Animated progress line with width expansion and glow
            .to('.preloader-line', {
                opacity: 1,
                width: '140px',
                duration: 1.5,
                ease: 'power4.inOut',
                boxShadow: '0 0 30px rgba(230, 114, 18, 0.6)'
            }, 0.6)

            // 5. Subtle pulse of the entire text block
            .to(['.preloader-brand', '.preloader-text'], {
                scale: 1.02,
                duration: 0.4,
                ease: 'sine.inOut'
            }, "+=0.2")

            .to(['.preloader-brand', '.preloader-text'], {
                scale: 1,
                duration: 0.4,
                ease: 'sine.inOut'
            })

            // 6. Premium overlay slide up with blur fade effect
            .to('.preloader-overlay', {
                y: '0%',
                duration: 0.9,
                ease: 'power4.inOut'
            }, "+=0.1")

            // 7. Final fade out of text before curtain
            .to(['.preloader-brand', '.preloader-text', '.preloader-line'], {
                opacity: 0,
                y: -20,
                duration: 0.4,
                ease: 'power2.in'
            }, "+=0.15")

            // 8. Slide the entire preloader block up to reveal the website
            .to('.premium-preloader', {
                yPercent: -100,
                duration: 1.2,
                ease: 'power4.inOut',
                onComplete: () => {
                    const preloader = document.getElementById('premium-preloader');
                    if (preloader) preloader.remove();
                }
            }, "-=0.5");
    }
}

// Trigger preloader only on landing page, then ambient effect on all pages
const isLandingPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
if (isLandingPage) {
    initPreloader();
}
initAmbientBackground();

