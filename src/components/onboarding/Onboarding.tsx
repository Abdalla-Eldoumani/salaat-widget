import { useState } from 'react';
import type {
  CalculationMethodName,
  DockEdge,
  HighLatitudeRuleName,
  LocationResult,
  MadhabName,
  SalaatSettings,
  UpdateSetting,
} from '../../types';
import { COUNTRY_TO_METHOD } from '../../lib/constants';
import { CITIES } from '../../lib/cities';
import { formatLocationName } from '../../lib/location';
import { cityLabel } from '../ui/CityPicker';
import LocationStep from './LocationStep';
import MethodStep from './MethodStep';
import PlacementStep from './PlacementStep';
import StepFrame from './StepFrame';

interface OnboardingProps {
  settings: SalaatSettings;
  onUpdate: UpdateSetting;
  geoLocation: LocationResult | null;
  geoDetecting: boolean;
  geoError: string | null;
  onGeoDetect: () => Promise<void>;
}

const STEP_COUNT = 3;
const HIGH_LATITUDE = 48;

export default function Onboarding({ settings, onUpdate, geoLocation, geoDetecting, geoError, onGeoDetect }: OnboardingProps) {
  // A step number of 3 means the last write of a finished setup was lost; show the last step.
  const [step, setStep] = useState(Math.min(settings.onboardingStep, STEP_COUNT - 1));

  const [manual, setManual] = useState(false);
  // Empty until the user picks, so a default never gets saved as if it were a choice.
  const [city, setCity] = useState(CITIES.some((c) => cityLabel(c) === settings.locationName) ? settings.locationName : '');

  const chosenCity = CITIES.find((c) => cityLabel(c) === city);
  const country = manual ? chosenCity?.countryCode : geoLocation?.countryCode;

  // The country suggests a method until the user picks one.
  const [pickedMethod, setPickedMethod] = useState<CalculationMethodName | null>(null);
  const suggestedMethod = country ? COUNTRY_TO_METHOD[country] : undefined;
  const method = pickedMethod ?? suggestedMethod ?? settings.calculationMethod;
  const [madhab, setMadhab] = useState<MadhabName>(settings.madhab);
  const [highLatitudeRule, setHighLatitudeRule] = useState<HighLatitudeRuleName>(settings.highLatitudeRule);

  const [dockEdge, setDockEdge] = useState<DockEdge>(settings.dockEdge);

  const latitude = manual ? (chosenCity?.lat ?? settings.latitude) : (geoLocation?.latitude ?? settings.latitude);

  async function goTo(next: number) {
    await onUpdate('onboardingStep', next);
    setStep(next);
  }

  async function saveLocation() {
    if (manual) {
      if (!chosenCity) return;
      await onUpdate('latitude', chosenCity.lat);
      await onUpdate('longitude', chosenCity.lon);
      await onUpdate('locationName', cityLabel(chosenCity));
      await onUpdate('autoDetectLocation', false);
    } else {
      if (!geoLocation) return;
      await onUpdate('latitude', geoLocation.latitude);
      await onUpdate('longitude', geoLocation.longitude);
      await onUpdate('locationName', formatLocationName(geoLocation));
      await onUpdate('autoDetectLocation', true);
    }
    await goTo(1);
  }

  async function saveMethod() {
    await onUpdate('calculationMethod', method);
    await onUpdate('madhab', madhab);
    await onUpdate('highLatitudeRule', highLatitudeRule);
    await goTo(2);
  }

  async function finish() {
    await onUpdate('dockEdge', dockEdge);
    await onUpdate('onboardingStep', STEP_COUNT);
    await onUpdate('onboardingComplete', true);
  }

  if (step === 0) {
    return (
      <StepFrame
        key={0}
        step={1}
        total={STEP_COUNT}
        title="Where are you?"
        intro="The sun's position at your location fixes every prayer time."
        onContinue={saveLocation}
        continueDisabled={manual ? !chosenCity : !geoLocation}
      >
        <LocationStep
          geoLocation={geoLocation}
          geoDetecting={geoDetecting}
          geoError={geoError}
          onGeoDetect={onGeoDetect}
          manual={manual}
          setManual={setManual}
          city={city}
          setCity={setCity}
        />
      </StepFrame>
    );
  }

  if (step === 1) {
    return (
      <StepFrame
        key={1}
        step={2}
        total={STEP_COUNT}
        title="Calculation method"
        intro="Regions use different twilight angles for Fajr and Isha. Pick the one common where you live."
        onBack={() => goTo(0)}
        onContinue={saveMethod}
      >
        <MethodStep
          method={method}
          setMethod={setPickedMethod}
          madhab={madhab}
          setMadhab={setMadhab}
          highLatitudeRule={highLatitudeRule}
          setHighLatitudeRule={setHighLatitudeRule}
          isHighLatitude={Math.abs(latitude) > HIGH_LATITUDE}
        />
      </StepFrame>
    );
  }

  return (
    <StepFrame
      key={2}
      step={3}
      total={STEP_COUNT}
      title="Widget placement"
      intro="Pick a screen edge. Drag the widget to another edge at any time."
      onBack={() => goTo(1)}
      onContinue={finish}
      continueLabel="Finish"
    >
      <PlacementStep dockEdge={dockEdge} setDockEdge={setDockEdge} />
    </StepFrame>
  );
}
