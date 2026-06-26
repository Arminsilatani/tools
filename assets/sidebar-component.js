/* =========================== SIDEBAR WEB COMPONENT ===========================
 * Author: Armin Silatani
 * Usage:  <sidebar-component current-app="Ravlo Calendar"></sidebar-component>
 *         Put app-specific content inside <div slot="app-content">...</div>
 * ========================================================================== */

const MENU_TOOLS = [
    { label: 'Codara Service Generator', minRole: 'general', link: 'https://arminsilatani.github.io/codara/', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Co.svg' },
    { label: 'Nolvo Sitemap Builder', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/No.svg' },
    { label: 'Qerlo Shortener', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Qe.svg' },
    { label: 'Tivra Minify', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ti.svg' },
    { label: 'Semora Schema Generator', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Se.svg' },
    { label: 'Brilo Speed Check', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Br.svg' },
    { label: 'Sorbi Robots Builder', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/So.svg' },
    { label: 'Velto Meta Inspector', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ve.svg' },
    { label: 'Zorio Image Converter', minRole: 'recruit', link: 'https://arminsilatani.github.io/zorio/', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Zo.svg' },
    { label: 'Galvo Video Converter', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ga.svg' },
    { label: 'Xelpo Pass Generator', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Xe.svg' },
    { label: 'Dirmo DNS Checker', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Di.svg' },
    { label: 'Lemro Keyword Research', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Le.svg' },
    { label: 'Hirvo Density', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Hi.svg' },
    { label: 'Jorvi Redirect', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Jo.svg' },
    { label: 'Mirto CRM', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Mi.svg' },
    { label: 'Ravlo Calendar', minRole: 'sergeant', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ra.svg', isSelf: true },
    { label: 'Rinvo Accounting', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ri.svg' },
    { label: 'Yelmo Brand Namer', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ye.svg' },
    { label: 'Cedro Flashcards', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ce.svg' },
    { label: 'Fresca Colors Tool', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Fr.svg' },
    { label: 'Ubiro Beer Cost', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ub.svg' },
    { label: 'Refacto Code Beautifier', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Re.svg' },
    { label: 'Pilvo Text Editor', minRole: 'recruit', link: 'https://arminsilatani.github.io/pilvo/', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Pi.svg' },
    { label: 'Tavio Prompt Library', minRole: 'recruit', link: 'https://arminsilatani.github.io/tavio/', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ta.svg' },
    { label: 'Falco Favicon Generator', minRole: 'recruit', link: 'https://arminsilatani.github.io/falco/', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Fa.svg' },
    { label: 'Lume Epoch Converter', minRole: 'recruit', link: 'https://arminsilatani.github.io/lume/', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Lu.svg' },
    { label: 'Valeno Expiry Date Reminder', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Va.svg' },
    { label: 'Alviano Recipe Manager', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Al.svg' },
    { label: 'Mavero Workout Tracker', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Ma.svg' },
    { label: 'Tempozio Time Tracker', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Te.svg' },
    { label: 'Belluno Wishlist', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Be.svg' },
    { label: 'Nuvello Wallpaper App', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Nu.svg' },
    { label: 'Fiora Period Tracker', minRole: 'general', link: '', iconURL: 'https://arminsilatani.github.io/tools/assets/logos/Fi.svg' },
];

const ROLE_HIERARCHY = ['recruit', 'sergeant', 'commander', 'general'];

function normalizeRole(role) {
    return String(role || '').trim().toLowerCase();
}

function hasAccess(userRole, minRole) {
    const normalizedUserRole = normalizeRole(userRole);
    const normalizedMinRole = normalizeRole(minRole || 'recruit');
    const userIndex = ROLE_HIERARCHY.indexOf(normalizedUserRole);
    const minIndex = ROLE_HIERARCHY.indexOf(normalizedMinRole);
    if (minIndex === -1 || userIndex === -1) return false;
    return userIndex >= minIndex;
}

class SidebarComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._currentUser = null;
        this._currentProfile = null;
        this._currentUserRole = 'public';
        this._events = [];
        this._todayItems = [];
        this._overdueItems = [];
        this._isOpen = false;
    }

    static get observedAttributes() {
        return ['current-app'];
    }

    connectedCallback() {
        this.render();
        this._attachEvents();
        this._updateAuthUI();   // مهم: بلافاصله منو و دکمه‌ها را رندر کن
        this._restoreSession();
    }

    /* ---------- PUBLIC API ---------- */
    setUser(user, profile) {
        this._currentUser = user;
        this._currentProfile = profile;
        this._currentUserRole = profile?.role || 'recruit';
        this._updateAuthUI();
        this._renderMenu();
        this._renderDashboardLink();
    }

    clearUser() {
        this._currentUser = null;
        this._currentProfile = null;
        this._currentUserRole = 'public';
        this._updateAuthUI();
        this._renderMenu();
        this._renderDashboardLink();
    }

    setEvents(events) {
        this._events = events || [];
        this._renderTodayList();
    }

    getCurrentUser() {
        return this._currentUser;
    }

    getCurrentProfile() {
        return this._currentProfile;
    }

    setNotificationDot(show) {
        const dot = this.shadowRoot.getElementById('avatar-notif-dot');
        if (dot) {
            dot.style.display = show ? 'block' : 'none';
        }
    }

    setTodayList(todayItems, overdueItems) {
    this._todayItems = todayItems || [];
    this._overdueItems = overdueItems || [];
    this._renderTodayList();
}

    /* ---------- RENDER ---------- */
    render() {
        const currentApp = this.getAttribute('current-app') || '';
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://arminsilatani.github.io/tools/assets/sidebar.css');
            </style>
            <button id="menu-toggle-btn" class="hamburger-btn" aria-label="Menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
            <div id="sidebar-overlay" class="sidebar-overlay"></div>
            <aside id="sidebar" class="sidebar">
                <div id="sidebar-close-row" class="sidebar-close-row">
                    <span>Close</span>
                </div>
                <div class="sidebar-separator"></div>
                <nav class="sidebar-nav" id="sidebar-nav">
                    <slot name="app-content"></slot>
                    <div id="sidebar-today-list" class="sidebar-today-list"></div>
                    <div class="sidebar-separator"></div>
                    <div id="sidebar-menu-items"></div>
                    <div class="sidebar-separator"></div>
                    <a id="sidebar-dashboard" class="sidebar-item hidden" href="https://arminsilatani.github.io/dashboard/" target="_blank">
                        <span class="sidebar-icon" style="position: relative;">
                            <span class="avatar-content"></span>
                            <span class="notification-dot" id="avatar-notif-dot" style="display: none;"></span>
                        </span>
                        <span class="sidebar-dashboard-text">Dashboard</span>
                    </a>
                    <button id="sidebar-login" class="sidebar-item login-item hidden">
                        <span class="sidebar-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                        </span>
                        <span>Sign In</span>
                    </button>
                    <button id="sidebar-logout" class="sidebar-item logout-item hidden">
                        <span class="sidebar-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </span>
                        <span>Logout</span>
                    </button>
                    <a id="sidebar-coffee" class="sidebar-item" href="#" target="_blank" rel="noopener noreferrer">
                        <span class="sidebar-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                                <line x1="6" y1="1" x2="6" y2="4"/>
                                <line x1="10" y1="1" x2="10" y2="4"/>
                                <line x1="14" y1="1" x2="14" y2="4"/>
                            </svg>
                        </span>
                        <span>Buy Me a Coffee</span>
                    </a>
                </nav>
            </aside>
        `;
    }

    /* ---------- EVENT HANDLING ---------- */
    _attachEvents() {
        const toggleBtn = this.shadowRoot.getElementById('menu-toggle-btn');
        const sidebar = this.shadowRoot.getElementById('sidebar');
        const overlay = this.shadowRoot.getElementById('sidebar-overlay');
        const closeRow = this.shadowRoot.getElementById('sidebar-close-row');

        const open = () => {
            if (this._isOpen) return;
            this._isOpen = true;
            toggleBtn.classList.add('open');
            overlay.classList.add('open');
            sidebar.style.transform = 'translateX(0)';
            sidebar.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        };

        const close = () => {
            if (!this._isOpen) return;
            this._isOpen = false;
            toggleBtn.classList.remove('open');
            overlay.classList.remove('open');
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        };

        toggleBtn.addEventListener('click', () => this._isOpen ? close() : open());
        overlay.addEventListener('click', close);
        closeRow.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._isOpen) close();
        });

        // Auto-close when any .sidebar-item (including slotted ones) is clicked
        this.shadowRoot.getElementById('sidebar-nav').addEventListener('click', (e) => {
            const item = e.target.closest('.sidebar-item');
            if (item) {
                setTimeout(close, 150);
            }
        });

        this.shadowRoot.getElementById('sidebar-login').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('login-request', { bubbles: true, composed: true }));
        });

        this.shadowRoot.getElementById('sidebar-logout').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('logout-request', { bubbles: true, composed: true }));
        });
    }

    /* ---------- AUTH UI ---------- */
    _updateAuthUI() {
        const loginBtn = this.shadowRoot.getElementById('sidebar-login');
        const logoutBtn = this.shadowRoot.getElementById('sidebar-logout');
        if (!loginBtn || !logoutBtn) return;

        if (this._currentUser) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
        this._renderMenu();
        this._renderDashboardLink();
        this._renderTodayList();
    }

    /* ---------- MENU RENDERING ---------- */
    _renderMenu() {
        const container = this.shadowRoot.getElementById('sidebar-menu-items');
        if (!container) return;
        container.innerHTML = '';

        const role = normalizeRole(this._currentUserRole);

        MENU_TOOLS.forEach(tool => {
            if (tool.isSelf) return;
            const allowed = hasAccess(role, tool.minRole);
            const btn = document.createElement('button');
            btn.className = 'sidebar-item' + (allowed ? '' : ' disabled');
            btn.disabled = !allowed;
            btn.innerHTML = `
                <span class="sidebar-icon">
                    <img src="${tool.iconURL}" width="20" height="20" alt="${tool.label}">
                </span>
                <span>${tool.label}</span>
                ${!tool.link ? '<span class="coming-soon-tooltip">Coming Soon</span>' : ''}
            `;
            btn.addEventListener('click', () => {
                if (!this._currentUser) {
                    this.dispatchEvent(new CustomEvent('login-request', { bubbles: true, composed: true }));
                    return;
                }
                if (!hasAccess(this._currentUserRole, tool.minRole)) {
                    this.dispatchEvent(new CustomEvent('tool-click', {
                        detail: { tool, error: 'Access denied' },
                        bubbles: true,
                        composed: true
                    }));
                    return;
                }
                this.dispatchEvent(new CustomEvent('tool-click', {
                    detail: { tool },
                    bubbles: true,
                    composed: true
                }));
                if (tool.link) window.open(tool.link, '_blank');
            });
            container.appendChild(btn);
        });
    }

    _renderDashboardLink() {
        const dashboard = this.shadowRoot.getElementById('sidebar-dashboard');
        if (!dashboard) return;
        if (!this._currentProfile) {
            dashboard.classList.add('hidden');
            return;
        }
        dashboard.classList.remove('hidden');
        const fullName = [this._currentProfile.first_name, this._currentProfile.last_name]
            .filter(Boolean).join(' ') || 'Dashboard';
        const textSpan = dashboard.querySelector('.sidebar-dashboard-text');
        if (textSpan) textSpan.textContent = fullName;

        const avatarContent = dashboard.querySelector('.avatar-content');
        if (avatarContent) {
            if (this._currentProfile.photo_url) {
                avatarContent.innerHTML = `<img src="${this._currentProfile.photo_url}" alt="Profile" width="20" height="20" style="border-radius:50%; object-fit:cover;">`;
            } else {
                avatarContent.innerHTML = `<span class="avatar-initial" style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;background:var(--accent, #ff6f91);color:white;border-radius:50%;font-size:12px;font-weight:bold;text-transform:uppercase;">${fullName.charAt(0)}</span>`;
            }
        }
    }

    _renderTodayList() {
    const container = this.shadowRoot.getElementById('sidebar-today-list');
    if (!container) return;

    let html = '';

    if (this._todayItems.length > 0) {
        html += '<div style="padding:8px 16px; font-size:10px; text-transform:uppercase; color:#aaa; letter-spacing:0.5px;">Today</div>';
        this._todayItems.forEach(item => {
            html += `
                <div class="sidebar-today-item" data-event-id="${item.id}" style="cursor:pointer;">
                    <span class="dot" style="background:${item.color}"></span>
                    <span class="title">${item.title}</span>
                </div>`;
        });
    }

    if (this._overdueItems.length > 0) {
        html += '<div style="padding:8px 16px; font-size:10px; text-transform:uppercase; color:#ff6b6b; letter-spacing:0.5px;">Overdue</div>';
        html += '<div class="sidebar-overdue-box">';
        this._overdueItems.forEach(item => {
            html += `
                <div class="sidebar-today-item overdue-item" data-event-id="${item.id}" data-date="${item.date}" style="cursor:pointer;">
                    <span class="dot" style="background:${item.color}"></span>
                    <span class="title">${item.title}</span>
                </div>`;
        });
        html += '</div>';
    }

    if (html === '') {
        html = '<div style="padding:8px 16px;font-size:12px;color:#555;">No events today</div>';
    }

    container.innerHTML = html;
}

    /* ---------- SESSION ---------- */
    async _restoreSession() {
        this.dispatchEvent(new CustomEvent('session-restore-request', { bubbles: true, composed: true }));
    }
}

customElements.define('sidebar-component', SidebarComponent);