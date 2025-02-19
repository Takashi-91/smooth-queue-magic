import { getUTMParams, UTMParams } from './utm';

declare global {
  interface Window {
    mixpanel: any;
  }
}

export const mixpanel = {
  track: (event_name: string, properties?: any) => {
    if (window.mixpanel) {
      const utmParams = getUTMParams();
      const enrichedProperties = {
        ...properties,
        ...utmParams,
        timestamp: new Date().toISOString(),
      };
      window.mixpanel.track(event_name, enrichedProperties);
    }
  },
  identify: (id: string) => {
    if (window.mixpanel) {
      window.mixpanel.identify(id);
    }
  }
}; 