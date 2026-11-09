import { app } from "../../scripts/app.js";

const THEMES = [
    "cyberpunk", "steampunk", "minimal", "glass", "retro",
    "futuristic", "gaming", "dark", "nature", "cartoon",
    "vaporwave", "brutalist", "material", "neumorphism", "skeuomorphic"
];

const SHAPES = ["knob", "vertical_slider", "horizontal_slider"];

const THEME_DEFAULTS = {
    cyberpunk: { color: "#ff00ff", title: "Cyberpunk" },
    steampunk: { color: "#b57c48", title: "Steampunk" },
    minimal: { color: "#888888", title: "Minimal" },
    glass: { color: "#ffffff", title: "Glass" },
    retro: { color: "#c9a87c", title: "Retro" },
    futuristic: { color: "#00aaff", title: "Futuristic" },
    gaming: { color: "#ff0066", title: "Gaming" },
    dark: { color: "#0ff", title: "Dark" },
    nature: { color: "#6b8e4c", title: "Nature" },
    cartoon: { color: "#ffcc00", title: "Cartoon" },
    vaporwave: { color: "#ff7eb3", title: "Vaporwave" },
    brutalist: { color: "#000000", title: "Brutalist" },
    material: { color: "#6200ee", title: "Material" },
    neumorphism: { color: "#b0b0b0", title: "Neumorphism" },
    skeuomorphic: { color: "#f00", title: "Skeuomorphic" }
};

const MagikKnobIntExtension = {
    name: "CRT.MagikKnobInt.UI",

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name !== "MagikKnobIntNode") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;

        nodeType.prototype.onNodeCreated = function () {
            onNodeCreated?.apply(this, arguments);

            // Initialize properties
            this._initProperties();

            // Create UI structure
            this._createUI();

            // Set up event listeners
            this._setupEventListeners();

            // Load CSS
            this._loadCSS();

            // Apply initial theme/shape
            this._applyTheme(this.themeWidget.value);
            this._applyShape(this.shapeWidget.value);

            // Initial visual sync
            this._syncAllVisuals();

            // Set up resize observer
            this._setupResizeObserver();
        };

        // ----- Helper methods -----
        nodeType.prototype._initProperties = function () {
            this.bgcolor = "transparent";
            this.title = "";

            // Find the widget by its new name "knobValue"
            const knobValueWidget = this.widgets.find(w => w.name === "knobValue"); // <-- changed
            console.log("🔍 knobValueWidget.options:", JSON.stringify(knobValueWidget.options, null, 2));
            console.log("🔍 knobValueWidget.options.step:", knobValueWidget.options.step);
            console.log("🔍 knobValueWidget.options.step2:", knobValueWidget.options.step2);
            console.log("🔍 this.properties before merge:", JSON.stringify(this.properties));
            knobValueWidget.hidden = true;
            this.knobValueWidget = knobValueWidget; // <-- store with new name

            // Hidden widgets for serialization
            this.themeWidget = this.addWidget("hidden", "theme", "cyberpunk", (v) => this._applyTheme(v), { hidden: true });
            this.shapeWidget = this.addWidget("hidden", "shape", "knob", (v) => this._applyShape(v), { hidden: true });

            this.properties = this.properties || {};
            this.properties.title = this.properties.title || "";
            this.properties.color = this.properties.color || "#0fff00";
            // Read from knobValueWidget.options
            this.properties.min = this.properties.min ?? knobValueWidget.options.min ?? 1;
            this.properties.max = this.properties.max ?? knobValueWidget.options.max ?? 250;
            this.properties.stepper = this.properties.stepper ?? 1;
            this.properties.precision = 0;

            this.size = this.size || [350, 400];
        };

        nodeType.prototype._loadCSS = function () {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = new URL("./magik_knob_int_widget.css", import.meta.url).href;
            document.head.appendChild(link);
        };

        nodeType.prototype._createUI = function () {
            // Main wrapper
            const wrapper = document.createElement("div");
            wrapper.className = "magik-knob-int-wrapper";
            wrapper.style.position = 'absolute';
            wrapper.style.top = '0';
            wrapper.style.left = '0';
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'flex-start';
            wrapper.style.pointerEvents = 'none';
            wrapper.tabIndex = 0; // Make focusable for keyboard

            // Header
            const header = document.createElement("div");
            header.className = "magik-knob-int-header";

            const titleDisplay = document.createElement("div");
            titleDisplay.className = "magik-knob-int-title";
            header.appendChild(titleDisplay);

            const settingsBtn = document.createElement("button");
            settingsBtn.className = "magik-knob-int-btn";
            settingsBtn.innerHTML = "⚙";
            header.appendChild(settingsBtn);

            wrapper.appendChild(header);

            // Knob container
            const knobContainer = document.createElement("div");
            knobContainer.className = "knob-container";

            const knobBody = document.createElement("div");
            knobBody.className = "knob-body";
            const knobIndicator = document.createElement("div");
            knobIndicator.className = "knob-indicator";
            const knobCenter = document.createElement("div");
            knobCenter.className = "knob-center-display";
            const knobValue = document.createElement("div");
            knobValue.className = "knob-value";
            knobCenter.appendChild(knobValue);
            knobBody.appendChild(knobIndicator);
            knobBody.appendChild(knobCenter);

            knobContainer.appendChild(knobBody);
            wrapper.appendChild(knobContainer);

            // Vertical slider
            const verticalContainer = document.createElement("div");
            verticalContainer.className = "vertical-slider-container";

            const vTrack = document.createElement("div");
            vTrack.className = "slider-vertical-track";
            const vThumb = document.createElement("div");
            vThumb.className = "slider-vertical-thumb";
            const vValueSpan = document.createElement("span");
            vThumb.appendChild(vValueSpan);
            vTrack.appendChild(vThumb);
            verticalContainer.appendChild(vTrack);
            wrapper.appendChild(verticalContainer);

            // Horizontal slider
            const horizontalContainer = document.createElement("div");
            horizontalContainer.className = "horizontal-slider-container";

            const hTrack = document.createElement("div");
            hTrack.className = "slider-horizontal-track";
            const hThumb = document.createElement("div");
            hThumb.className = "slider-horizontal-thumb";
            const hValueSpan = document.createElement("span");
            hThumb.appendChild(hValueSpan);
            hTrack.appendChild(hThumb);
            horizontalContainer.appendChild(hTrack);
            wrapper.appendChild(horizontalContainer);

            // Step buttons
            const minusBtn = document.createElement("button");
            minusBtn.className = "magik-knob-int-corner-btn";
            const plusBtn = document.createElement("button");
            plusBtn.className = "magik-knob-int-corner-btn";
            wrapper.appendChild(minusBtn);
            wrapper.appendChild(plusBtn);

            // DOM widget
            const domWidget = this.addDOMWidget("magik_knob_int_ui", "div", wrapper, { serialize: false });
            domWidget.element.style.position = 'relative';
            domWidget.wrapper = wrapper;

            // Store references
            this.wrapper = wrapper;
            this.titleDisplay = titleDisplay;
            this.settingsBtn = settingsBtn;
            this.minusBtn = minusBtn;
            this.plusBtn = plusBtn;
            this.knobBody = knobBody;
            this.knobIndicator = knobIndicator;
            this.knobCenter = knobCenter;
            this.knobValue = knobValue;
            this.vTrack = vTrack;
            this.vThumb = vThumb;
            this.vValueSpan = vValueSpan;
            this.hTrack = hTrack;
            this.hThumb = hThumb;
            this.hValueSpan = hValueSpan;

            // Accessibility: make interactive elements focusable
            this.knobBody.tabIndex = 0;
            this.vThumb.tabIndex = 0;
            this.hThumb.tabIndex = 0;

            // ARIA attributes for sliders
            this.knobBody.setAttribute('role', 'slider');
            this.vThumb.setAttribute('role', 'slider');
            this.hThumb.setAttribute('role', 'slider');
            this._updateAriaAttributes(); // set initial values

            // Modal overlay (to be appended to body)
            this.modalOverlay = document.createElement("div");
            this.modalOverlay.className = "magik-knob-int-modal-overlay";
            this.modal = this._buildModal(this.modalOverlay);
            document.body.appendChild(this.modalOverlay);
        };

        // Helper to update ARIA attributes
        nodeType.prototype._updateAriaAttributes = function () {
            const val = this.knobValueWidget.value; // <-- changed
            const min = this.properties.min;
            const max = this.properties.max;

            [this.knobBody, this.vThumb, this.hThumb].forEach(el => {
                if (el) {
                    el.setAttribute('aria-valuemin', min);
                    el.setAttribute('aria-valuemax', max);
                    el.setAttribute('aria-valuenow', val);
                    el.setAttribute('aria-valuetext', val.toString());
                }
            });
        };

        nodeType.prototype._setupEventListeners = function () {
            // Apply value helper – now using this.knobValueWidget
            const applyValue = (newValue) => {
                const props = this.properties;
                let clamped = Math.max(props.min, Math.min(props.max, newValue));
                let stepped = Math.round(clamped / props.stepper) * props.stepper;
                this.knobValueWidget.value = stepped; // <-- changed
                this.knobValueWidget.callback?.(stepped); // <-- changed
                this._updateAllVisuals();
            };

            // Knob drag
            let isDraggingKnob = false;
            let lastY = 0;
            this.knobBody.addEventListener("mousedown", (e) => {
                if (e.button !== 0) return;
                isDraggingKnob = true;
                lastY = e.clientY;
                this.knobBody.classList.add('dragging');
                e.preventDefault();
                e.stopPropagation();
            });

            document.addEventListener("mousemove", (e) => {
                if (!isDraggingKnob) return;
                const delta = lastY - e.clientY;
                lastY = e.clientY;
                const range = this.properties.max - this.properties.min;
                const sensitivity = range / 300;
                applyValue(this.knobValueWidget.value + delta * sensitivity); // <-- changed
                e.preventDefault();
            });

            document.addEventListener("mouseup", (e) => {
                if (!isDraggingKnob) return;
                isDraggingKnob = false;
                this.knobBody.classList.remove('dragging');
                e.preventDefault();
            });

            this.knobBody.addEventListener("wheel", (e) => {
                e.preventDefault();
                e.stopPropagation(); // wheel-over-knob adjusts value only, don't also forward to canvas zoom
                const range = this.properties.max - this.properties.min;
                const delta = -Math.sign(e.deltaY) * (range / 100);
                applyValue(this.knobValueWidget.value + delta); // <-- changed
            });

            this.knobBody.addEventListener("contextmenu", (e) => e.preventDefault());

            // Vertical slider
            let isDraggingV = false;
            this.vThumb.addEventListener("mousedown", (e) => {
                if (e.button !== 0) return;
                isDraggingV = true;
                this.vThumb.classList.add('dragging');
                e.preventDefault();
                e.stopPropagation();
            });

            document.addEventListener("mousemove", (e) => {
                if (!isDraggingV) return;
                const rect = this.vTrack.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const pct = 1 - Math.max(0, Math.min(1, y / rect.height));
                applyValue(this.properties.min + pct * (this.properties.max - this.properties.min));
                e.preventDefault();
            });

            document.addEventListener("mouseup", (e) => {
                if (!isDraggingV) return;
                isDraggingV = false;
                this.vThumb.classList.remove('dragging');
                e.preventDefault();
            });

            this.vTrack.addEventListener("click", (e) => {
                const rect = this.vTrack.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const pct = 1 - Math.max(0, Math.min(1, y / rect.height));
                applyValue(this.properties.min + pct * (this.properties.max - this.properties.min));
            });

            // Horizontal slider
            let isDraggingH = false;
            this.hThumb.addEventListener("mousedown", (e) => {
                if (e.button !== 0) return;
                isDraggingH = true;
                this.hThumb.classList.add('dragging');
                e.preventDefault();
                e.stopPropagation();
            });

            document.addEventListener("mousemove", (e) => {
                if (!isDraggingH) return;
                const rect = this.hTrack.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, x / rect.width));
                applyValue(this.properties.min + pct * (this.properties.max - this.properties.min));
                e.preventDefault();
            });

            document.addEventListener("mouseup", (e) => {
                if (!isDraggingH) return;
                isDraggingH = false;
                this.hThumb.classList.remove('dragging');
                e.preventDefault();
            });

            this.hTrack.addEventListener("click", (e) => {
                const rect = this.hTrack.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, x / rect.width));
                applyValue(this.properties.min + pct * (this.properties.max - this.properties.min));
            });

            // Step buttons
            this.minusBtn.addEventListener("click", (e) => {
                applyValue(this.knobValueWidget.value - this.properties.stepper); // <-- changed
                e.preventDefault();
                e.stopPropagation();
            });

            this.plusBtn.addEventListener("click", (e) => {
                applyValue(this.knobValueWidget.value + this.properties.stepper); // <-- changed
                e.preventDefault();
                e.stopPropagation();
            });

            // Settings button
            this.settingsBtn.addEventListener("click", (e) => {
                this.modal.show();
                this.modalOverlay.style.display = "flex";
                e.preventDefault();
                e.stopPropagation();
            });

            // Keyboard support (bubbles from focusable children)
            this.wrapper.addEventListener("keydown", (e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                    applyValue(this.knobValueWidget.value + this.properties.stepper); // <-- changed
                    e.preventDefault();
                } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                    applyValue(this.knobValueWidget.value - this.properties.stepper); // <-- changed
                    e.preventDefault();
                }
            });

            // Canvas pan/zoom passthrough: let wheel (over sliders/buttons/
            // background, not the knob itself) and middle-mouse drag still
            // reach the LiteGraph canvas, same pattern as Magik Mega Panel.
            this.wrapper.addEventListener("wheel", (e) => this._forwardWheelToLiteGraph(e), { passive: false });
            this.wrapper.addEventListener("pointerdown", (e) => this._maybeStartCanvasPan(e));
        };

        nodeType.prototype._forwardWheelToLiteGraph = function (e) {
            const canvas = app.canvas;
            if (!canvas) return;
            e.preventDefault();
            e.stopPropagation();
            if (typeof canvas.processMouseWheel === "function") {
                canvas.processMouseWheel(e);
                return;
            }
            const canvasEl = canvas.canvas;
            if (!canvasEl) return;
            canvasEl.dispatchEvent(new WheelEvent("wheel", {
                deltaX: e.deltaX, deltaY: e.deltaY, deltaZ: e.deltaZ,
                deltaMode: e.deltaMode,
                clientX: e.clientX, clientY: e.clientY,
                screenX: e.screenX, screenY: e.screenY,
                ctrlKey: e.ctrlKey, shiftKey: e.shiftKey,
                altKey: e.altKey, metaKey: e.metaKey,
                bubbles: true, cancelable: true, composed: true,
            }));
        };

        nodeType.prototype._maybeStartCanvasPan = function (e) {
            if (e.button !== 1) return;
            const canvas = app.canvas;
            if (!canvas || typeof canvas.processMouseDown !== "function") return;
            e.preventDefault();
            e.stopPropagation();
            canvas.processMouseDown(e);
        };

        nodeType.prototype._setupResizeObserver = function () {
            this._resizeObserver = new ResizeObserver(() => this._updateLayout());
            this._resizeObserver.observe(this.widgets.find(w => w.name === "magik_knob_int_ui").element);
        };

        nodeType.prototype._updateLayout = function () {
            const container = this.widgets.find(w => w.name === "magik_knob_int_ui").element;
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w === 0 || h === 0) return;

            const btnSize = Math.max(20, Math.min(4000, Math.min(w, h) * 0.08));
            this.settingsBtn.style.width = btnSize + 'px';
            this.settingsBtn.style.height = btnSize + 'px';
            this.settingsBtn.style.fontSize = (btnSize * 0.6) + 'px';
            this.titleDisplay.style.fontSize = (btnSize * 0.5) + 'px';
            this.titleDisplay.style.lineHeight = btnSize + 'px';

            const headerHeight = btnSize + 10;
            const availableHeight = h - headerHeight;
            const availableWidth = w;

            // Knob sizing
            const knobSize = Math.min(availableWidth * 0.9, availableHeight * 0.9);
            this.knobBody.style.width = this.knobBody.style.height = knobSize + 'px';
            this.knobBody.style.setProperty('--knob-size', knobSize + 'px');
            const indicatorHeight = knobSize * 0.25;
            this.knobIndicator.style.height = indicatorHeight + 'px';
            this.knobIndicator.style.width = (knobSize * 0.043) + 'px';
            const indicatorTop = knobSize * 0.107;
            this.knobIndicator.style.top = indicatorTop + 'px';
            this.knobIndicator.style.left = `calc(50% - ${knobSize * 0.0215}px)`;
            const transformOriginY = (knobSize / 2) - indicatorTop;
            this.knobIndicator.style.transformOrigin = `center ${transformOriginY}px`;
            const centerSize = knobSize * 0.714;
            this.knobCenter.style.width = this.knobCenter.style.height = centerSize + 'px';
            this.knobValue.style.fontSize = (knobSize * 0.114) + 'px';

            const cornerBtnSize = knobSize / 7;
            this.minusBtn.style.width = this.plusBtn.style.width = cornerBtnSize + 'px';
            this.minusBtn.style.height = this.plusBtn.style.height = cornerBtnSize + 'px';
            this.minusBtn.style.fontSize = this.plusBtn.style.fontSize = (cornerBtnSize * 0.6) + 'px';

            // Vertical slider
            const vTrackHeight = availableHeight * 0.7;
            this.vTrack.style.height = vTrackHeight + 'px';
            this.vTrack.style.width = '30px';
            const thumbHeight = Math.max(20, vTrackHeight * 0.1);
            this.vThumb.style.height = thumbHeight + 'px';
            this.vThumb.style.width = '40px';
            this.vThumb.style.left = '-5px';
            this.vValueSpan.style.fontSize = (thumbHeight * 0.5) + 'px';

            // Horizontal slider
            const hTrackWidth = availableWidth * 0.8;
            this.hTrack.style.width = hTrackWidth + 'px';
            this.hTrack.style.height = '30px';
            const thumbWidth = Math.max(20, hTrackWidth * 0.05);
            this.hThumb.style.width = thumbWidth + 'px';
            this.hThumb.style.height = '40px';
            this.hThumb.style.top = '-5px';
            this.hValueSpan.style.fontSize = (thumbWidth * 0.5) + 'px';

            this._updateSliderPositions();
        };

        nodeType.prototype._updateAllVisuals = function () {
            this.titleDisplay.textContent = this.properties.title;
            this.wrapper.style.setProperty("--knob-color", this.properties.color);
            // Step buttons show current stepper value
            this.minusBtn.textContent = `-${this.properties.stepper}`;
            this.plusBtn.textContent = `+${this.properties.stepper}`;
            this._updateKnobVisuals();
            this._updateSliderPositions();
            this._updateAriaAttributes();
        };

        nodeType.prototype._updateKnobVisuals = function () {
            const props = this.properties;
            const range = props.max - props.min;
            const pct = (this.knobValueWidget.value - props.min) / (range || 1); // <-- changed
            const deg = -135 + pct * 270;
            this.knobIndicator.style.transform = `rotate(${deg}deg)`;
            this.knobValue.textContent = this.knobValueWidget.value; // <-- changed
            this.knobBody.style.setProperty('--knob-progress', pct * 100);
        };

        nodeType.prototype._updateSliderPositions = function () {
            const props = this.properties;
            const range = props.max - props.min;
            const pct = (this.knobValueWidget.value - props.min) / (range || 1); // <-- changed

            // Vertical
            const vTrackHeight = parseFloat(this.vTrack.style.height) || 100;
            const thumbHeight = parseFloat(this.vThumb.style.height) || 20;
            const vPos = (1 - pct) * (vTrackHeight - thumbHeight);
            this.vThumb.style.top = vPos + 'px';
            this.vValueSpan.textContent = this.knobValueWidget.value; // <-- changed

            // Horizontal
            const hTrackWidth = parseFloat(this.hTrack.style.width) || 100;
            const thumbWidth = parseFloat(this.hThumb.style.width) || 20;
            const hPos = pct * (hTrackWidth - thumbWidth);
            this.hThumb.style.left = hPos + 'px';
            this.hValueSpan.textContent = this.knobValueWidget.value; // <-- changed
        };

        nodeType.prototype._applyTheme = function (theme) {
            this.wrapper.classList.remove(...THEMES.map(t => `theme-${t}`));
            this.wrapper.classList.add(`theme-${theme}`);
        };

        nodeType.prototype._applyShape = function (shape) {
            this.wrapper.classList.remove(...SHAPES.map(s => `shape-${s}`));
            this.wrapper.classList.add(`shape-${shape}`);
            this._updateLayout();
        };

        nodeType.prototype._buildModal = function (overlay) {
            const modal = document.createElement("div");
            modal.className = "magik-knob-int-modal";

            const title = document.createElement("div");
            title.className = "magik-knob-int-modal-title";
            title.textContent = "Knob Settings";
            modal.appendChild(title);

            const createRow = (labelText, input) => {
                const row = document.createElement("div");
                row.className = "magik-knob-int-modal-row";
                const label = document.createElement("label");
                label.textContent = labelText;
                row.appendChild(label);
                row.appendChild(input);
                return row;
            };

            // Inputs
            const titleInput = document.createElement("input");
            titleInput.type = "text";

            const minInput = document.createElement("input");
            minInput.type = "number";
            minInput.step = "1";

            const maxInput = document.createElement("input");
            maxInput.type = "number";
            maxInput.step = "1";

            const stepperInput = document.createElement("input");
            stepperInput.type = "number";
            stepperInput.step = "1";
            stepperInput.min = "1";

            const colorInput = document.createElement("input");
            colorInput.type = "color";

            // Theme icon grid
            const themeRow = document.createElement("div");
            themeRow.className = "magik-knob-int-modal-row";
            const themeLabel = document.createElement("label");
            themeLabel.textContent = "Theme:";
            themeRow.appendChild(themeLabel);

            const iconGrid = document.createElement("div");
            iconGrid.className = "theme-icon-grid";

            const themeIcons = [];
            THEMES.forEach(theme => {
                const icon = document.createElement("div");
                icon.className = "theme-icon";
                icon.dataset.theme = theme;
                icon.title = theme.charAt(0).toUpperCase() + theme.slice(1);
                const defaultColor = THEME_DEFAULTS[theme]?.color || "#888";
                icon.style.background = `radial-gradient(circle at 30% 30%, ${defaultColor}, #333)`;
                iconGrid.appendChild(icon);
                themeIcons.push(icon);
            });

            themeRow.appendChild(iconGrid);
            modal.appendChild(themeRow);

            // Shape select
            const shapeSelect = document.createElement("select");
            SHAPES.forEach(shape => {
                const option = document.createElement("option");
                option.value = shape;
                option.textContent = shape.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                shapeSelect.appendChild(option);
            });

            modal.appendChild(createRow("Title:", titleInput));
            modal.appendChild(createRow("Min:", minInput));
            modal.appendChild(createRow("Max:", maxInput));
            modal.appendChild(createRow("Step:", stepperInput));
            modal.appendChild(createRow("Color:", colorInput));
            modal.appendChild(createRow("Shape:", shapeSelect));

            const buttons = document.createElement("div");
            buttons.className = "magik-knob-int-modal-buttons";
            const saveBtn = document.createElement("button");
            saveBtn.className = "magik-knob-int-modal-button save";
            saveBtn.textContent = "Save";
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "magik-knob-int-modal-button";
            cancelBtn.textContent = "Cancel";

            buttons.appendChild(cancelBtn);
            buttons.appendChild(saveBtn);
            modal.appendChild(buttons);
            overlay.appendChild(modal);

            let tempTheme = this.themeWidget.value;
            let savedTheme = this.themeWidget.value;

            const updateSelectedIcon = (theme) => {
                themeIcons.forEach(icon => {
                    icon.classList.toggle('selected', icon.dataset.theme === theme);
                });
            };

            const applyThemeDefaults = (theme) => {
                const defaults = THEME_DEFAULTS[theme];
                if (defaults) {
                    colorInput.value = defaults.color;
                    titleInput.value = defaults.title;
                }
            };

            themeIcons.forEach(icon => {
                icon.addEventListener('click', () => {
                    const theme = icon.dataset.theme;
                    tempTheme = theme;
                    this._applyTheme(theme);
                    updateSelectedIcon(theme);
                    applyThemeDefaults(theme);
                });

                icon.addEventListener('mouseenter', () => {
                    this._applyTheme(icon.dataset.theme);
                });

                icon.addEventListener('mouseleave', () => {
                    this._applyTheme(tempTheme);
                });
            });

            const hide = () => overlay.style.display = "none";

            const show = () => {
                titleInput.value = this.properties.title;
                minInput.value = this.properties.min;
                maxInput.value = this.properties.max;
                stepperInput.value = this.properties.stepper;
                colorInput.value = this.properties.color;
                shapeSelect.value = this.shapeWidget.value;

                tempTheme = this.themeWidget.value;
                savedTheme = this.themeWidget.value;
                updateSelectedIcon(tempTheme);
                this._applyTheme(tempTheme);
            };

            cancelBtn.addEventListener("click", () => {
                this._applyTheme(savedTheme);
                hide();
            });

            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) {
                    this._applyTheme(savedTheme);
                    hide();
                }
            });

            saveBtn.addEventListener("click", () => {
                let stepperVal = parseInt(stepperInput.value, 10);
                const min = parseInt(minInput.value, 10);
                const max = parseInt(maxInput.value, 10);
                if (isNaN(stepperVal) || stepperVal < 1) stepperVal = 1;
                const range = max - min;
                if (stepperVal > range && range > 0) {
                    console.warn(`Step ${stepperVal} exceeds range ${range}, capping to ${range}`);
                    stepperVal = range;
                }
                stepperInput.value = stepperVal;

                this.properties.title = titleInput.value;
                this.properties.min = min;
                this.properties.max = max;
                this.properties.stepper = stepperVal;
                this.properties.color = colorInput.value;

                this.shapeWidget.value = shapeSelect.value;
                this.shapeWidget.callback?.(shapeSelect.value);

                if (tempTheme !== this.themeWidget.value) {
                    this.themeWidget.value = tempTheme;
                    this.themeWidget.callback?.(tempTheme);
                } else {
                    this._applyTheme(tempTheme);
                }

                this._updateAllVisuals();
                hide();
            });

            return { show, hide };
        };

        // Cleanup
        const onRemoved = nodeType.prototype.onRemoved;
        nodeType.prototype.onRemoved = function () {
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                delete this._resizeObserver;
            }
            if (this.modalOverlay && this.modalOverlay.parentNode) {
                this.modalOverlay.parentNode.removeChild(this.modalOverlay);
            }
            onRemoved?.apply(this, arguments);
        };

        const onConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function (info) {
            onConfigure?.apply(this, arguments);
            this._syncAllVisuals?.();
            if (this.themeWidget) this._applyTheme(this.themeWidget.value);
            if (this.shapeWidget) this._applyShape(this.shapeWidget.value);
        };

        nodeType.prototype._syncAllVisuals = function () {
            this._updateAllVisuals();
            this._updateLayout();
        };
    }
};

app.registerExtension(MagikKnobIntExtension);
