import React, { useEffect, useState } from 'react';
import { getCategories, getWords, evaluateSentence, saveResult } from './api';

export default function App() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [words, setWords] = useState([]);
    const [currentWord, setCurrentWord] = useState(null);
    const [sentence, setSentence] = useState('');
    const [criteria, setCriteria] = useState([]);
    const [evaluation, setEvaluation] = useState(null);
    const [acknowledged, setAcknowledged] = useState([]);
    const [correctionInput, setCorrectionInput] = useState('');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            getWords(selectedCategory).then(setWords);
        }
    }, [selectedCategory]);

    function pickRandomWord() {
        if (words.length) {
            const idx = Math.floor(Math.random() * words.length);
            setCurrentWord(words[idx]);
            setEvaluation(null);
            setSentence('');
            setAcknowledged([]);
            setCorrectionInput('');
            setSaved(false);
        }
    }

    async function handleEvaluate() {
        if (!sentence || !currentWord) return;
        setLoading(true);
        const data = {
            sentence,
            criteria,
            word: currentWord.french,
            category: selectedCategory,
        };
        try {
            const result = await evaluateSentence(data);
            setEvaluation(result);
        } finally {
            setLoading(false);
        }
        setAcknowledged([]);
        setCorrectionInput('');
        setSaved(false);
    }

    async function handleSave() {
        if (!currentWord || !evaluation) return;
        await saveResult({
            category: selectedCategory,
            english: currentWord.english,
            french: currentWord.french,
            original_sentence: evaluation.original,
            corrected_sentence: evaluation.corrected,
        });
        setSaved(true);
        // Reset state after save so a new word can be chosen
        setTimeout(() => {
            setCurrentWord(null);
            setEvaluation(null);
            setSentence('');
            setAcknowledged([]);
            setCorrectionInput('');
            setSaved(false);
        }, 500); // Show 'Saved!' for a short moment
    }

    return (
        <div className="pd-main">
            <h1 className="pd-title">Phrase Driver</h1>
            <div className="pd-row">
                <label className="pd-label">Catégorie&nbsp;:</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="pd-select">
                    <option value="">Sélectionner...</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <button onClick={pickRandomWord} disabled={!words.length} className="pd-btn">Choisir un mot aléatoire</button>
            </div>
            <div className="pd-criteria-card">
                <label className="pd-criteria-label">Critères supplémentaires&nbsp;:</label>
                <div className="pd-criteria-row">
                    <div>
                        <label style={{ fontWeight: 500 }}>Temps&nbsp;:</label>
                        <select
                            value={criteria.find(c => c.startsWith('tense:'))?.replace('tense:', '') || ''}
                            onChange={e => {
                                setCriteria([
                                    ...criteria.filter(c => !c.startsWith('tense:')),
                                    e.target.value ? `tense:${e.target.value}` : null
                                ].filter(Boolean));
                            }}
                            className="pd-criteria-select"
                        >
                            <option value="">Aucun</option>
                            <option value="present">Présent</option>
                            <option value="passe compose">Passé composé</option>
                            <option value="imparfait">Imparfait</option>
                            <option value="future proche">Futur proche</option>
                            <option value="future simple">Futur simple</option>
                            <option value="conditional present">Conditionnel présent</option>
                            <option value="subjunctive present">Subjonctif présent</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                checked={criteria.includes('negation')}
                                onChange={e => {
                                    setCriteria(
                                        e.target.checked
                                            ? [...criteria, 'negation']
                                            : criteria.filter(c => c !== 'negation')
                                    );
                                }}
                                style={{ marginRight: 6 }}
                            />
                            Négation
                        </label>
                    </div>
                    <div>
                        <label style={{ fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                checked={criteria.includes('interrogative')}
                                onChange={e => {
                                    setCriteria(
                                        e.target.checked
                                            ? [...criteria, 'interrogative']
                                            : criteria.filter(c => c !== 'interrogative')
                                    );
                                }}
                                style={{ marginRight: 6 }}
                            />
                            Interrogatif (Question)
                        </label>
                    </div>
                    <div>
                        <label style={{ fontWeight: 500 }}>
                            <input
                                type="checkbox"
                                checked={criteria.includes('imperative')}
                                onChange={e => {
                                    setCriteria(
                                        e.target.checked
                                            ? [...criteria, 'imperative']
                                            : criteria.filter(c => c !== 'imperative')
                                    );
                                }}
                                style={{ marginRight: 6 }}
                            />
                            Impératif (Commande)
                        </label>
                    </div>
                </div>
            </div>
            {currentWord && (
                <div style={{ marginTop: 18, marginBottom: 10 }}>
                    <div className="pd-word"><b>Mot&nbsp;:</b> <span className="pd-word-french">{currentWord.french}</span> <span className="pd-word-english">({currentWord.english})</span></div>
                    <div style={{ margin: '10px 0' }}>
                        <textarea
                            rows={3}
                            className="pd-textarea"
                            placeholder="Écrivez votre phrase..."
                            value={sentence}
                            onChange={e => setSentence(e.target.value)}
                            disabled={!!evaluation || loading}
                            spellCheck="false"
                        />
                    </div>
                    <button
                        onClick={handleEvaluate}
                        disabled={!sentence || !!evaluation || loading}
                        className="pd-btn"
                        style={{ fontSize: 16, fontWeight: 600, position: 'relative' }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="pd-spinner" style={{ width: 18, height: 18, border: '3px solid #b3c7e6', borderTop: '3px solid #2d72d9', borderRadius: '50%', animation: 'pd-spin 1s linear infinite', display: 'inline-block' }}></span>
                                Chargement...
                            </span>
                        ) : (
                            'Soumettre la phrase'
                        )}
                    </button>
                </div>
            )}
            {evaluation && (
                <div className="pd-eval-card">
                    <h3 className="pd-eval-title">Évaluation</h3>
                    <div className="pd-eval-row"><b>Original&nbsp;:</b> <span style={{ color: '#333' }}>{evaluation.original}</span></div>
                    <div className="pd-eval-row"><b>Corrigé&nbsp;:</b> <span className="pd-eval-corrected">{evaluation.corrected}</span></div>
                    <div className="pd-eval-explanation"><b>Explication&nbsp;:</b> <span>{evaluation.explanation}</span></div>
                    {evaluation.changes.length > 0 && (
                        <div className="pd-eval-changes" style={{ marginTop: 18 }}>
                            <b>Modifications&nbsp;:</b>
                            <div className="pd-eval-changes-list" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                                {evaluation.changes.map((chg, i) => (
                                    <div key={i} className="pd-eval-changes-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f2f6fc', borderRadius: 7, padding: '10px 14px' }}>
                                        <input
                                            type="checkbox"
                                            checked={acknowledged.includes(i)}
                                            onChange={e => {
                                                setAcknowledged(
                                                    e.target.checked
                                                        ? [...acknowledged, i]
                                                        : acknowledged.filter(idx => idx !== i)
                                                );
                                            }}
                                            style={{ marginTop: 2, marginRight: 7 }}
                                        />
                                        <span className="pd-eval-changes-label" style={{ fontWeight: 400, fontSize: 15, lineHeight: 1.6 }}>{chg.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {evaluation.changes.length > 0 && acknowledged.length === evaluation.changes.length && (
                        <div style={{ margin: '16px 0 0 0' }}>
                            <b>Recopiez la phrase corrigée&nbsp;:</b>
                            <input
                                className="pd-eval-correct-input"
                                value={correctionInput}
                                onChange={e => setCorrectionInput(e.target.value)}
                                spellCheck="false"
                            />
                            <button
                                onClick={handleSave}
                                disabled={correctionInput.trim() !== evaluation.corrected.trim() || saved}
                                className="pd-eval-save-btn"
                            >
                                Enregistrer le résultat
                            </button>
                            {saved && <span className="pd-eval-saved">Enregistré&nbsp;!</span>}
                        </div>
                    )}
                    {evaluation.changes.length === 0 && (
                        <div style={{ margin: '16px 0 0 0' }}>
                            <button
                                onClick={handleSave}
                                disabled={saved}
                                className="pd-eval-save-btn"
                            >
                                Enregistrer le résultat
                            </button>
                            {saved && <span className="pd-eval-saved">Enregistré&nbsp;!</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
