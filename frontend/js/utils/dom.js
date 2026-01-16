// DOM Utility Functions

const DOM = {
    /**
     * Query selector shorthand
     */
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * Query selector all shorthand
     */
    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    /**
     * Create element with attributes and children
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    },

    /**
     * Add event listener with delegation
     */
    delegate(parent, eventType, selector, handler) {
        parent.addEventListener(eventType, (event) => {
            const target = event.target.closest(selector);
            if (target && parent.contains(target)) {
                handler.call(target, event, target);
            }
        });
    },

    /**
     * Show element
     */
    show(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },

    /**
     * Hide element
     */
    hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    },

    /**
     * Toggle element visibility
     */
    toggle(element, force) {
        if (element) {
            element.classList.toggle('hidden', force !== undefined ? !force : undefined);
        }
    },

    /**
     * Check if element is visible
     */
    isVisible(element) {
        return element && !element.classList.contains('hidden');
    },

    /**
     * Get form data as object
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            // Handle multiple values (e.g., checkboxes)
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });

        return data;
    },

    /**
     * Set form data from object
     */
    setFormData(form, data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = Boolean(value);
                } else if (input.type === 'radio') {
                    const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value;
                }
            }
        });
    },

    /**
     * Debounce function
     */
    debounce(func, wait = CONFIG.DEBOUNCE_DELAY) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format SOL amount
     */
    formatSOL(amount, decimals = 2) {
        const num = parseFloat(amount) || 0;
        return `◎ ${num.toFixed(decimals)}`;
    },

    /**
     * Format wallet address (truncate)
     */
    formatWalletAddress(address, start = 4, end = 4) {
        if (!address || address.length < start + end + 3) return address;
        return `${address.slice(0, start)}...${address.slice(-end)}`;
    },

    /**
     * Format date
     */
    formatDate(date, options = {}) {
        const d = new Date(date);
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },

    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = new Date();
        const d = new Date(date);
        const diff = now - d;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return DOM.formatDate(date);
    },

    /**
     * Escape HTML
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    }
};
