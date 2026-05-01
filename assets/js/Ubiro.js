/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-05-01
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== BREWING COST CALCULATOR ============================ */

(function() {
    /* ------------------------- INGREDIENT CONSTANTS ------------------------- */
    const ingredients = [
        { id: 'beerBase', name: 'Malt Base', emoji: '🍺', baseAmount: 12, baseUnit: 'L', purchaseUnit: 'Liter', purchaseUnitShort: 'L', conversionFactor: 1, hint: 'Volume of malt base purchased' },
        { id: 'sugar', name: 'Sugar', emoji: '🍬', baseAmount: 1200, baseUnit: 'g', purchaseUnit: 'Kilogram', purchaseUnitShort: 'kg', conversionFactor: 1000, hint: 'Usually a 1 or 2 kg bag' },
        { id: 'honey', name: 'Honey', emoji: '🍯', baseAmount: 200, baseUnit: 'g', purchaseUnit: 'Gram', purchaseUnitShort: 'g', conversionFactor: 1, hint: 'Standard glass jar' },
        { id: 'coffee', name: 'Coffee', emoji: '☕', baseAmount: 6, baseUnit: 'g', purchaseUnit: 'Kilogram', purchaseUnitShort: 'kg', conversionFactor: 1000, hint: 'Ground coffee — price per kg' },
        { id: 'cocoa', name: 'Cocoa', emoji: '🍫', baseAmount: 12, baseUnit: 'g', purchaseUnit: 'Gram', purchaseUnitShort: 'g', conversionFactor: 1, hint: 'Cocoa powder' },
        { id: 'yeast', name: 'Yeast', emoji: '🧫', baseAmount: 10, baseUnit: 'g', purchaseUnit: 'Gram', purchaseUnitShort: 'g', conversionFactor: 1, hint: 'Sachet or packet of yeast' },
        { id: 'labels', name: 'Labels', emoji: '🏷️', baseAmount: 12, baseUnit: 'pcs', purchaseUnit: 'Piece', purchaseUnitShort: 'pcs', conversionFactor: 1, hint: 'Pack of labels' },
        { id: 'vinegar', name: 'White Vinegar', emoji: '🍶', baseAmount: 1.5, baseUnit: 'L', purchaseUnit: 'Liter', purchaseUnitShort: 'L', conversionFactor: 1, hint: 'Bottle of vinegar' }
    ];

    /* ------------------------- DOM REFERENCES ------------------------- */
    const volumeInput       = document.getElementById('volumeInput');
    const presetBtns        = document.querySelectorAll('.preset-btn');
    const ingredientsGrid   = document.getElementById('ingredientsGrid');
    const resultsSection    = document.getElementById('resultsSection');
    const costPerLiterEl    = document.getElementById('costPerLiter');
    const totalCostInfoEl   = document.getElementById('totalCostInfo');
    const breakdownToggle   = document.getElementById('breakdownToggle');
    const breakdownList     = document.getElementById('breakdownList');
    const resetBtn          = document.getElementById('resetBtn');

    /* ------------------------- GLOBAL STATE ------------------------- */
    let currentVolume   = 12;
    let ingredientData  = {};

    /* ------------------------- UTILITY: FORMAT AMOUNT ------------------------- */
    function formatAmount(amount, unit) {
        if (unit === 'pcs') return Math.round(amount) + ' ' + unit;
        let formatted;
        if (amount < 1) formatted = amount.toFixed(2);
        else if (amount < 10) formatted = amount.toFixed(1);
        else formatted = (Math.round(amount * 10) / 10).toString();
        return formatted.replace(/\.?0+$/, '') + ' ' + unit;
    }

    /* ------------------------- VOLUME MANAGEMENT ------------------------- */
    function setVolume(vol) {
        if (isNaN(vol) || vol < 1) vol = 12;
        if (vol > 500) vol = 500;
        currentVolume = vol;
        volumeInput.value = vol;
        updatePresetActive();
        renderIngredientCards();
        updateAllCosts();
    }

    function updatePresetActive() {
        presetBtns.forEach(btn => {
            const vol = parseInt(btn.getAttribute('data-volume'));
            btn.classList.toggle('active', vol === currentVolume);
        });
    }

    /* ------------------------- STATE RESET ------------------------- */
    function resetToDefaults() {
        ingredientData = {};
        currentVolume = 12;
        volumeInput.value = 12;
        updatePresetActive();
        renderIngredientCards();
        updateAllCosts();
        breakdownList.classList.remove('open');
        breakdownToggle.classList.remove('open');
        resultsSection.classList.remove('has-results');
        costPerLiterEl.classList.remove('pulse-gold');
    }

    /* ------------------------- RENDERING INGREDIENT CARDS ------------------------- */
    function renderIngredientCards() {
        ingredientsGrid.innerHTML = '';
        ingredients.forEach(ing => {
            const neededAmount = (ing.baseAmount * currentVolume) / 12;
            const neededDisplay = formatAmount(neededAmount, ing.baseUnit);

            const card = document.createElement('div');
            card.className = 'ingredient-card';
            card.setAttribute('data-ingredient-id', ing.id);
            card.innerHTML = `
                <div class="ingredient-header">
                    <span class="ingredient-emoji">${ing.emoji}</span>
                    <span class="ingredient-name">${ing.name}</span>
                    <span class="ingredient-needed">Need: ${neededDisplay}</span>
                </div>
                <div class="ingredient-inputs">
                    <div class="input-row">
                        <label>Purchase qty:</label>
                        <input type="number" class="purchase-qty" placeholder="${ing.purchaseUnit === 'Kilogram' ? '1' : ing.purchaseUnit === 'Gram' ? '500' : '2'}" step="any" min="0.001">
                        <span class="unit-label">${ing.purchaseUnitShort}</span>
                    </div>
                    <div class="input-row">
                        <label>Price:</label>
                        <input type="number" class="purchase-price" placeholder="Toman" step="any" min="0">
                        <span class="unit-label">Toman</span>
                    </div>
                </div>
                <div class="ingredient-cost-preview" data-cost-preview="${ing.id}"></div>
                <div style="font-size:0.65rem;color:var(--text-dim);margin-top:2px;opacity:0.6;">${ing.hint}</div>
            `;
            ingredientsGrid.appendChild(card);

            const qtyInput   = card.querySelector('.purchase-qty');
            const priceInput = card.querySelector('.purchase-price');

            const updateHandler = () => {
                updateIngredientData(ing.id, qtyInput, priceInput);
                updateSingleCostPreview(ing);
                updateAllCosts();
                updateCardFilledState(card, ing.id);
            };

            qtyInput.addEventListener('input', updateHandler);
            priceInput.addEventListener('input', updateHandler);

            // pre‑fill if data already exists
            if (ingredientData[ing.id]) {
                qtyInput.value   = ingredientData[ing.id].purchaseQty || '';
                priceInput.value = ingredientData[ing.id].purchasePrice || '';
                updateSingleCostPreview(ing);
                updateCardFilledState(card, ing.id);
            }
        });
    }

    function updateCardFilledState(card, ingId) {
        const data = ingredientData[ingId];
        card.classList.toggle('filled', data && data.purchaseQty > 0 && data.purchasePrice > 0);
    }

    /* ------------------------- COST CALCULATION LOGIC ------------------------- */
    function updateIngredientData(ingId, qtyInput, priceInput) {
        const qty   = parseFloat(qtyInput.value);
        const price = parseFloat(priceInput.value);
        if (!ingredientData[ingId]) ingredientData[ingId] = {};
        ingredientData[ingId].purchaseQty   = isNaN(qty) ? 0 : qty;
        ingredientData[ingId].purchasePrice = isNaN(price) ? 0 : price;
    }

    function updateSingleCostPreview(ing) {
        const previewEl = document.querySelector(`[data-cost-preview="${ing.id}"]`);
        if (!previewEl) return;
        const data = ingredientData[ing.id];
        if (!data || !data.purchaseQty || !data.purchasePrice || data.purchaseQty <= 0) {
            previewEl.textContent = '';
            previewEl.classList.remove('visible');
            return;
        }
        const neededAmount       = (ing.baseAmount * currentVolume) / 12;
        const neededInPurchase   = neededAmount / ing.conversionFactor;
        const cost               = (neededInPurchase / data.purchaseQty) * data.purchasePrice;
        if (isNaN(cost) || cost < 0) {
            previewEl.textContent = '';
            previewEl.classList.remove('visible');
            return;
        }
        previewEl.textContent = `💡 This item: ${Math.round(cost).toLocaleString('en-US')} Toman`;
        previewEl.classList.add('visible');
    }

    function updateAllCosts() {
        let totalCost = 0;
        const breakdownItems = [];

        ingredients.forEach(ing => {
            const data              = ingredientData[ing.id];
            const neededAmount      = (ing.baseAmount * currentVolume) / 12;
            const neededInPurchase  = neededAmount / ing.conversionFactor;
            let cost = 0, hasData = false;

            if (data && data.purchaseQty > 0 && data.purchasePrice > 0) {
                cost = (neededInPurchase / data.purchaseQty) * data.purchasePrice;
                if (!isNaN(cost) && cost >= 0) {
                    hasData = true;
                    totalCost += cost;
                }
            }

            breakdownItems.push({
                name: ing.name,
                emoji: ing.emoji,
                neededDisplay: formatAmount(neededAmount, ing.baseUnit),
                cost,
                hasData
            });
        });

        const costPerLiter = currentVolume > 0 ? totalCost / currentVolume : 0;

        if (totalCost > 0 && currentVolume > 0) {
            costPerLiterEl.textContent = Math.round(costPerLiter).toLocaleString('en-US');
            totalCostInfoEl.textContent = `💵 Total cost: ${Math.round(totalCost).toLocaleString('en-US')} Toman for ${currentVolume} liters`;
            resultsSection.classList.add('has-results');
            costPerLiterEl.classList.add('pulse-gold');
        } else {
            costPerLiterEl.textContent = '—';
            totalCostInfoEl.textContent = 'Enter purchase info to calculate cost ✨';
            resultsSection.classList.remove('has-results');
            costPerLiterEl.classList.remove('pulse-gold');
        }

        updateBreakdownList(breakdownItems, totalCost);
    }

    function updateBreakdownList(items, totalCost) {
        breakdownList.innerHTML = '';
        if (totalCost <= 0) {
            breakdownList.innerHTML = '<p style="text-align:center;color:var(--text-dim);font-size:0.75rem;">No data entered yet</p>';
            return;
        }

        items.forEach(item => {
            if (!item.hasData) return;
            const percent = totalCost > 0 ? ((item.cost / totalCost) * 100) : 0;
            const div = document.createElement('div');
            div.className = 'breakdown-item';
            div.innerHTML = `<span class="bd-name">${item.emoji} ${item.name} (${item.neededDisplay})</span><span class="bd-cost">${Math.round(item.cost).toLocaleString('en-US')} Toman</span><span class="bd-percent">${percent.toFixed(1)}%</span>`;
            breakdownList.appendChild(div);
        });

        const totalDiv = document.createElement('div');
        totalDiv.className = 'breakdown-item';
        totalDiv.style.borderTop = '1px solid var(--border)';
        totalDiv.style.paddingTop = '10px';
        totalDiv.style.fontWeight = '900';
        totalDiv.innerHTML = `<span class="bd-name" style="color:var(--gold);">📦 Grand Total</span><span class="bd-cost" style="color:var(--gold);">${Math.round(totalCost).toLocaleString('en-US')} Toman</span><span class="bd-percent">100%</span>`;
        breakdownList.appendChild(totalDiv);
    }

    /* ------------------------- EVENT HANDLERS ------------------------- */
    volumeInput.addEventListener('input', () => {
        const val = parseInt(volumeInput.value);
        setVolume(val);
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const vol = parseInt(btn.getAttribute('data-volume'));
            if (!isNaN(vol) && vol > 0) setVolume(vol);
        });
    });

    breakdownToggle.addEventListener('click', () => {
        breakdownList.classList.toggle('open');
        breakdownToggle.classList.toggle('open');
    });

    resetBtn.addEventListener('click', resetToDefaults);

    /* ------------------------- INITIALIZATION ------------------------- */
    function init() {
        currentVolume = parseInt(volumeInput.value) || 12;
        volumeInput.value = currentVolume;
        updatePresetActive();
        renderIngredientCards();
        updateAllCosts();
    }

    init();
})();