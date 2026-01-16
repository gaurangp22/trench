// Notifications Component

const NotificationsComponent = {
    unreadCount: 0,
    notifications: [],
    isOpen: false,
    pollInterval: null,

    async init() {
        this.render();
        await this.loadUnreadCount();
        this.startPolling();
        this.bindEvents();
    },

    render() {
        const container = document.getElementById('notifications-container');
        if (!container) return;

        container.innerHTML = `
            <div class="notifications-wrapper">
                <button class="notifications-btn" id="notifications-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span class="notifications-badge" id="notifications-badge" style="display: none;">0</span>
                </button>
                <div class="notifications-dropdown" id="notifications-dropdown" style="display: none;">
                    <div class="notifications-header">
                        <h3>Notifications</h3>
                        <button class="btn-text" id="mark-all-read">Mark all read</button>
                    </div>
                    <div class="notifications-list" id="notifications-list">
                        <div class="notifications-empty">No notifications</div>
                    </div>
                </div>
            </div>
        `;
    },

    bindEvents() {
        const toggleBtn = document.getElementById('notifications-toggle');
        const dropdown = document.getElementById('notifications-dropdown');
        const markAllBtn = document.getElementById('mark-all-read');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllAsRead();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && dropdown && !dropdown.contains(e.target)) {
                this.close();
            }
        });
    },

    async loadUnreadCount() {
        try {
            const data = await API.notifications.getUnreadCount();
            this.updateBadge(data.unread_count);
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    },

    async loadNotifications() {
        try {
            const data = await API.notifications.list({ limit: 20 });
            this.notifications = data.notifications || [];
            this.renderNotifications();
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    },

    updateBadge(count) {
        this.unreadCount = count;
        const badge = document.getElementById('notifications-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        if (!list) return;

        if (!this.notifications || this.notifications.length === 0) {
            list.innerHTML = '<div class="notifications-empty">No notifications</div>';
            return;
        }

        list.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.is_read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notification-icon ${this.getIconClass(n.type)}">
                    ${this.getIcon(n.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${this.escapeHtml(n.title)}</div>
                    ${n.message ? `<div class="notification-message">${this.escapeHtml(n.message)}</div>` : ''}
                    <div class="notification-time">${this.formatTime(n.created_at)}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers to notification items
        list.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.markAsRead(id);
                this.navigateToNotification(this.notifications.find(n => n.id === id));
            });
        });
    },

    getIconClass(type) {
        const classes = {
            'new_proposal': 'icon-proposal',
            'proposal_accepted': 'icon-success',
            'milestone_submitted': 'icon-milestone',
            'payment_received': 'icon-payment',
            'new_message': 'icon-message',
            'contract_started': 'icon-contract',
            'contract_completed': 'icon-success',
            'dispute_opened': 'icon-warning',
            'dispute_resolved': 'icon-success',
            'new_review': 'icon-review'
        };
        return classes[type] || 'icon-default';
    },

    getIcon(type) {
        const icons = {
            'new_proposal': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
            'proposal_accepted': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            'milestone_submitted': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            'payment_received': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
            'new_message': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            'contract_started': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
            'contract_completed': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            'dispute_opened': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            'dispute_resolved': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            'new_review': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        };
        return icons[type] || '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    },

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    async toggle() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (!dropdown) return;

        this.isOpen = !this.isOpen;
        dropdown.style.display = this.isOpen ? 'block' : 'none';

        if (this.isOpen) {
            await this.loadNotifications();
        }
    },

    close() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            this.isOpen = false;
        }
    },

    async markAsRead(id) {
        try {
            await API.notifications.markAsRead(id);
            const notification = this.notifications.find(n => n.id === id);
            if (notification && !notification.is_read) {
                notification.is_read = true;
                this.updateBadge(Math.max(0, this.unreadCount - 1));
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    async markAllAsRead() {
        try {
            await API.notifications.markAllAsRead();
            this.notifications.forEach(n => n.is_read = true);
            this.updateBadge(0);
            this.renderNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    navigateToNotification(notification) {
        if (!notification) return;

        this.close();

        if (notification.contract_id) {
            window.location.href = `/pages/contracts.html?id=${notification.contract_id}`;
        } else if (notification.job_id) {
            window.location.href = `/pages/jobs/detail.html?id=${notification.job_id}`;
        } else if (notification.proposal_id) {
            window.location.href = `/pages/proposals.html?id=${notification.proposal_id}`;
        }
    },

    startPolling() {
        // Poll for new notifications every 30 seconds
        this.pollInterval = setInterval(() => {
            this.loadUnreadCount();
        }, 30000);
    },

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    },

    destroy() {
        this.stopPolling();
    }
};

// Initialize notifications when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    if (Storage.getToken()) {
        NotificationsComponent.init();
    }
});

// Clean up on logout
window.addEventListener('auth:logout', () => {
    NotificationsComponent.destroy();
});
