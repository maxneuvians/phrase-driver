const fs = require('fs');
const path = require('path');
const axios = require('axios');

const GITHUB_SESSION_ENDPOINT = 'https://api.github.com/copilot_internal/v2/token';
const EDITOR_VERSION = 'vscode/1.83.1';
const EDITOR_PLUGIN_VERSION = 'copilot-chat/0.8.0';
const USER_AGENT = 'githubCopilot/1.155.0';

async function getCopilotSessionToken() {
    const tokenPath = path.join(process.cwd(), '.github_copilot_token');
    const accessToken = fs.readFileSync(tokenPath, 'utf8').trim();

    const headers = {
        'accept': 'application/json',
        'authorization': `token ${accessToken}`,
        'editor-version': EDITOR_VERSION,
        'editor-plugin-version': EDITOR_PLUGIN_VERSION,
        'user-agent': USER_AGENT,
    };

    const resp = await axios.get(GITHUB_SESSION_ENDPOINT, { headers });
    if (resp.status !== 200) {
        throw new Error(`Failed to get session token: ${resp.status}`);
    }
    return resp.data;
}

async function callCopilotLLM({ token, prompt, model = 'gpt-4o', temperature = 0.2, top_p = 1.0, n = 1, stream = false }) {
    const axios = require('axios');
    const GITHUB_COMPLETION_ENDPOINT = 'https://api.githubcopilot.com/chat/completions';
    const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
    ];
    const body = {
        model,
        messages,
        temperature,
        top_p,
        n,
        stream
    };
    const resp = await axios.post(GITHUB_COMPLETION_ENDPOINT, body, {
        headers: {
            'authorization': `Bearer ${token}`,
            'editor-version': 'vscode/1.83.1',
            'editor-plugin-version': 'copilot-chat/0.8.0',
            'user-agent': 'githubCopilot/1.155.0',
            'content-type': 'application/json',
            'accept': 'application/json',
        },
        timeout: 20000
    });
    if (resp.status !== 200) {
        throw new Error('LLM API error: ' + JSON.stringify(resp.data));
    }
    return resp.data;
}

module.exports = { getCopilotSessionToken, callCopilotLLM };
