import EventBus from "../system/EventBus";

export type TickOptions = { deltaMs?: number };

class WorldTicker {
  private running = false;

  async tick(opts?: TickOptions) {
    // emit a synchronous pre-tick event
    EventBus.emit('preTick', opts);
    // future: run async systems
    await EventBus.emitAsync('tick', opts);
    EventBus.emit('postTick', opts);
  }

  async runOnce(opts?: TickOptions) {
    return this.tick(opts);
  }
}

export const WorldTick = new WorldTicker();
