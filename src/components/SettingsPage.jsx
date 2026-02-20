import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, XCircle, Loader } from 'lucide-react';

const SETTINGS_KEYS = {
    API_URL: 'settings_api_url',
    CODE: 'settings_code',
};

export const getSettings = () => ({
    apiUrl: localStorage.getItem(SETTINGS_KEYS.API_URL) || '',
    code: localStorage.getItem(SETTINGS_KEYS.CODE) || '',
});

export const isSettingsComplete = () => {
    const settings = getSettings();
    return settings.apiUrl.trim() !== '' && settings.code.trim() !== '';
};

const StatusIcon = ({ status }) => {
    if (status === 'checking') return <Loader size={22} className="text-blue-500 animate-spin" />;
    if (status === 'ok')       return <CheckCircle size={24} className="text-green-500" />;
    if (status === 'error')    return <XCircle size={24} className="text-red-500" />;
    return <span className="text-gray-400 text-lg">—</span>;
};

const DiagRow = ({ label, value, status }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-mono text-gray-800 break-all">{value}</p>
        </div>
        <div className="flex-shrink-0">
            <StatusIcon status={status} />
        </div>
    </div>
);

const SettingsPage = ({ setError, onSettingsSaved }) => {
    const [apiUrl, setApiUrl] = useState('');
    const [code, setCode] = useState('');
    const [saved, setSaved] = useState(false);

    // Diagnostic state
    const [diagRunning, setDiagRunning] = useState(false);
    const [diagDone, setDiagDone] = useState(false);
    const [apiStatus, setApiStatus] = useState('idle');
    const [codeStatus, setCodeStatus] = useState('idle');
    const [ingredientsResult, setIngredientsResult] = useState(null); // null | { count } | { error }
    const [dishesResult, setDishesResult] = useState(null);

    useEffect(() => {
        const settings = getSettings();
        setApiUrl(settings.apiUrl);
        setCode(settings.code);
    }, []);

    const canSave = apiUrl.trim() !== '' && code.trim() !== '';
    const canDiag = apiUrl.trim() !== '' && !diagRunning;

    const handleSave = () => {
        if (!canSave) return;
        localStorage.setItem(SETTINGS_KEYS.API_URL, apiUrl.trim());
        localStorage.setItem(SETTINGS_KEYS.CODE, code.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setDiagDone(false);
        setApiStatus('idle');
        setCodeStatus('idle');
        setIngredientsResult(null);
        setDishesResult(null);
        if (onSettingsSaved) onSettingsSaved();
    };

    const runDiagnostic = async () => {
        const url = apiUrl.trim();
        const userCode = code.trim();
        if (!url) return;

        setDiagRunning(true);
        setDiagDone(false);
        setApiStatus('checking');
        setCodeStatus('checking');
        setIngredientsResult(null);
        setDishesResult(null);

        let localApiOk = false;
        let localCodeOk = false;
        let localIngredients = null;
        let localDishes = null;

        // 1. Vérification de l'URL (/api/status)
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 5000);
            await fetch(`${url}/api/status`, { signal: ctrl.signal });
            clearTimeout(t);
            localApiOk = true;
            setApiStatus('ok');
        } catch {
            setApiStatus('error');
        }

        // 2. Vérification de l'identifiant (/api/authenticate)
        if (userCode) {
            try {
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 5000);
                const res = await fetch(`${url}/api/authenticate`, {
                    signal: ctrl.signal,
                    headers: { 'X-User-Code': userCode },
                });
                clearTimeout(t);
                localCodeOk = res.status === 200;
                setCodeStatus(localCodeOk ? 'ok' : 'error');
            } catch {
                setCodeStatus('error');
            }
        } else {
            setCodeStatus('idle');
        }

        // 3. Ingrédients
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 5000);
            const res = await fetch(`${url}/api/ingredients`, {
                signal: ctrl.signal,
                headers: { 'Content-Type': 'application/json', ...(userCode ? { 'X-User-Code': userCode } : {}) },
            });
            clearTimeout(t);
            if (!res.ok) throw new Error();
            const data = await res.json();
            localIngredients = { count: Array.isArray(data) ? data.length : 0 };
            setIngredientsResult(localIngredients);
        } catch {
            localIngredients = { error: true };
            setIngredientsResult(localIngredients);
        }

        // 4. Plats
        try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 5000);
            const res = await fetch(`${url}/api/dishes`, {
                signal: ctrl.signal,
                headers: { 'Content-Type': 'application/json', ...(userCode ? { 'X-User-Code': userCode } : {}) },
            });
            clearTimeout(t);
            if (!res.ok) throw new Error();
            const data = await res.json();
            localDishes = { count: Array.isArray(data) ? data.length : 0 };
            setDishesResult(localDishes);
        } catch {
            localDishes = { error: true };
            setDishesResult(localDishes);
        }

        setDiagRunning(false);
        setDiagDone(true);

        const allOk =
            localApiOk &&
            localCodeOk &&
            localIngredients && !localIngredients.error &&
            localDishes && !localDishes.error;

        if (allOk) {
            if (setError) setError(null);
            if (onSettingsSaved) onSettingsSaved();
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Paramètres</h1>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
                {/* URL du backend */}
                <div>
                    <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        URL du backend
                    </label>
                    <input
                        id="apiUrl"
                        type="url"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="http://localhost:8080"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Adresse de l'API backend (obligatoire)
                    </p>
                </div>

                {/* Code */}
                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                        Identifiant
                    </label>
                    <input
                        id="code"
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Entrez votre identifiant"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Bouton Enregistrer */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors ${!canSave ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: 'var(--custom-blue)' }}
                    >
                        <Save size={18} />
                        Enregistrer
                    </button>
                    {saved && (
                        <span className="text-green-600 font-medium">
                            Paramètres enregistrés !
                        </span>
                    )}
                </div>

                {/* Diagnostique */}
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-semibold text-gray-700">Diagnostique</h2>
                        <button
                            onClick={runDiagnostic}
                            disabled={!canDiag}
                            className="flex items-center gap-2 px-4 py-1.5 text-sm text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: 'var(--custom-blue)' }}
                        >
                            {diagRunning && <Loader size={14} className="animate-spin" />}
                            Lancer le diagnostic
                        </button>
                    </div>

                    <div className="space-y-2">
                        {/* URL de l'API */}
                        <DiagRow
                            label="URL de l'API"
                            value={apiUrl || <span className="text-gray-400 italic">Non configurée</span>}
                            status={apiStatus}
                        />

                        {/* Identifiant */}
                        {diagDone || codeStatus !== 'idle' ? (
                            <DiagRow
                                label="Vérification de l'identifiant"
                                value={
                                    codeStatus === 'ok'
                                        ? 'Identifiant valide'
                                        : codeStatus === 'error'
                                        ? 'Identifiant incorrect'
                                        : codeStatus === 'checking'
                                        ? 'Vérification en cours…'
                                        : '—'
                                }
                                status={codeStatus}
                            />
                        ) : null}

                        {/* Ingrédients */}
                        {(diagDone || ingredientsResult) && (
                            <DiagRow
                                label="Ingrédients en base"
                                value={
                                    !ingredientsResult
                                        ? '…'
                                        : ingredientsResult.error
                                        ? 'Impossible de récupérer la liste des ingrédients'
                                        : `${ingredientsResult.count} ingrédient${ingredientsResult.count !== 1 ? 's' : ''}`
                                }
                                status={
                                    !ingredientsResult ? 'checking'
                                    : ingredientsResult.error ? 'error'
                                    : 'ok'
                                }
                            />
                        )}

                        {/* Plats */}
                        {(diagDone || dishesResult) && (
                            <DiagRow
                                label="Plats en base"
                                value={
                                    !dishesResult
                                        ? '…'
                                        : dishesResult.error
                                        ? 'Impossible de récupérer la liste des plats'
                                        : `${dishesResult.count} plat${dishesResult.count !== 1 ? 's' : ''}`
                                }
                                status={
                                    !dishesResult ? 'checking'
                                    : dishesResult.error ? 'error'
                                    : 'ok'
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
