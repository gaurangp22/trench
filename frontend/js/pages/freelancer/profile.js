// Freelancer Profile Edit Page JavaScript

const ProfilePage = {
    profile: null,
    skills: [],
    allSkills: [],
    selectedCategory: null,

    /**
     * Initialize profile page
     */
    init() {
        Toast.init();
        this.checkAuth();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadProfile();
        this.loadSkills();
    },

    /**
     * Check authentication
     */
    checkAuth() {
        if (!Storage.isAuthenticated()) {
            window.location.href = '/pages/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return;
        }

        const user = Storage.getUser();
        if (!user.is_freelancer) {
            window.location.href = '/pages/client/dashboard.html';
            return;
        }
    },

    /**
     * Setup section navigation
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.profile-nav-item');
        const sections = document.querySelectorAll('.profile-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section;

                // Update nav
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Update sections
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(sectionId)?.classList.add('active');
            });
        });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Basic info form
        document.getElementById('basic-info-form')?.addEventListener('submit', (e) => this.handleBasicInfoSubmit(e));

        // Professional form
        document.getElementById('professional-form')?.addEventListener('submit', (e) => this.handleProfessionalSubmit(e));

        // Availability form
        document.getElementById('availability-form')?.addEventListener('submit', (e) => this.handleAvailabilitySubmit(e));

        // Skill search
        const skillSearch = document.getElementById('skill-search');
        if (skillSearch) {
            skillSearch.addEventListener('input', (e) => this.handleSkillSearch(e.target.value));
            skillSearch.addEventListener('focus', () => this.showSkillSuggestions());
        }

        // Hide suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.skill-search')) {
                document.getElementById('skill-suggestions')?.classList.add('hidden');
            }
        });

        // Portfolio button
        document.getElementById('add-portfolio-btn')?.addEventListener('click', () => this.openPortfolioModal());

        // Portfolio modal close
        document.getElementById('close-portfolio-modal')?.addEventListener('click', () => this.closePortfolioModal());
        document.getElementById('cancel-portfolio')?.addEventListener('click', () => this.closePortfolioModal());
        document.querySelector('.modal-backdrop')?.addEventListener('click', () => this.closePortfolioModal());

        // Portfolio form
        document.getElementById('portfolio-form')?.addEventListener('submit', (e) => this.handlePortfolioSubmit(e));

        // Avatar upload
        document.getElementById('avatar-input')?.addEventListener('change', (e) => this.handleAvatarChange(e));
    },

    /**
     * Load user profile
     */
    async loadProfile() {
        try {
            const response = await API.profile.getMyProfile();
            this.profile = response.profile;
            this.skills = response.skills || [];

            this.populateForm();
            this.renderSkills();
            this.renderPortfolio(response.portfolio || []);

            // Update avatar initial
            const user = Storage.getUser();
            const initial = (this.profile?.display_name || user.username || user.email).charAt(0).toUpperCase();
            document.getElementById('avatar-initial').textContent = initial;

            // If avatar URL exists, show image
            if (this.profile?.avatar_url) {
                const preview = document.getElementById('avatar-preview');
                preview.innerHTML = `<img src="${this.profile.avatar_url}" alt="Avatar">`;
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            if (error.message?.includes('not found')) {
                // Profile doesn't exist yet, that's okay
                return;
            }
            Toast.error('Failed to load profile');
        }
    },

    /**
     * Populate form with profile data
     */
    populateForm() {
        if (!this.profile) return;

        // Basic info
        document.getElementById('display-name').value = this.profile.display_name || '';
        document.getElementById('professional-title').value = this.profile.professional_title || '';
        document.getElementById('overview').value = this.profile.overview || '';
        document.getElementById('country').value = this.profile.country || '';
        document.getElementById('city').value = this.profile.city || '';
        document.getElementById('timezone').value = this.profile.timezone || '';

        // Professional
        document.getElementById('cover-image').value = this.profile.cover_image_url || '';

        // Availability
        const statusRadio = document.querySelector(`input[name="availability_status"][value="${this.profile.availability_status || 'available'}"]`);
        if (statusRadio) statusRadio.checked = true;

        document.getElementById('available-for-hire').checked = this.profile.available_for_hire !== false;
        document.getElementById('hourly-rate').value = this.profile.hourly_rate_sol || '';
        document.getElementById('minimum-project').value = this.profile.minimum_project_sol || '';
    },

    /**
     * Load all skills for categories
     */
    async loadSkills() {
        try {
            const response = await API.skills.getAll();
            this.allSkills = response.skills || [];
            this.renderCategories();
        } catch (error) {
            console.error('Failed to load skills:', error);
        }
    },

    /**
     * Render skill categories
     */
    renderCategories() {
        const categories = [...new Set(this.allSkills.map(s => s.category).filter(Boolean))];
        const tabsContainer = document.getElementById('category-tabs');

        tabsContainer.innerHTML = categories.map((cat, i) => `
            <button type="button" class="category-tab ${i === 0 ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        // Add click listeners
        tabsContainer.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabsContainer.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.selectedCategory = tab.dataset.category;
                this.renderCategorySkills(tab.dataset.category);
            });
        });

        // Render first category
        if (categories.length > 0) {
            this.selectedCategory = categories[0];
            this.renderCategorySkills(categories[0]);
        }
    },

    /**
     * Render skills for a category
     */
    renderCategorySkills(category) {
        const container = document.getElementById('category-skills');
        const categorySkills = this.allSkills.filter(s => s.category === category);
        const userSkillIds = this.skills.map(s => s.id);

        container.innerHTML = categorySkills.map(skill => `
            <button type="button" class="category-skill ${userSkillIds.includes(skill.id) ? 'selected' : ''}"
                    data-skill-id="${skill.id}" data-skill-name="${skill.name}">
                ${skill.name}
            </button>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.category-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                const skillId = parseInt(btn.dataset.skillId);
                const skillName = btn.dataset.skillName;

                if (btn.classList.contains('selected')) {
                    this.removeSkill(skillId);
                    btn.classList.remove('selected');
                } else {
                    this.addSkill({ id: skillId, name: skillName });
                    btn.classList.add('selected');
                }
            });
        });
    },

    /**
     * Render current user skills
     */
    renderSkills() {
        const container = document.getElementById('current-skills');

        if (this.skills.length === 0) {
            container.innerHTML = '<p class="text-muted">No skills added yet</p>';
            return;
        }

        container.innerHTML = this.skills.map(skill => `
            <div class="skill-tag">
                ${skill.name}
                <button type="button" class="remove-skill" data-skill-id="${skill.id}">&times;</button>
            </div>
        `).join('');

        // Add remove listeners
        container.querySelectorAll('.remove-skill').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeSkill(parseInt(btn.dataset.skillId));
            });
        });
    },

    /**
     * Handle skill search
     */
    handleSkillSearch(query) {
        const suggestions = document.getElementById('skill-suggestions');

        if (query.length < 2) {
            suggestions.classList.add('hidden');
            return;
        }

        const matches = this.allSkills.filter(skill =>
            skill.name.toLowerCase().includes(query.toLowerCase()) &&
            !this.skills.find(s => s.id === skill.id)
        ).slice(0, 10);

        if (matches.length === 0) {
            suggestions.classList.add('hidden');
            return;
        }

        suggestions.innerHTML = matches.map(skill => `
            <div class="skill-suggestion" data-skill-id="${skill.id}" data-skill-name="${skill.name}">
                ${skill.name}
                <span class="text-muted text-sm">${skill.category || ''}</span>
            </div>
        `).join('');

        suggestions.querySelectorAll('.skill-suggestion').forEach(el => {
            el.addEventListener('click', () => {
                this.addSkill({ id: parseInt(el.dataset.skillId), name: el.dataset.skillName });
                document.getElementById('skill-search').value = '';
                suggestions.classList.add('hidden');
            });
        });

        suggestions.classList.remove('hidden');
    },

    /**
     * Show skill suggestions
     */
    showSkillSuggestions() {
        const query = document.getElementById('skill-search').value;
        if (query.length >= 2) {
            this.handleSkillSearch(query);
        }
    },

    /**
     * Add a skill
     */
    async addSkill(skill) {
        try {
            await API.profile.addSkill({ skill_id: skill.id });
            this.skills.push(skill);
            this.renderSkills();
            Toast.success(`Added ${skill.name}`);
        } catch (error) {
            Toast.error('Failed to add skill');
        }
    },

    /**
     * Remove a skill
     */
    async removeSkill(skillId) {
        try {
            await API.profile.removeSkill(skillId);
            this.skills = this.skills.filter(s => s.id !== skillId);
            this.renderSkills();

            // Update category skill buttons
            document.querySelectorAll(`.category-skill[data-skill-id="${skillId}"]`).forEach(btn => {
                btn.classList.remove('selected');
            });

            Toast.success('Skill removed');
        } catch (error) {
            Toast.error('Failed to remove skill');
        }
    },

    /**
     * Handle basic info form submission
     */
    async handleBasicInfoSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        try {
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const data = {
                display_name: form.querySelector('#display-name').value || null,
                professional_title: form.querySelector('#professional-title').value || null,
                overview: form.querySelector('#overview').value || null,
                country: form.querySelector('#country').value || null,
                city: form.querySelector('#city').value || null,
                timezone: form.querySelector('#timezone').value || null
            };

            await API.profile.update(data);
            Toast.success('Profile updated successfully');

            // Update local profile
            Object.assign(this.profile || {}, data);
        } catch (error) {
            Toast.error(error.message || 'Failed to update profile');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    /**
     * Handle professional form submission
     */
    async handleProfessionalSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        try {
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const data = {
                cover_image_url: form.querySelector('#cover-image').value || null
            };

            await API.profile.update(data);
            Toast.success('Profile updated successfully');
        } catch (error) {
            Toast.error(error.message || 'Failed to update profile');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    /**
     * Handle availability form submission
     */
    async handleAvailabilitySubmit(e) {
        e.preventDefault();

        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        try {
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const data = {
                availability_status: form.querySelector('input[name="availability_status"]:checked')?.value,
                available_for_hire: form.querySelector('#available-for-hire').checked,
                hourly_rate_sol: form.querySelector('#hourly-rate').value ? parseFloat(form.querySelector('#hourly-rate').value) : null,
                minimum_project_sol: form.querySelector('#minimum-project').value ? parseFloat(form.querySelector('#minimum-project').value) : null
            };

            await API.profile.update(data);
            Toast.success('Availability updated successfully');
        } catch (error) {
            Toast.error(error.message || 'Failed to update availability');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    /**
     * Render portfolio items
     */
    renderPortfolio(items) {
        const container = document.getElementById('portfolio-grid');

        if (!items || items.length === 0) {
            container.innerHTML = '<p class="text-muted">No portfolio items yet</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="portfolio-item" data-id="${item.id}">
                <div class="portfolio-image">
                    ${item.image_urls && item.image_urls[0] ?
                        `<img src="${item.image_urls[0]}" alt="${item.title}">` :
                        'No Image'
                    }
                </div>
                <div class="portfolio-info">
                    <div class="portfolio-title">${item.title}</div>
                    ${item.description ? `<div class="portfolio-description">${item.description}</div>` : ''}
                    <div class="portfolio-actions">
                        <button class="btn btn-sm btn-ghost edit-portfolio" data-id="${item.id}">Edit</button>
                        <button class="btn btn-sm btn-ghost text-danger delete-portfolio" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add edit/delete listeners
        container.querySelectorAll('.edit-portfolio').forEach(btn => {
            btn.addEventListener('click', () => this.editPortfolioItem(btn.dataset.id));
        });
        container.querySelectorAll('.delete-portfolio').forEach(btn => {
            btn.addEventListener('click', () => this.deletePortfolioItem(btn.dataset.id));
        });
    },

    /**
     * Open portfolio modal
     */
    openPortfolioModal(item = null) {
        const modal = document.getElementById('portfolio-modal');
        const title = document.getElementById('portfolio-modal-title');
        const form = document.getElementById('portfolio-form');

        if (item) {
            title.textContent = 'Edit Portfolio Item';
            form.querySelector('#portfolio-title').value = item.title;
            form.querySelector('#portfolio-description').value = item.description || '';
            form.querySelector('#portfolio-url').value = item.project_url || '';
            form.querySelector('#portfolio-image').value = item.image_urls?.[0] || '';
            form.querySelector('#portfolio-id').value = item.id;
        } else {
            title.textContent = 'Add Portfolio Item';
            form.reset();
            form.querySelector('#portfolio-id').value = '';
        }

        modal.classList.remove('hidden');
    },

    /**
     * Close portfolio modal
     */
    closePortfolioModal() {
        document.getElementById('portfolio-modal').classList.add('hidden');
    },

    /**
     * Edit portfolio item
     */
    async editPortfolioItem(id) {
        // For now just open modal - would need to fetch item data
        try {
            const response = await API.profile.getMyProfile();
            const item = response.portfolio?.find(p => p.id === id);
            if (item) {
                this.openPortfolioModal(item);
            }
        } catch (error) {
            Toast.error('Failed to load portfolio item');
        }
    },

    /**
     * Delete portfolio item
     */
    async deletePortfolioItem(id) {
        if (!confirm('Are you sure you want to delete this portfolio item?')) {
            return;
        }

        try {
            await API.profile.deletePortfolioItem(id);
            Toast.success('Portfolio item deleted');

            // Reload portfolio
            const response = await API.profile.getMyProfile();
            this.renderPortfolio(response.portfolio || []);
        } catch (error) {
            Toast.error('Failed to delete portfolio item');
        }
    },

    /**
     * Handle portfolio form submission
     */
    async handlePortfolioSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        const itemId = form.querySelector('#portfolio-id').value;

        try {
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const imageUrl = form.querySelector('#portfolio-image').value;

            const data = {
                title: form.querySelector('#portfolio-title').value,
                description: form.querySelector('#portfolio-description').value || null,
                project_url: form.querySelector('#portfolio-url').value || null,
                image_urls: imageUrl ? [imageUrl] : []
            };

            if (itemId) {
                await API.profile.updatePortfolioItem(itemId, data);
            } else {
                await API.profile.createPortfolioItem(data);
            }

            Toast.success('Portfolio item saved');
            this.closePortfolioModal();

            // Reload portfolio
            const response = await API.profile.getMyProfile();
            this.renderPortfolio(response.portfolio || []);
        } catch (error) {
            Toast.error(error.message || 'Failed to save portfolio item');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    },

    /**
     * Handle avatar change
     */
    handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            Toast.error('Image must be less than 5MB');
            return;
        }

        // For now, just show preview - would need to upload to server
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatar-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
        };
        reader.readAsDataURL(file);

        Toast.info('Avatar preview shown. Full upload coming soon!');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ProfilePage.init();
});
