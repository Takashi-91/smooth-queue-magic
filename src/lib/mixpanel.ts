declare global {
  interface Window {
    mixpanel: any;
  }
}

export const mixpanel = {
  track: (event_name: string, properties?: any) => {
    if (window.mixpanel) {
      window.mixpanel.track(event_name, properties);
    }
  },
  identify: (id: string) => {
    if (window.mixpanel) {
      window.mixpanel.identify(id);
    }
  }
}; 