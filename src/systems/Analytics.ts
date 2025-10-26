class AnalyticsClass {
  private events: any[] = [];
  record(eventName: string, payload?: any) {
    this.events.push({ eventName, payload, ts: Date.now() });
  }
  getEvents() { return [...this.events]; }
  clear() { this.events = []; }
}

export default new AnalyticsClass();
