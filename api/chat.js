// api/chat.js
// Vercel Serverless Function to communicate with Azure AI Agent and Azure OpenAI securely.

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing or invalid messages parameter' });
    }

    // Retrieve Azure credentials from environment variables
    const apiKey = process.env.AZURE_API_KEY;
    const projectEndpoint = process.env.AZURE_PROJECT_ENDPOINT;
    const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const agentId = process.env.AZURE_AGENT_ID || "postinhoPINK";

    if (!apiKey || !projectEndpoint || !openaiEndpoint) {
        console.error("Missing environment variables: AZURE_API_KEY, AZURE_PROJECT_ENDPOINT, or AZURE_OPENAI_ENDPOINT");
        return res.status(500).json({ error: 'Server misconfiguration: Missing Azure API credentials.' });
    }

    try {
        let instructions = "Você é um assistente de IA.";
        let temperature = 1.0;
        let top_p = 1.0;
        let model = "gpt-4.1";

        // 1. Fetch latest agent configuration from Azure AI Foundry
        try {
            const agentRes = await fetch(`${projectEndpoint}/agents/${agentId}?api-version=v1`, {
                headers: {
                    "api-key": apiKey,
                    "Content-Type": "application/json"
                }
            });
            if (agentRes.ok) {
                const agentData = await agentRes.json();
                const latestVersion = agentData?.versions?.latest?.definition;
                if (latestVersion) {
                    if (latestVersion.instructions) instructions = latestVersion.instructions;
                    if (typeof latestVersion.temperature === 'number') temperature = latestVersion.temperature;
                    if (typeof latestVersion.top_p === 'number') top_p = latestVersion.top_p;
                    if (latestVersion.model) model = latestVersion.model;
                }
            } else {
                console.warn("Failed to fetch agent details from Azure Foundry. Status:", agentRes.status);
            }
        } catch (fetchErr) {
            console.error("Error fetching agent settings from Azure Foundry:", fetchErr);
        }

        // 2. Prepare payload for Azure OpenAI Chat Completions
        // Filter out any system messages from client, prefix with the fetched agent system instructions
        const filteredMessages = messages.filter(msg => msg.role !== 'system');
        const finalMessages = [
            { role: 'system', content: instructions },
            ...filteredMessages
        ];

        // 3. Request completion from Azure OpenAI
        const chatRes = await fetch(`${openaiEndpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: finalMessages,
                temperature: temperature,
                top_p: top_p
            })
        });

        if (!chatRes.ok) {
            const errText = await chatRes.text();
            throw new Error(`Azure OpenAI call failed with status ${chatRes.status}: ${errText}`);
        }

        const chatData = await chatRes.json();
        const reply = chatData?.choices?.[0]?.message?.content;

        if (!reply) {
            throw new Error("Invalid response structure from Azure OpenAI");
        }

        return res.status(200).json({ reply });
    } catch (err) {
        console.error("Backend error:", err);
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
}
