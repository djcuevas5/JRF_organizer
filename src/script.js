(function() {
    'use strict';

    // ---------- EMPTY – no sample data (confidential) ----------
    let orders = [];
    let nextId = 1;

    // ---------- PERSISTENCE ----------
    function loadOrders() {
        const saved = localStorage.getItem('printHoldOrders');
        if (saved) {
            try {
                orders = JSON.parse(saved);
                nextId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    function saveOrders() {
        localStorage.setItem('printHoldOrders', JSON.stringify(orders));
    }

    // DOM refs
    const container = document.getElementById('cardContainer');
    const addBtn = document.getElementById('addOrderBtn');
    const floatingAddBtn = document.getElementById('floatingAddBtn');

    // ---------- helpers ----------
    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    function getCardStatus(order) {
        const missing = (order.missingText || '').trim();
        const inProcess = (order.inProcessText || '').trim();
        if (missing === '' && inProcess === '') {
            return 'green';
        } else {
            return 'yellow';
        }
    }

    // ---------- render ----------
    function renderAll() {
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    📭 No orders in the hold queue.<br />
                    Click <strong>"Add Order"</strong> to get started.
                </div>
            `;
            return;
        }

        let html = '';
        orders.forEach((order, index) => {
            const status = getCardStatus(order);
            const isCompleteEnabled = status === 'green';

            html += `
                <div class="card ${status}" data-index="${index}">
                    <!-- CARD HEADER -->
                    <div class="card-header">
                        <input type="text" class="product-line-name" value="${escapeHtml(order.productLineName || '')}" placeholder="Enter product line name" />
                        <div class="emails">
                            <span>📧 PS: <input type="email" class="specialist-email" value="${escapeHtml(order.specialistEmail || '')}" placeholder="specialist@email.com" /></span>
                            <span>📧 DE: <input type="email" class="designer-email" value="${escapeHtml(order.designerEmail || '')}" placeholder="designer@email.com" /></span>
                        </div>
                    </div>

                    <!-- CARD BODY -->
                    <div class="card-body">
                        <!-- ROW 1: Job ID, Cat #, Type, Product Line -->
                        <div class="row">
                            <div class="field-group">
                                <label>Job ID <span class="required">*</span></label>
                                <input type="text" class="job-id" value="${escapeHtml(order.jobId || '')}" placeholder="e.g. JOB-1234" required />
                            </div>
                            <div class="field-group">
                                <label>Cat # <span class="required">*</span></label>
                                <input type="text" class="cat-num" value="${escapeHtml(order.catNum || '')}" placeholder="e.g. CAT-1001" required />
                            </div>
                            <div class="field-group">
                                <label>Type <span class="required">*</span></label>
                                <select class="type-dropdown" required>
                                    <option value="Change/Approval" ${order.type === 'Change/Approval' ? 'selected' : ''}>Change/Approval</option>
                                    <option value="Change/Keep_p" ${order.type === 'Change/Keep_p' ? 'selected' : ''}>Change/Keep_p</option>
                                    <option value="Revision" ${order.type === 'Revision' ? 'selected' : ''}>Revision</option>
                                    <option value="Production" ${order.type === 'Production' ? 'selected' : ''}>Production</option>
                                    <option value="Approval" ${order.type === 'Approval' ? 'selected' : ''}>Approval</option>
                                </select>
                            </div>
                            <div class="field-group">
                                <label>Product Line</label>
                                <select class="product-line-dropdown">
                                    <option value="RS Vista" ${order.productLine === 'RS Vista' ? 'selected' : ''}>RS Vista</option>
                                    <option value="Vista Manual" ${order.productLine === 'Vista Manual' ? 'selected' : ''}>Vista Manual</option>
                                    <option value="ST Vista" ${order.productLine === 'ST Vista' ? 'selected' : ''}>ST Vista</option>
                                    <option value="RS PME" ${order.productLine === 'RS PME' ? 'selected' : ''}>RS PME</option>
                                </select>
                            </div>
                        </div>

                        <!-- ROW 2: Designer Comment -->
                        <div class="row">
                            <div class="field-group full-width">
                                <label>Designer Comment</label>
                                <input type="text" class="designer-comment" value="${escapeHtml(order.designerComment || '')}" placeholder="Add designer notes here..." />
                            </div>
                        </div>

                        <!-- ROW 3: LPN # (single field) -->
                        <div class="row">
                            <div class="field-group">
                                <label>LPN #</label>
                                <input type="text" class="lpn-num" value="${escapeHtml(order.lpnNum || '')}" placeholder="e.g. LPN-1234" />
                            </div>
                        </div>

                        <!-- ROW 4: TWO-COLUMN - Checkboxes (left) + Dates (right) -->
                        <div class="row two-col">
                            <!-- LEFT: Checkboxes -->
                            <div class="field-group checkbox-wrap">
                                <div class="checkbox-label">Checklist</div>
                                <div class="checkbox-group-vertical">
                                    <label><input type="checkbox" class="evault" ${order.evault ? 'checked' : ''} /> eVault</label>
                                    <label><input type="checkbox" class="rfa" ${order.rfaMissing ? 'checked' : ''} /> RFA Missing</label>
                                    <label><input type="checkbox" class="interlocks" ${order.keyInterlocks ? 'checked' : ''} /> Key Interlocks</label>
                                    <label><input type="checkbox" class="qa" ${order.qaChecklist ? 'checked' : ''} /> QA Checklist</label>
                                    <label><input type="checkbox" class="artwork" ${order.artworkApproved ? 'checked' : ''} /> Artwork Approved</label>
                                    <label><input type="checkbox" class="drawings" ${order.drawingsChecked ? 'checked' : ''} /> Drawings in eVault / sp_hold</label>
                                </div>
                            </div>

                            <!-- RIGHT: Dates (Checked Date + Committed Date) -->
                            <div class="field-group date-wrap">
                                <label>Checked Date</label>
                                <input type="date" class="checked-date" value="${escapeHtml(order.checkedDate || '')}" />
                                
                                <label style="margin-top: 0.8rem;">Committed Date</label>
                                <input type="date" class="committed-date" value="${escapeHtml(order.committedDate || '')}" />
                            </div>
                        </div>

                        <!-- ROW 5: Status Row (Missing Text, In Process, Complete) -->
                        <div class="row status-row">
                            <div class="field-group">
                                <label>Missing Text</label>
                                <input type="text" class="missing-text" value="${escapeHtml(order.missingText || '')}" placeholder="e.g. missing artwork" />
                            </div>
                            <div class="field-group">
                                <label>In Process</label>
                                <input type="text" class="in-process-text" value="${escapeHtml(order.inProcessText || '')}" placeholder="e.g. waiting for approval" />
                            </div>
                            <div class="field-group complete-group">
                                <button class="complete-btn" ${isCompleteEnabled ? '' : 'disabled'}>✅ Complete</button>
                            </div>
                        </div>

                        <!-- CARD ACTIONS (Delete) -->
                        <div class="card-actions">
                            <button class="delete-card-btn" data-id="${order.id}" title="Remove order">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Attach events to each card
        container.querySelectorAll('.card').forEach(card => {
            const index = parseInt(card.dataset.index);
            attachCardEvents(card, index);
        });
    }

    // ---------- attach events to a single card ----------
    function attachCardEvents(card, index) {
        // Get all inputs and selects
        const inputs = card.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                updateOrderData(index);
                updateCardStatus(index);
                saveOrders();
            });
            input.addEventListener('change', function() {
                updateOrderData(index);
                updateCardStatus(index);
                saveOrders();
            });
        });

        // Delete button
        const deleteBtn = card.querySelector('.delete-card-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                deleteOrder(id);
            });
        }

        // Complete button
        const completeBtn = card.querySelector('.complete-btn');
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                if (!this.disabled) {
                    const order = orders[index];
                    const name = order.productLineName || 'Untitled';
                    const job = order.jobId || 'No Job ID';
                    if (confirm(`Complete order "${name}" (${job})?`)) {
                        deleteOrder(order.id);
                    }
                }
            });
        }
    }

    // ---------- update order data ----------
    function updateOrderData(index) {
        const card = container.querySelector(`.card[data-index="${index}"]`);
        if (!card) return;

        const order = orders[index];
        if (!order) return;

        order.productLineName = card.querySelector('.product-line-name')?.value || '';
        order.specialistEmail = card.querySelector('.specialist-email')?.value || '';
        order.designerEmail = card.querySelector('.designer-email')?.value || '';
        order.jobId = card.querySelector('.job-id')?.value || '';
        order.catNum = card.querySelector('.cat-num')?.value || '';
        order.type = card.querySelector('.type-dropdown')?.value || '';
        order.productLine = card.querySelector('.product-line-dropdown')?.value || '';
        order.designerComment = card.querySelector('.designer-comment')?.value || '';
        order.lpnNum = card.querySelector('.lpn-num')?.value || '';
        order.evault = card.querySelector('.evault')?.checked || false;
        order.rfaMissing = card.querySelector('.rfa')?.checked || false;
        order.keyInterlocks = card.querySelector('.interlocks')?.checked || false;
        order.qaChecklist = card.querySelector('.qa')?.checked || false;
        order.artworkApproved = card.querySelector('.artwork')?.checked || false;
        order.drawingsChecked = card.querySelector('.drawings')?.checked || false;
        order.missingText = card.querySelector('.missing-text')?.value || '';
        order.inProcessText = card.querySelector('.in-process-text')?.value || '';
        order.checkedDate = card.querySelector('.checked-date')?.value || '';
        order.committedDate = card.querySelector('.committed-date')?.value || '';
    }

    // ---------- update card status ----------
    function updateCardStatus(index) {
        const card = container.querySelector(`.card[data-index="${index}"]`);
        if (!card) return;

        const order = orders[index];
        if (!order) return;

        const status = getCardStatus(order);
        const isCompleteEnabled = status === 'green';

        card.classList.remove('green', 'yellow');
        card.classList.add(status);

        const completeBtn = card.querySelector('.complete-btn');
        if (completeBtn) {
            completeBtn.disabled = !isCompleteEnabled;
        }
    }

    // ---------- CRUD ----------
    function addOrder() {
        const newOrder = {
            id: nextId++,
            productLineName: '',
            specialistEmail: '',
            designerEmail: '',
            jobId: '',
            catNum: '',
            type: 'Change/Approval',
            productLine: 'RS Vista',
            designerComment: '',
            lpnNum: '',
            evault: false,
            rfaMissing: false,
            keyInterlocks: false,
            qaChecklist: false,
            artworkApproved: false,
            drawingsChecked: false,
            missingText: '',
            inProcessText: '',
            checkedDate: '',
            committedDate: ''
        };
        orders.push(newOrder);
        saveOrders();
        renderAll();
        setTimeout(() => {
            const cards = container.querySelectorAll('.card');
            if (cards.length > 0) {
                cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                const firstInput = cards[cards.length - 1].querySelector('.job-id');
                if (firstInput) setTimeout(() => firstInput.focus(), 300);
            }
        }, 100);
    }

    function deleteOrder(id) {
        if (!confirm('Remove this order from the hold queue?')) return;
        orders = orders.filter(o => o.id !== id);
        saveOrders();
        renderAll();
    }

    // ---------- event listeners ----------
    addBtn.addEventListener('click', addOrder);
    floatingAddBtn.addEventListener('click', addOrder);

    // ---------- INIT ----------
    if (!loadOrders()) {
        orders = [];
    }
    renderAll();

})();