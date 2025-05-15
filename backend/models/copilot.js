const fs = require('fs');
const path = require('path');
const axios = require('axios');

const GITHUB_SESSION_ENDPOINT = 'https://api.github.com/copilot_internal/v2/token';
const EDITOR_VERSION = 'vscode/1.100.0';
const EDITOR_PLUGIN_VERSION = 'copilot-chat/0.27.0';
const USER_AGENT = 'githubCopilot/1.317.0';

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

async function getCopilotModels(token) {

    const GITHUB_MODELS_ENDPOINT = 'https://api.githubcopilot.com/models';
    const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${token}`,
        'editor-version': EDITOR_VERSION,
        'editor-plugin-version': EDITOR_PLUGIN_VERSION,
        'user-agent': USER_AGENT,
    };

    const resp = await axios.get(GITHUB_MODELS_ENDPOINT, { headers });
    if (resp.status !== 200) {
        throw new Error(`Failed to get models: ${resp.status}`);
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
            'accept': 'application/json',
            'content-Type': 'application/json',
            'editor-version': EDITOR_VERSION,
            'editor-plugin-version': EDITOR_PLUGIN_VERSION,
            'user-agent': USER_AGENT,
        },
        timeout: 20000
    });
    if (resp.status !== 200) {
        throw new Error('LLM API error: ' + JSON.stringify(resp.data));
    }
    return resp.data;
}

module.exports = { getCopilotSessionToken, callCopilotLLM, getCopilotModels };
