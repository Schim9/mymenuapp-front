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

const SettingsPage = ({ setError, onSettingsSaved }) => {
    const [apiUrl, setApiUrl] = useState('');
    const [code, setCode] = useState('');
    const [saved, setSaved] = useState(false);
    const [apiStatus, setApiStatus] = useState('idle'); // 'idle' | 'checking' | 'ok' | 'error'

    const checkApi = async (url) => {
        const trimmedUrl = (url || '').trim();
        if (!trimmedUrl) {
            setApiStatus('idle');
            return;
        }
        setApiStatus('checking');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
            await fetch(`${trimmedUrl}/api/status`, { signal: controller.signal });
            setApiStatus('ok');
        } catch {
            setApiStatus('error');
        } finally {
            clearTimeout(timeout);
        }
    };

    useEffect(() => {
        const settings = getSettings();
        setApiUrl(settings.apiUrl);
        setCode(settings.code);
        if (settings.apiUrl) {
            checkApi(settings.apiUrl);
        }
    }, []);

    const canSave = apiUrl.trim() !== '' && code.trim() !== '';

    const handleSave = () => {
        if (!canSave) return;
        localStorage.setItem(SETTINGS_KEYS.API_URL, apiUrl.trim());
        localStorage.setItem(SETTINGS_KEYS.CODE, code.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        checkApi(apiUrl.trim());
        if (onSettingsSaved) {
            onSettingsSaved();
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
                            Paramètres enregistrés ! Rechargez la page pour appliquer les changements.
                        </span>
                    )}
                </div>

                {/* Diagnostique */}
                <div className="border-t pt-4">
                    <h2 className="text-base font-semibold text-gray-700 mb-3">Diagnostique</h2>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">URL de l'API</p>
                            <p className="text-sm font-mono text-gray-800 break-all">
                                {apiUrl || <span className="text-gray-400 italic">Non configurée</span>}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            {apiStatus === 'idle' && <span className="text-gray-400 text-lg">—</span>}
                            {apiStatus === 'checking' && <Loader size={22} className="text-blue-500 animate-spin" />}
                            {apiStatus === 'ok' && <CheckCircle size={24} className="text-green-500" />}
                            {apiStatus === 'error' && <XCircle size={24} className="text-red-500" />}
                        </div>
                    </div>
                    <button
                        onClick={() => checkApi(apiUrl)}
                        disabled={!apiUrl.trim() || apiStatus === 'checking'}
                        className="mt-2 text-sm text-cyan-600 hover:text-cyan-800 underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Tester la connexion
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
