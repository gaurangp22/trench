// Toast Notification Component

const Toast = {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = DOM.createElement('div', { id: 'toast-container' });
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show a toast notification
     */
    show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
        if (!this.container) this.init();

        const toast = DOM.createElement('div', {
            className: `toast ${type}`
        }, [
            DOM.createElement('span', { className: 'toast-icon' }, [this.getIcon(type)]),
            DOM.createElement('span', { className: 'toast-message' }, [message]),
            DOM.createElement('button', {
                className: 'toast-close',
                onClick: () => this.dismiss(toast)
            }, ['\u00D7'])
        ]);

        this.container.appendChild(toast);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Dismiss a toast
     */
    dismiss(toast) {
        if (!toast || !toast.parentNode) return;

        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    /**
     * Get icon for toast type
     */
    getIcon(type) {
        const icons = {
            success: '\u2714',
            error: '\u2716',
            warning: '\u26A0',
            info: '\u2139'
        };
        return icons[type] || icons.info;
    },

    /**
     * Convenience methods
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
