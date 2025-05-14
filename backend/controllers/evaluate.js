// Mock LLM evaluation controller
const { getCopilotSessionToken, callCopilotLLM } = require('../models/copilot');
const axios = require('axios');
let copilotSession = null;
let copilotSessionExpiry = 0;

async function getValidCopilotSession() {
    const now = Date.now() / 1000;
    if (!copilotSession || now >= copilotSessionExpiry) {
        const session = await getCopilotSessionToken();
        copilotSession = session;
        // session.expires_at is an ISO string, convert to epoch seconds
        copilotSessionExpiry = Math.floor(new Date(session.expires_at).getTime() / 1000) - 60; // renew 1 min early
    }
    return copilotSession;
}

// POST /api/evaluate
// Expects: { sentence, criteria, word, category }
async function evaluateSentenceController(req, res) {
    const { sentence, criteria, word, category } = req.body;
    if (!sentence || !word || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get or renew Copilot session token
    try {
        const session = await getValidCopilotSession();
    } catch (err) {
        return res.status(500).json({ error: 'Failed to get Copilot session token' });
    }

    // Compose the prompt for the LLM
    let criteriaText = '';
    if (Array.isArray(criteria) && criteria.length > 0) {
        criteriaText = '\nAdditional evaluation criteria:';
        for (const c of criteria) {
            if (c.startsWith('tense:')) {
                criteriaText += `\n- Written in the ${c.replace('tense:', '')} tense`;
            } else if (c === 'negation') {
                criteriaText += '\n- Use a negation';
            } else if (c === 'interrogative') {
                criteriaText += '\n- Use interrogative mood (question format)';
            } else if (c === 'imperative') {
                criteriaText += '\n- Use imperative mood (command format)';
            }
        }
    }
    const prompt = `You are a French language teacher.\n\nEvaluate the following sentence written by a student.\n\nFrench word or phrase: ${word}\n\nStudent sentence: ${sentence}\n\nEvaluation criteria:\n- Is the sentence a complete sentence\n- Does the sentence capture the meaning of the vocabulary word or phrase\n- Is the sentence grammatically correct${criteriaText}\n\nIf the sentence is not correct, provide a corrected version.\n\nRespond in the following JSON format:\n{\n  "original": <original sentence>,\n  "corrected": <corrected sentence>,\n  "changes": [ { "from": <original>, "to": <corrected>, "reason": <why changed> }, ... ],\n  "explanation": <explanation of why the original meets or does not meet the criteria>\n}`;

    // LLM API call
    let llmResponse;
    try {
        const session = await getValidCopilotSession();
        llmResponse = await callCopilotLLM({
            token: session.token,
            prompt,
            model: 'gpt-4o',
            temperature: 0.2,
            top_p: 1.0,
            n: 1,
            stream: false
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to call LLM API', details: err.message });
    }

    // Parse the LLM's response
    let content = '';
    try {
        content = llmResponse.choices[0].message.content;
        // Try to parse JSON from the response
        let jsonStart = content.indexOf('{');
        let jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = content.substring(jsonStart, jsonEnd + 1);
            const result = JSON.parse(jsonString);
            return res.json(result);
        } else {
            return res.status(502).json({ error: 'LLM did not return valid JSON', content });
        }
    } catch (err) {
        return res.status(502).json({ error: 'Failed to parse LLM response', details: err.message, content });
    }
}

module.exports = { evaluateSentenceController };
