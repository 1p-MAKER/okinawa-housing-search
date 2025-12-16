document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let currentState = {
        mode: null, // 'rent' or 'buy'
        type: null, // 'rent_residence', 'buy_land', etc.
        area: 'naha',
        priceMin: '0',
        priceMax: '0',
        madori: []
    };

    // --- DOM Elements ---
    const viewHome = document.getElementById('view-home');
    const viewSearch = document.getElementById('view-search');
    const headerControls = document.getElementById('header-controls');
    const backButton = document.getElementById('back-button');
    const typeButtons = document.querySelectorAll('.type-btn');

    // Form Elements
    const searchTitle = document.getElementById('search-title');
    const priceLabel = document.getElementById('price-label');
    const priceMinSelect = document.getElementById('price-min');
    const priceMaxSelect = document.getElementById('price-max');
    const madoriGroup = document.getElementById('madori-group');
    const searchButton = document.getElementById('search-button');
    const areaSelect = document.getElementById('area-select');

    // Favorites Elements
    const favMenuButton = document.getElementById('fav-menu-button');
    const favDropdown = document.getElementById('fav-dropdown');
    const favList = document.getElementById('fav-list');
    const favNameInput = document.getElementById('fav-name-input');
    const saveFavButton = document.getElementById('save-fav-button');

    // --- Price Options Configuration ---
    const RENT_PRICES = [
        { val: '0', label: '下限なし' },
        { val: '30000', label: '3万円' },
        { val: '40000', label: '4万円' },
        { val: '50000', label: '5万円' },
        { val: '60000', label: '6万円' },
        { val: '70000', label: '7万円' },
        { val: '80000', label: '8万円' },
        { val: '90000', label: '9万円' },
        { val: '100000', label: '10万円' },
        { val: '120000', label: '12万円' },
        { val: '150000', label: '15万円' },
        { val: '200000', label: '20万円' },
        { val: '99999999', label: '上限なし' } // Internal use
    ];

    const BUY_PRICES = [
        { val: '0', label: '下限なし' },
        { val: '5000000', label: '500万円' },
        { val: '10000000', label: '1000万円' },
        { val: '15000000', label: '1500万円' },
        { val: '20000000', label: '2000万円' },
        { val: '25000000', label: '2500万円' },
        { val: '30000000', label: '3000万円' },
        { val: '40000000', label: '4000万円' },
        { val: '50000000', label: '5000万円' },
        { val: '80000000', label: '8000万円' },
        { val: '100000000', label: '1億円' },
        { val: '9999999999', label: '上限なし' }
    ];

    // --- Navigation Logic ---
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            const type = btn.dataset.type;
            const label = btn.querySelector('.label').textContent;

            navigateToSearch(mode, type, label);
        });
    });

    backButton.addEventListener('click', () => {
        viewSearch.classList.remove('active');
        viewHome.classList.add('active');
        headerControls.classList.add('hidden');
    });

    function navigateToSearch(mode, type, label) {
        currentState.mode = mode;
        currentState.type = type;

        // UI Updates
        viewHome.classList.remove('active');
        viewSearch.classList.add('active');
        headerControls.classList.remove('hidden');
        searchTitle.textContent = `条件設定: ${label}`;

        // Configure Form
        setupPriceOptions(mode);

        // Toggle Madori visibility
        // Display madori only for Residence Rent or Mansion/House Buy
        if (type === 'rent_residence' || type === 'buy_mansion' || type === 'buy_house') {
            madoriGroup.style.display = 'block';
        } else {
            madoriGroup.style.display = 'none';
        }
    }

    function setupPriceOptions(mode) {
        const options = mode === 'rent' ? RENT_PRICES : BUY_PRICES;
        const renderOpts = (selectedVal) => options.map(opt => `<option value="${opt.val}" ${opt.val === selectedVal ? 'selected' : ''}>${opt.label}</option>`).join('');

        // Reset or Restore if saved
        priceMinSelect.innerHTML = renderOpts('0');
        priceMaxSelect.innerHTML = renderOpts(mode === 'rent' ? '99999999' : '9999999999');
    }

    // --- Search Execution Logic ---
    const resultContainer = document.getElementById('result-links');
    const linksList = document.getElementById('links-list');

    searchButton.addEventListener('click', executeSearch);

    function executeSearch() {
        // Collect current values
        currentState.area = areaSelect.value;
        currentState.priceMin = priceMinSelect.value;
        currentState.priceMax = priceMaxSelect.value;

        // Madori collection
        const checkedMadori = Array.from(document.querySelectorAll('input[name="madori"]:checked')).map(cb => cb.value);
        currentState.madori = checkedMadori;

        const urls = generateUrls(currentState);

        if (urls.length === 0) {
            alert('URL生成エラー');
            return;
        }

        // Render Links
        linksList.innerHTML = ''; // Clear previous
        urls.forEach((item) => {
            const a = document.createElement('a');
            a.href = item.url;
            a.target = '_blank';
            a.className = 'link-btn';

            // Site Name + Icon (simple text for now)
            a.innerHTML = `<span class="site-name">${item.name}</span> で見る`;

            linksList.appendChild(a);
        });

        // Show Container
        resultContainer.classList.remove('hidden');

        // Scroll to results
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // --- URL Generator Functions ---
    // Note: Parameter mapping is estimated based on general knowledge to avoid scraping.
    // Real-world implementation requires precise parameter dictionaries.
    function generateUrls(state) {
        const urls = [];

        // 1. GooHome (沖縄)
        urls.push({ name: 'Goohome', url: getGoohomeUrl(state) });

        // 2. Uchina Life (沖縄)
        urls.push({ name: 'Uchina', url: getUchinaUrl(state) });

        // 3. SUUMO (全国)
        urls.push({ name: 'SUUMO', url: getSuumoUrl(state) });

        // 4. AtHome (全国)
        urls.push({ name: 'AtHome', url: getAthomeUrl(state) });

        // 5. LIFULL HOME'S (全国)
        urls.push({ name: 'Homes', url: getHomesUrl(state) });

        return urls;
    }

    // --- Site Specific Logic ---

    /* City Code Mapping */
    // SUUMO: Naha=47201
    // Goohome: Naha=naha
    const CITY_CODES = {
        naha: { name: '那覇市', goo: 'naha', uchina: 'nahashi', suumo_sc: '47201', athome: 'naha-city' },
        urasoe: { name: '浦添市', goo: 'urasoe', uchina: 'urasoeshi', suumo_sc: '47208', athome: 'urasoe-city' },
        ginowan: { name: '宜野湾市', goo: 'ginowan', uchina: 'ginowanshi', suumo_sc: '47205', athome: 'ginowan-city' },
        okinawa: { name: '沖縄市', goo: 'okinawa', uchina: 'okinawashi', suumo_sc: '47211', athome: 'okinawa-city' },
        tomigusuku: { name: '豊見城市', goo: 'tomigusuku', uchina: 'tomigusukushi', suumo_sc: '47212', athome: 'tomigusuku-city' },
        itoman: { name: '糸満市', goo: 'itoman', uchina: 'itomanshi', suumo_sc: '47210', athome: 'itoman-city' },
        nanjo: { name: '南城市', goo: 'nanjo', uchina: 'nanjoshi', suumo_sc: '47215', athome: 'nanjo-city' },
        uruma: { name: 'うるま市', goo: 'uruma', uchina: 'urumashi', suumo_sc: '47213', athome: 'uruma-city' },
    };

    function getCityData(cityKey) {
        return CITY_CODES[cityKey] || CITY_CODES['naha'];
    }

    function getGoohomeUrl(state) {
        // GooHome Verified: https://goohome.jp/chintai/mansion/naha/?price=-60000&madori=104
        // Price format: price=-{MAX}
        // Madori: 104=1LDK (Only 1LDK confirmed, others omitted for safety)

        const city = getCityData(state.area).goo;
        let url = `https://goohome.jp/${state.mode === 'rent' ? 'chintai/mansion' : 'bai-bai/mansion'}/${city}/`;

        const params = [];
        if (state.mode === 'rent' && state.priceMax !== '0' && !state.priceMax.startsWith('9')) {
            params.push(`price=-${state.priceMax}`);
        }

        // Madori mapping based on investigation
        // Note: Our app combines 1LDK/2K, GooHome separates. 
        // We map '1ldk_2k' -> 104 (1LDK) as primary target for this demo.
        if (state.madori.includes('1ldk_2k')) {
            params.push('madori=104');
        }

        if (params.length > 0) url += `?${params.join('&')}`;
        return url;
    }

    function getUchinaUrl(state) {
        // Uchina is verified working with params
        const city = getCityData(state.area).uchina;
        let url = `https://www.e-uchina.net/jukyo/${city}`;
        const params = [];

        if (state.mode === 'rent') {
            if (state.priceMax !== '0' && !state.priceMax.startsWith('9')) {
                params.push(`priceHigh=${parseInt(state.priceMax) / 10000}`);
            }
            if (state.madori.includes('1ldk_2k')) {
                params.push('madori=1LDK');
            }
        }
        if (params.length > 0) url += `?${params.join('&')}`;
        return url;
    }

    function getSuumoUrl(state) {
        // SUUMO: Verified with full base params.
        // https://suumo.jp/jj/chintai/ichiran/FR301FC001/?ar=090&bs=040&ta=47&sc=47201&ct=6.0

        if (state.mode !== 'rent') {
            return `https://suumo.jp/jj/buy/ichiran/FR301FC001/?ar=090&bs=021&ta=47&sc=${getCityData(state.area).suumo_sc}`;
        }

        const citySc = getCityData(state.area).suumo_sc;
        const prices = {
            '0': '9999999',
            '30000': '3.0',
            '40000': '4.0',
            '50000': '5.0',
            '60000': '6.0',
            '70000': '7.0',
            '80000': '8.0',
            '90000': '9.0',
            '100000': '10.0',
            '120000': '12.0',
            '150000': '15.0',
            '200000': '20.0',
            '99999999': '9999999'
        };

        const rentParam = prices[state.priceMax] || '9999999';

        // Full base params: ar=090 (Okinawa Area), bs=040 (Chintai), ta=47 (Pref), sc=City, ct=Rent
        let url = `https://suumo.jp/jj/chintai/ichiran/FR301FC001/?ar=090&bs=040&ta=47&sc=${citySc}&ct=${rentParam}`;

        return url;
    }

    function getAthomeUrl(state) {
        // AtHome: Defaults to city list for safety.
        const city = getCityData(state.area).athome;
        return `https://www.athome.co.jp/${state.mode === 'rent' ? 'chintai' : 'kodate'}/okinawa/${city}/list/`;
    }

    function getHomesUrl(state) {
        // Homes: Defaults to city list for safety.
        // Verified `cond[money_room_h]` injection causes 404 in some contexts.
        const city = getCityData(state.area).athome; // Borrow slug
        return `https://www.homes.co.jp/${state.mode === 'rent' ? 'chintai' : 'kodate'}/okinawa/${city}/list/`;
    }

    // --- LocalStorage Favorites ---
    const STORAGE_KEY = 'okinawa_housing_favs';
    const savedConditionsArea = document.getElementById('saved-conditions-area');
    const savedTagsContainer = document.getElementById('saved-tags');
    const saveCurrentBtn = document.getElementById('save-current-btn');

    // Load saved data on init
    renderSavedTags();

    // Save Button Handler
    if (saveCurrentBtn) {
        saveCurrentBtn.addEventListener('click', () => {
            // Force update state from DOM first!
            currentState.area = areaSelect.value;
            currentState.priceMin = priceMinSelect.value;
            currentState.priceMax = priceMaxSelect.value;
            currentState.madori = Array.from(document.querySelectorAll('input[name="madori"]:checked')).map(cb => cb.value);

            const name = prompt('この検索条件に名前を付けて保存：', stateToDefaultName());
            if (name === null) return; // Cancelled
            if (name.trim() === '') return; // Empty

            const favs = getFavs();
            const currentData = {
                name: name,
                mode: currentState.mode,
                type: currentState.type,
                area: currentState.area,
                priceMin: currentState.priceMin,
                priceMax: currentState.priceMax,
                madori: currentState.madori
            };

            favs.push(currentData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));

            renderSavedTags();
            alert(`「${name}」を保存しました\n次回から上部のボタンで呼び出せます`);
        });
    }

    function stateToDefaultName() {
        const areaName = areaSelect.options[areaSelect.selectedIndex].text;
        return `${areaName}の条件`;
    }

    function getFavs() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    function renderSavedTags() {
        const favs = getFavs();

        if (favs.length === 0) {
            savedConditionsArea.classList.add('hidden');
            return;
        }

        savedConditionsArea.classList.remove('hidden');
        savedTagsContainer.innerHTML = '';

        favs.forEach((fav, index) => {
            const tag = document.createElement('button');
            tag.className = 'saved-tag';
            tag.innerHTML = `<span class="tag-name">${fav.name}</span><span class="delete-tag" data-index="${index}">×</span>`;

            // Load fav on click (ignore delete btn click)
            tag.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-tag')) {
                    deleteFav(index);
                } else {
                    loadFav(fav);
                }
            });

            savedTagsContainer.appendChild(tag);
        });
    }

    function deleteFav(index) {
        if (!confirm('削除しますか？')) return;
        const favs = getFavs();
        favs.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        renderSavedTags();
    }

    function loadFav(fav) {
        // 1. Restore Mode/Type Context first
        const savedMode = fav.mode;
        const savedType = fav.type;
        const savedName = fav.name || '保存された条件';

        if (savedMode && savedType) {
            // This function sets up the form options (setupPriceOptions) and visible fields
            navigateToSearch(savedMode, savedType, savedName);
        }

        // 2. Apply values (Now that options are built for the correct mode)
        if (fav.area) areaSelect.value = fav.area;

        // Timeout optional but safe for rendering, sticking to sync for now.
        if (fav.priceMin) priceMinSelect.value = fav.priceMin;
        if (fav.priceMax) priceMaxSelect.value = fav.priceMax;

        // 3. Apply checkboxes
        // First uncheck all to start fresh
        document.querySelectorAll('input[name="madori"]').forEach(cb => cb.checked = false);

        if (fav.madori && Array.isArray(fav.madori)) {
            document.querySelectorAll('input[name="madori"]').forEach(cb => {
                if (fav.madori.includes(cb.value)) cb.checked = true;
            });
        }

        // 4. Update Global CurrentState to match visual state
        currentState.mode = savedMode;
        currentState.type = savedType;
        currentState.area = areaSelect.value;
        currentState.priceMin = priceMinSelect.value;
        currentState.priceMax = priceMaxSelect.value;
        currentState.madori = fav.madori || [];

        // Scroll to search button
        searchButton.scrollIntoView({ behavior: 'smooth' });

        // Highlight effect
        document.querySelector('.form-container').animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.02)' },
            { transform: 'scale(1)' }
        ], { duration: 300 });
    }
});
