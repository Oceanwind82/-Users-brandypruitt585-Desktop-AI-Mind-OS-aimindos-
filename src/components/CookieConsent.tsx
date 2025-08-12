'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Check } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly));
    setShowBanner(false);
  };

  const updatePreferences = (key: keyof typeof preferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem('cookie-consent', JSON.stringify(updated));
    
    // Update consent
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: updated.analytics ? 'granted' : 'denied',
        ad_storage: updated.marketing ? 'granted' : 'denied',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur border-t border-white/20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-4">
          <Cookie className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">Cookie Preferences</h3>
            <p className="text-gray-300 text-sm mb-4">
              We use cookies to enhance your experience, analyze site usage, and personalize content. 
              You can manage your preferences below.
            </p>
            
            {/* Cookie Categories */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm font-medium">Necessary</span>
                  <p className="text-gray-400 text-xs">Required for basic site functionality</p>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Always Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm font-medium">Analytics</span>
                  <p className="text-gray-400 text-xs">Help us improve by collecting usage data</p>
                </div>
                <button
                  onClick={() => updatePreferences('analytics', !preferences.analytics)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    preferences.analytics ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.analytics ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm font-medium">Marketing</span>
                  <p className="text-gray-400 text-xs">Personalized content and advertisements</p>
                </div>
                <button
                  onClick={() => updatePreferences('marketing', !preferences.marketing)}
                  className={`w-10 h-5 rounded-full transition-colors ${
                    preferences.marketing ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.marketing ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={acceptAll}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
            >
              Accept All
            </button>
            <button
              onClick={acceptNecessary}
              className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all"
            >
              Necessary Only
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
