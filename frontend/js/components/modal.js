// Modal Component

const Modal = {
    /**
     * Open a modal by ID
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            DOM.show(modal);
            document.body.style.overflow = 'hidden';

            // Focus first focusable element
            const focusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
        }
    },

    /**
     * Close a modal by ID or element
     */
    close(modalOrId) {
        const modal = typeof modalOrId === 'string'
            ? document.getElementById(modalOrId)
            : modalOrId;

        if (modal) {
            DOM.hide(modal);
            document.body.style.overflow = '';
        }
    },

    /**
     * Close all open modals
     */
    closeAll() {
        DOM.$$('.modal:not(.hidden)').forEach(modal => this.close(modal));
    },

    /**
     * Initialize modal event listeners
     */
    init() {
        // Close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                const modal = e.target.closest('.modal');
                if (modal) this.close(modal);
            }
        });

        // Close on close button click
        DOM.delegate(document, 'click', '.modal-close', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) this.close(modal);
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = DOM.$('.modal:not(.hidden)');
                if (openModal) this.close(openModal);
            }
        });
    },

    /**
     * Create a confirmation modal
     */
    confirm(options = {}) {
        const {
            title = 'Confirm',
            message = 'Are you sure?',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmClass = 'btn-primary',
            dangerous = false
        } = options;

        return new Promise((resolve) => {
            const modalId = 'confirm-modal-' + Date.now();

            const modal = DOM.createElement('div', {
                id: modalId,
                className: 'modal'
            }, [
                DOM.createElement('div', { className: 'modal-backdrop' }),
                DOM.createElement('div', { className: 'modal-content' }, [
                    DOM.createElement('div', { className: 'modal-header' }, [
                        DOM.createElement('h3', {}, [title]),
                        DOM.createElement('button', { className: 'modal-close' }, ['\u00D7'])
                    ]),
                    DOM.createElement('div', { className: 'modal-body' }, [
                        DOM.createElement('p', {}, [message])
                    ]),
                    DOM.createElement('div', { className: 'modal-footer' }, [
                        DOM.createElement('button', {
                            className: 'btn btn-secondary',
                            onClick: () => {
                                this.close(modal);
                                document.body.removeChild(modal);
                                resolve(false);
                            }
                        }, [cancelText]),
                        DOM.createElement('button', {
                            className: `btn ${dangerous ? 'btn-danger' : confirmClass}`,
                            onClick: () => {
                                this.close(modal);
                                document.body.removeChild(modal);
                                resolve(true);
                            }
                        }, [confirmText])
                    ])
                ])
            ]);

            document.body.appendChild(modal);
            this.open(modalId);
        });
    },

    /**
     * Create a prompt modal
     */
    prompt(options = {}) {
        const {
            title = 'Input',
            message = '',
            placeholder = '',
            defaultValue = '',
            confirmText = 'Submit',
            cancelText = 'Cancel'
        } = options;

        return new Promise((resolve) => {
            const modalId = 'prompt-modal-' + Date.now();
            let inputValue = defaultValue;

            const input = DOM.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder,
                value: defaultValue,
                onInput: (e) => inputValue = e.target.value
            });

            const modal = DOM.createElement('div', {
                id: modalId,
                className: 'modal'
            }, [
                DOM.createElement('div', { className: 'modal-backdrop' }),
                DOM.createElement('div', { className: 'modal-content' }, [
                    DOM.createElement('div', { className: 'modal-header' }, [
                        DOM.createElement('h3', {}, [title]),
                        DOM.createElement('button', { className: 'modal-close' }, ['\u00D7'])
                    ]),
                    DOM.createElement('div', { className: 'modal-body' }, [
                        message && DOM.createElement('p', {}, [message]),
                        DOM.createElement('div', { className: 'form-group' }, [input])
                    ].filter(Boolean)),
                    DOM.createElement('div', { className: 'modal-footer' }, [
                        DOM.createElement('button', {
                            className: 'btn btn-secondary',
                            onClick: () => {
                                this.close(modal);
                                document.body.removeChild(modal);
                                resolve(null);
                            }
                        }, [cancelText]),
                        DOM.createElement('button', {
                            className: 'btn btn-primary',
                            onClick: () => {
                                this.close(modal);
                                document.body.removeChild(modal);
                                resolve(inputValue);
                            }
                        }, [confirmText])
                    ])
                ])
            ]);

            document.body.appendChild(modal);
            this.open(modalId);
            input.focus();
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
});
