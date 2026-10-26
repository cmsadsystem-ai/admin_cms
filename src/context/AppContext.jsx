import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getInitialDraft } from '../utils/helpers';
import { readStorage, writeStorage, resetStorage, STORAGE_KEYS } from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [auth, setAuth] = useState(() => readStorage(STORAGE_KEYS.cmsAuth, { role: null, username: null }));
  const [draft, setDraft] = useState(() => readStorage(STORAGE_KEYS.cmsDraftApplication, getInitialDraft()));
  const [applications, setApplications] = useState(() => readStorage(STORAGE_KEYS.cmsApplications, []));
  const [backgroundSettings, setBackgroundSettings] = useState(() => readStorage(STORAGE_KEYS.cmsBackgroundSettings, {
    enabled: true,
    videoDataUrl: '',
    videoMimeType: '',
    playbackMode: 'muted',
  }));
  const [paymentSettings, setPaymentSettings] = useState(() => {
    const settings = readStorage(STORAGE_KEYS.cmsPaymentSettings, {
      feeAmount: '',
      paymentQrs: [null, null],
      feeStructure: null,
    });
    return {
      ...settings,
      paymentQrs: settings.paymentQrs || [settings.paymentQr || null, null],
    };
  });
  const [correctionHistory, setCorrectionHistory] = useState(() => readStorage(STORAGE_KEYS.cmsCorrectionHistory, []));
  const [lastSubmitted, setLastSubmitted] = useState(() => readStorage(STORAGE_KEYS.cmsLastSubmittedApplication, null));

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsAuth, auth);
  }, [auth]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsBackgroundSettings, backgroundSettings);
  }, [backgroundSettings]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsPaymentSettings, paymentSettings);
  }, [paymentSettings]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsDraftApplication, draft);
  }, [draft]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsApplications, applications);
  }, [applications]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsCorrectionHistory, correctionHistory);
  }, [correctionHistory]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cmsLastSubmittedApplication, lastSubmitted);
  }, [lastSubmitted]);

  const saveDraft = useCallback((nextDraft) => {
    setDraft({ ...getInitialDraft(), ...nextDraft });
  }, []);

  const updateBackgroundSettings = (nextSettings) => {
    setBackgroundSettings((current) => (
      typeof nextSettings === 'function' ? nextSettings(current) : nextSettings
    ));
  };

  const updatePaymentSettings = (nextSettings) => {
    setPaymentSettings((current) => (
      typeof nextSettings === 'function' ? nextSettings(current) : nextSettings
    ));
  };

  const loginDemoUser = (role, username) => {
    setAuth({ role, username });
  };

  const logoutDemoUser = () => {
    setAuth({ role: null, username: null });
  };

  const dismissDraft = () => {
    const freshDraft = getInitialDraft();
    setDraft(freshDraft);
    writeStorage(STORAGE_KEYS.cmsDraftApplication, freshDraft);
  };

  const addHistoryEntry = (applicationId, note, actor) => {
    const entry = {
      id: `${applicationId}-${Date.now()}`,
      applicationId,
      note,
      actor,
      createdAt: new Date().toISOString(),
    };
    setCorrectionHistory((current) => [entry, ...current]);
  };

  const updateApplication = (applicationId, updates, comment, actor) => {
    setApplications((current) => {
      const next = current.map((item) => {
        if (item.id !== applicationId) return item;
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      });
      if (comment) {
        addHistoryEntry(applicationId, comment, actor);
      }
      return next;
    });
  };

  const submitApplication = (formData) => {
    const generatedId = formData.id || `CMS-${Date.now()}`;
    const appData = {
      ...formData,
      id: generatedId,
      status: 'Enquiring',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmationDate: null,
      correctionNotes: formData.correctionNotes || '',
      coursePreference: formData.coursePreference || { firstPreference: '', additionalPreferences: [] },
    };

    setApplications((current) => {
      const filtered = current.filter((item) => item.id !== generatedId);
      return [appData, ...filtered];
    });

    const appRecord = { ...appData, id: generatedId };
    setLastSubmitted(appRecord);
    setDraft(getInitialDraft());
    writeStorage(STORAGE_KEYS.cmsDraftApplication, getInitialDraft());
    return appRecord;
  };

  const confirmApplication = (applicationId, actor = 'Admission Officer') => {
    setApplications((current) => current.map((item) => {
      if (item.id !== applicationId) return item;
      return {
        ...item,
        status: 'Confirmed',
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }));
    addHistoryEntry(applicationId, 'Application confirmed by demo officer.', actor);
  };

  const resetDemoData = () => {
    resetStorage();
    setAuth({ role: null, username: null });
    setDraft(getInitialDraft());
    setApplications([]);
    setBackgroundSettings({ enabled: true, videoDataUrl: '', videoMimeType: '', playbackMode: 'muted' });
    setPaymentSettings({ feeAmount: '', paymentQrs: [null, null], feeStructure: null });
    setCorrectionHistory([]);
    setLastSubmitted(null);
  };

  const value = useMemo(() => ({
    auth,
    draft,
    applications,
    backgroundSettings,
    paymentSettings,
    correctionHistory,
    lastSubmitted,
    saveDraft,
    loginDemoUser,
    logoutDemoUser,
    submitApplication,
    updateApplication,
    confirmApplication,
    addHistoryEntry,
    dismissDraft,
    resetDemoData,
    setDraft,
    setBackgroundSettings: updateBackgroundSettings,
    setPaymentSettings: updatePaymentSettings,
  }), [auth, draft, applications, backgroundSettings, paymentSettings, correctionHistory, lastSubmitted, saveDraft]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
