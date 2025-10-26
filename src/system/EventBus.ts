type Handler = (payload?: any) => void | Promise<void>;

class EventBus {
  private handlers: Map<string, Handler[]> = new Map();

  on(event: string, h: Handler) {
    const arr = this.handlers.get(event) || [];
    arr.push(h);
    this.handlers.set(event, arr);
    return () => this.off(event, h);
  }

  off(event: string, h: Handler) {
    const arr = this.handlers.get(event) || [];
    this.handlers.set(event, arr.filter(x => x !== h));
  }

  emit(event: string, payload?: any) {
    const arr = this.handlers.get(event) || [];
    for (const h of arr) {
      try { h(payload); } catch (e) { /* swallow for now */ }
    }
  }

  async emitAsync(event: string, payload?: any) {
    const arr = this.handlers.get(event) || [];
    await Promise.allSettled(arr.map(h => h(payload)));
  }
}

export default new EventBus();
