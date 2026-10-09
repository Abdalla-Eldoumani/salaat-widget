import { useEffect, useState } from 'react';
import type {
  SalaatSettings,
  LocationResult,
  CalculationMethodName,
  MadhabName,
  HighLatitudeRuleName,
  DockEdge,
} from '../types';
import { CALCULATION_METHODS, COUNTRY_TO_METHOD } from '../lib/constants';
import { CITIES } from '../lib/cities';

interface OnboardingProps {
  settings: SalaatSettings;
  onUpdate: <K extends keyof SalaatSettings>(key: K, value: SalaatSettings[K]) => Promise<void>;
  geoLocation: LocationResult;
  geoDetecting: boolean;
  onGeoDetect: () => Promise<void>;
}

export default function Onboarding({
  settings,
  onUpdate,
  geoLocation,
  geoDetecting,
  onGeoDetect,
}: OnboardingProps) {
  const [step, setStep] = useState(settings.onboardingStep);

  // Step 1 state
  const [manualMode, setManualMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState(settings.locationName);

  // Step 2 state - auto-suggest method from detected country
  const suggestedMethod = geoLocation.countryCode
    ? COUNTRY_TO_METHOD[geoLocation.countryCode] ?? settings.calculationMethod
    : settings.calculationMethod;
  const [method, setMethod] = useState<CalculationMethodName>(suggestedMethod);
  const [madhab, setMadhab] = useState<MadhabName>(settings.madhab);
  const [highLatRule, setHighLatRule] = useState<HighLatitudeRuleName>(settings.highLatitudeRule);

  // Step 3 state
  const [dockEdge, setDockEdge] = useState<DockEdge>(settings.dockEdge);

  // Update suggested method when geo detection completes
  useEffect(() => {
    if (geoLocation.countryCode && step === 0) {
      const suggested = COUNTRY_TO_METHOD[geoLocation.countryCode];
      if (suggested) setMethod(suggested);
    }
  }, [geoLocation.countryCode, step]);

  const currentLat = manualMode
    ? (CITIES.find((c) => `${c.name}, ${c.countryCode}` === selectedCity)?.lat ?? geoLocation.latitude)
    : geoLocation.latitude;
  const isHighLatitude = Math.abs(currentLat) > 48;

  async function completeStep1() {
    if (manualMode) {
      const city = CITIES.find((c) => `${c.name}, ${c.countryCode}` === selectedCity);
      if (city) {
        await onUpdate('latitude', city.lat);
        await onUpdate('longitude', city.lon);
        await onUpdate('timezone', city.timezone);
        await onUpdate('locationName', `${city.name}, ${city.countryCode}`);
        await onUpdate('autoDetectLocation', false);
      }
    } else {
      await onUpdate('latitude', geoLocation.latitude);
      await onUpdate('longitude', geoLocation.longitude);
      await onUpdate('timezone', geoLocation.timezone);
      await onUpdate('locationName', `${geoLocation.city}, ${geoLocation.countryCode}`);
      await onUpdate('autoDetectLocation', true);
    }
    await onUpdate('onboardingStep', 1);
    setStep(1);
  }

  async function completeStep2() {
    await onUpdate('calculationMethod', method);
    await onUpdate('madhab', madhab);
    await onUpdate('highLatitudeRule', highLatRule);
    await onUpdate('onboardingStep', 2);
    setStep(2);
  }

  async function completeStep3() {
    await onUpdate('dockEdge', dockEdge);
    await onUpdate('onboardingStep', 3);
    await onUpdate('onboardingComplete', true);
  }

  return (
    <div className="h-full w-full flex flex-col bg-[rgba(26,38,66,0.95)]">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {step === 0 && (
          <LocationStep
            geoLocation={geoLocation}
            geoDetecting={geoDetecting}
            onGeoDetect={onGeoDetect}
            manualMode={manualMode}
            setManualMode={setManualMode}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            onContinue={completeStep1}
          />
        )}
        {step === 1 && (
          <MethodStep
            method={method}
            setMethod={setMethod}
            madhab={madhab}
            setMadhab={setMadhab}
            highLatRule={highLatRule}
            setHighLatRule={setHighLatRule}
            isHighLatitude={isHighLatitude}
            onContinue={completeStep2}
          />
        )}
        {step === 2 && (
          <PlacementStep
            dockEdge={dockEdge}
            setDockEdge={setDockEdge}
            onContinue={completeStep3}
          />
        )}
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 pb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-[#C8A84E]' : 'bg-[#4A5568]'}`}
          />
        ))}
      </div>
    </div>
  );
}

// --- Step 1: Location ---

function LocationStep({
  geoLocation,
  geoDetecting,
  onGeoDetect,
  manualMode,
  setManualMode,
  selectedCity,
  setSelectedCity,
  onContinue,
}: {
  geoLocation: LocationResult;
  geoDetecting: boolean;
  onGeoDetect: () => Promise<void>;
  manualMode: boolean;
  setManualMode: (v: boolean) => void;
  selectedCity: string;
  setSelectedCity: (v: string) => void;
  onContinue: () => void;
}) {
  const latDir = geoLocation.latitude >= 0 ? 'N' : 'S';
  const lonDir = geoLocation.longitude >= 0 ? 'E' : 'W';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-[#7B89A1] mb-1">Step 1 of 3</p>
        <h2 className="text-lg font-semibold text-[#E8E2D6]">Where are you?</h2>
        <p className="text-xs text-[#7B89A1] mt-1">
          Your location is used to calculate accurate prayer times.
        </p>
      </div>

      {!manualMode ? (
        <div className="space-y-3">
          {geoDetecting ? (
            <div className="p-4 rounded-lg bg-[rgba(15,23,42,0.85)] border border-[rgba(200,168,78,0.10)]">
              <p className="text-sm text-[#7B89A1]">Detecting your location...</p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[rgba(15,23,42,0.85)] border border-[rgba(200,168,78,0.10)]">
              <p className="text-sm font-medium text-[#E8E2D6]">
                {geoLocation.city}, {geoLocation.country}
              </p>
              <p className="text-[10px] text-[#7B89A1] mt-1">
                {Math.abs(geoLocation.latitude).toFixed(2)}{latDir}, {Math.abs(geoLocation.longitude).toFixed(2)}{lonDir}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManualMode(true)}
              className="text-xs text-[#C8A84E] hover:text-[#E8E2D6] focus:outline-none focus:ring-1 focus:ring-[#C8A84E] rounded px-1"
            >
              Not right? Choose manually
            </button>
            {!geoDetecting && (
              <button
                onClick={onGeoDetect}
                className="text-xs text-[#7B89A1] hover:text-[#E8E2D6] focus:outline-none focus:ring-1 focus:ring-[#C8A84E] rounded px-1"
              >
                Re-detect
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full text-sm bg-[rgba(15,23,42,0.85)] text-[#E8E2D6] border border-[rgba(200,168,78,0.10)] rounded px-3 py-2
              focus:outline-none focus:ring-1 focus:ring-[#C8A84E]"
            aria-label="Select city"
          >
            {!CITIES.some((c) => `${c.name}, ${c.countryCode}` === selectedCity) && (
              <option value={selectedCity}>{selectedCity}</option>
            )}
            {CITIES.map((city) => {
              const label = `${city.name}, ${city.countryCode}`;
              return (
                <option key={`${city.name}-${city.countryCode}`} value={label}>
                  {city.name}, {city.country}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => setManualMode(false)}
            className="text-xs text-[#C8A84E] hover:text-[#E8E2D6] focus:outline-none focus:ring-1 focus:ring-[#C8A84E] rounded px-1"
          >
            Back to auto-detect
          </button>
        </div>
      )}

      <ContinueButton onClick={onContinue} disabled={geoDetecting && !manualMode} />
    </div>
  );
}

// --- Step 2: Calculation Method ---

function MethodStep({
  method,
  setMethod,
  madhab,
  setMadhab,
  highLatRule,
  setHighLatRule,
  isHighLatitude,
  onContinue,
}: {
  method: CalculationMethodName;
  setMethod: (v: CalculationMethodName) => void;
  madhab: MadhabName;
  setMadhab: (v: MadhabName) => void;
  highLatRule: HighLatitudeRuleName;
  setHighLatRule: (v: HighLatitudeRuleName) => void;
  isHighLatitude: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-[#7B89A1] mb-1">Step 2 of 3</p>
        <h2 className="text-lg font-semibold text-[#E8E2D6]">Calculation method</h2>
        <p className="text-xs text-[#7B89A1] mt-1">
          Different regions use different angles to determine Fajr and Isha.
          Pick the method common in your area.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-[#7B89A1]" htmlFor="onb-method">Method</label>
          <select
            id="onb-method"
            value={method}
            onChange={(e) => setMethod(e.target.value as CalculationMethodName)}
            className="w-full text-sm bg-[rgba(15,23,42,0.85)] text-[#E8E2D6] border border-[rgba(200,168,78,0.10)] rounded px-3 py-2
              focus:outline-none focus:ring-1 focus:ring-[#C8A84E]"
          >
            {Object.entries(CALCULATION_METHODS).map(([key, info]) => (
              <option key={key} value={key}>
                {info.displayName} - {info.region}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[#4A5568]">
            {CALCULATION_METHODS[method].angles}
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[#7B89A1]">Madhab (affects Asr time)</label>
          <div className="flex gap-2">
            <MadhabButton
              label="Shafi"
              hint="Standard shadow"
              active={madhab === 'Shafi'}
              onClick={() => setMadhab('Shafi')}
            />
            <MadhabButton
              label="Hanafi"
              hint="Double shadow"
              active={madhab === 'Hanafi'}
              onClick={() => setMadhab('Hanafi')}
            />
          </div>
        </div>

        {isHighLatitude && (
          <div className="p-3 rounded-lg bg-[rgba(200,168,78,0.08)] border border-[rgba(200,168,78,0.15)]">
            <p className="text-xs text-[#C8A84E] mb-2">
              Your location is above 48° latitude. Fajr and Isha may need adjustment in summer.
            </p>
            <select
              value={highLatRule}
              onChange={(e) => setHighLatRule(e.target.value as HighLatitudeRuleName)}
              className="w-full text-xs bg-[rgba(15,23,42,0.85)] text-[#E8E2D6] border border-[rgba(200,168,78,0.10)] rounded px-2 py-1.5
                focus:outline-none focus:ring-1 focus:ring-[#C8A84E]"
              aria-label="High latitude rule"
            >
              <option value="MiddleOfTheNight">Middle of the night</option>
              <option value="SeventhOfTheNight">Seventh of the night</option>
              <option value="TwilightAngle">Twilight angle</option>
            </select>
          </div>
        )}
      </div>

      <ContinueButton onClick={onContinue} />
    </div>
  );
}

function MadhabButton({ label, hint, active, onClick }: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded text-center transition-colors
        focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
        ${active
          ? 'bg-[rgba(200,168,78,0.15)] border border-[#C8A84E] text-[#C8A84E]'
          : 'bg-[rgba(15,23,42,0.85)] border border-[rgba(200,168,78,0.10)] text-[#7B89A1] hover:text-[#E8E2D6]'
        }`}
      aria-pressed={active}
    >
      <span className="text-sm font-medium block">{label}</span>
      <span className="text-[10px] block mt-0.5 opacity-60">{hint}</span>
    </button>
  );
}

// --- Step 3: Widget Placement ---

function PlacementStep({
  dockEdge,
  setDockEdge,
  onContinue,
}: {
  dockEdge: DockEdge;
  setDockEdge: (v: DockEdge) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-[#7B89A1] mb-1">Step 3 of 3</p>
        <h2 className="text-lg font-semibold text-[#E8E2D6]">Widget placement</h2>
        <p className="text-xs text-[#7B89A1] mt-1">
          Pick a screen edge. You can drag the widget to a different edge anytime.
        </p>
      </div>

      {/* Monitor visual with edge selectors */}
      <div className="flex justify-center py-4">
        <div className="relative w-56 h-40">
          {/* Monitor outline */}
          <div className="absolute inset-6 rounded-lg border border-[rgba(200,168,78,0.10)] bg-[rgba(15,23,42,0.85)]" />

          {/* Top */}
          <EdgeButton
            edge="top"
            active={dockEdge === 'top'}
            onClick={() => setDockEdge('top')}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-24"
          />
          {/* Bottom */}
          <EdgeButton
            edge="bottom"
            active={dockEdge === 'bottom'}
            onClick={() => setDockEdge('bottom')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24"
          />
          {/* Left */}
          <EdgeButton
            edge="left"
            active={dockEdge === 'left'}
            onClick={() => setDockEdge('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10"
          />
          {/* Right */}
          <EdgeButton
            edge="right"
            active={dockEdge === 'right'}
            onClick={() => setDockEdge('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10"
          />
          {/* Floating (center) */}
          <button
            onClick={() => setDockEdge('floating')}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-16 h-10 rounded text-[10px] font-medium transition-colors
              focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
              ${dockEdge === 'floating'
                ? 'bg-[rgba(200,168,78,0.15)] border border-[#C8A84E] text-[#C8A84E]'
                : 'bg-[rgba(15,23,42,0.6)] border border-[rgba(200,168,78,0.10)] text-[#7B89A1] hover:text-[#E8E2D6]'
              }`}
            aria-label="Floating placement"
            aria-pressed={dockEdge === 'floating'}
          >
            Float
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#7B89A1]">
        {dockEdge === 'top' || dockEdge === 'bottom'
          ? 'Horizontal bar along the edge'
          : dockEdge === 'left' || dockEdge === 'right'
            ? 'Vertical sidebar on the edge'
            : 'Compact floating window'}
      </p>

      <FinishButton onClick={onContinue} />
    </div>
  );
}

function EdgeButton({
  edge,
  active,
  onClick,
  className,
}: {
  edge: DockEdge;
  active: boolean;
  onClick: () => void;
  className: string;
}) {
  const isHorizontal = edge === 'top' || edge === 'bottom';
  const label = edge.charAt(0).toUpperCase() + edge.slice(1);

  return (
    <button
      onClick={onClick}
      className={`${className} ${isHorizontal ? 'h-6' : 'h-16'}
        rounded text-[10px] font-medium transition-colors
        focus:outline-none focus:ring-1 focus:ring-[#C8A84E]
        ${active
          ? 'bg-[rgba(200,168,78,0.15)] border border-[#C8A84E] text-[#C8A84E]'
          : 'bg-[rgba(15,23,42,0.6)] border border-[rgba(200,168,78,0.10)] text-[#7B89A1] hover:text-[#E8E2D6]'
        }`}
      aria-label={`${label} edge placement`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// --- Shared buttons ---

function ContinueButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-6 py-2 rounded-lg text-sm font-medium
          bg-[#C8A84E] text-[#0B1120] hover:bg-[#D4B85A] disabled:opacity-40
          focus:outline-none focus:ring-2 focus:ring-[#C8A84E] focus:ring-offset-2 focus:ring-offset-[rgba(26,38,66,0.95)]
          transition-colors"
        aria-label="Continue to next step"
      >
        Continue
      </button>
    </div>
  );
}

function FinishButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        className="px-6 py-2 rounded-lg text-sm font-medium
          bg-[#C8A84E] text-[#0B1120] hover:bg-[#D4B85A]
          focus:outline-none focus:ring-2 focus:ring-[#C8A84E] focus:ring-offset-2 focus:ring-offset-[rgba(26,38,66,0.95)]
          transition-colors"
        aria-label="Finish setup"
      >
        Finish
      </button>
    </div>
  );
}
