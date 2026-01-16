// Reviews Component

const ReviewsComponent = {
    /**
     * Render a star rating display
     */
    renderStars(rating, maxRating = 5) {
        let html = '<div class="stars-display">';
        for (let i = 1; i <= maxRating; i++) {
            if (i <= rating) {
                html += '<span class="star filled">★</span>';
            } else {
                html += '<span class="star empty">☆</span>';
            }
        }
        html += '</div>';
        return html;
    },

    /**
     * Render an interactive star rating input
     */
    renderStarInput(name, value = 0, required = false) {
        return `
            <div class="stars-input" data-name="${name}" data-value="${value}">
                ${[1, 2, 3, 4, 5].map(i => `
                    <button type="button" class="star-btn ${i <= value ? 'active' : ''}" data-value="${i}">
                        <span class="star">${i <= value ? '★' : '☆'}</span>
                    </button>
                `).join('')}
                <input type="hidden" name="${name}" value="${value}" ${required ? 'required' : ''}>
            </div>
        `;
    },

    /**
     * Initialize star rating inputs
     */
    initStarInputs(container) {
        container.querySelectorAll('.stars-input').forEach(starsInput => {
            const buttons = starsInput.querySelectorAll('.star-btn');
            const hiddenInput = starsInput.querySelector('input[type="hidden"]');

            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const value = parseInt(btn.dataset.value);
                    hiddenInput.value = value;
                    starsInput.dataset.value = value;

                    buttons.forEach((b, idx) => {
                        const btnValue = idx + 1;
                        b.classList.toggle('active', btnValue <= value);
                        b.querySelector('.star').textContent = btnValue <= value ? '★' : '☆';
                    });
                });

                btn.addEventListener('mouseenter', () => {
                    const hoverValue = parseInt(btn.dataset.value);
                    buttons.forEach((b, idx) => {
                        const btnValue = idx + 1;
                        b.querySelector('.star').textContent = btnValue <= hoverValue ? '★' : '☆';
                    });
                });

                btn.addEventListener('mouseleave', () => {
                    const currentValue = parseInt(starsInput.dataset.value);
                    buttons.forEach((b, idx) => {
                        const btnValue = idx + 1;
                        b.querySelector('.star').textContent = btnValue <= currentValue ? '★' : '☆';
                    });
                });
            });
        });
    },

    /**
     * Render a review card
     */
    renderReviewCard(review) {
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-author">
                        <div class="author-avatar">
                            ${review.reviewer_username ? review.reviewer_username.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div class="author-info">
                            <span class="author-name">${this.escapeHtml(review.reviewer_username || 'Anonymous')}</span>
                            <span class="review-date">${this.formatDate(review.created_at)}</span>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(review.overall_rating)}
                    </div>
                </div>
                ${review.review_text ? `
                    <div class="review-content">
                        <p>${this.escapeHtml(review.review_text)}</p>
                    </div>
                ` : ''}
                ${this.renderDetailedRatings(review)}
            </div>
        `;
    },

    /**
     * Render detailed ratings breakdown
     */
    renderDetailedRatings(review) {
        const ratings = [];
        if (review.communication_rating) {
            ratings.push({ label: 'Communication', value: review.communication_rating });
        }
        if (review.quality_rating) {
            ratings.push({ label: 'Quality', value: review.quality_rating });
        }
        if (review.expertise_rating) {
            ratings.push({ label: 'Expertise', value: review.expertise_rating });
        }
        if (review.professionalism_rating) {
            ratings.push({ label: 'Professionalism', value: review.professionalism_rating });
        }

        if (ratings.length === 0) return '';

        return `
            <div class="review-detailed-ratings">
                ${ratings.map(r => `
                    <div class="rating-item">
                        <span class="rating-label">${r.label}</span>
                        <span class="rating-value">${this.renderStars(r.value)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Render the review form
     */
    renderReviewForm(contractId) {
        return `
            <form class="review-form" id="review-form" data-contract-id="${contractId}">
                <h3>Leave a Review</h3>

                <div class="form-group">
                    <label>Overall Rating <span class="required">*</span></label>
                    ${this.renderStarInput('overall_rating', 0, true)}
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Communication</label>
                        ${this.renderStarInput('communication_rating', 0)}
                    </div>
                    <div class="form-group">
                        <label>Quality</label>
                        ${this.renderStarInput('quality_rating', 0)}
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Expertise</label>
                        ${this.renderStarInput('expertise_rating', 0)}
                    </div>
                    <div class="form-group">
                        <label>Professionalism</label>
                        ${this.renderStarInput('professionalism_rating', 0)}
                    </div>
                </div>

                <div class="form-group">
                    <label>Would you recommend?</label>
                    <div class="toggle-group">
                        <label class="toggle-option">
                            <input type="radio" name="would_recommend" value="true">
                            <span>Yes</span>
                        </label>
                        <label class="toggle-option">
                            <input type="radio" name="would_recommend" value="false">
                            <span>No</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Your Review</label>
                    <textarea name="review_text" rows="4" placeholder="Share your experience working with this person..."></textarea>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="is_public" checked>
                        <span>Make this review public</span>
                    </label>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Submit Review</button>
                </div>
            </form>
        `;
    },

    /**
     * Initialize review form
     */
    initReviewForm(container) {
        this.initStarInputs(container);

        const form = container.querySelector('#review-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitReview(form);
        });
    },

    /**
     * Submit a review
     */
    async submitReview(form) {
        const contractId = form.dataset.contractId;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            const formData = new FormData(form);
            const data = {
                contract_id: contractId,
                overall_rating: parseInt(formData.get('overall_rating')),
                is_public: formData.get('is_public') === 'on'
            };

            if (formData.get('communication_rating')) {
                data.communication_rating = parseInt(formData.get('communication_rating'));
            }
            if (formData.get('quality_rating')) {
                data.quality_rating = parseInt(formData.get('quality_rating'));
            }
            if (formData.get('expertise_rating')) {
                data.expertise_rating = parseInt(formData.get('expertise_rating'));
            }
            if (formData.get('professionalism_rating')) {
                data.professionalism_rating = parseInt(formData.get('professionalism_rating'));
            }
            if (formData.get('would_recommend')) {
                data.would_recommend = formData.get('would_recommend') === 'true';
            }
            if (formData.get('review_text')) {
                data.review_text = formData.get('review_text');
            }

            if (!data.overall_rating || data.overall_rating < 1) {
                Toast.error('Please provide an overall rating');
                return;
            }

            await API.reviews.create(data);
            Toast.success('Review submitted successfully');

            // Reload the page or update the UI
            window.location.reload();
        } catch (error) {
            Toast.error(error.message || 'Failed to submit review');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    /**
     * Load and display reviews for a user
     */
    async loadUserReviews(userId, container, limit = 10) {
        try {
            const data = await API.reviews.getByUser(userId, { limit });

            if (!data.reviews || data.reviews.length === 0) {
                container.innerHTML = '<p class="no-reviews">No reviews yet</p>';
                return;
            }

            container.innerHTML = data.reviews.map(r => this.renderReviewCard(r)).join('');
        } catch (error) {
            console.error('Failed to load reviews:', error);
            container.innerHTML = '<p class="error">Failed to load reviews</p>';
        }
    },

    /**
     * Calculate average rating
     */
    calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.overall_rating, 0);
        return (sum / reviews.length).toFixed(1);
    },

    formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
