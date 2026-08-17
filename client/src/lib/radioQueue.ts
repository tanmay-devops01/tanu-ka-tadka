/**
 * Persistent no-repeat queue for Tanu Ka Tadka's batched public-source catalogue.
 * Stores only indices and queue position in localStorage; track metadata stays lazy-loaded by batch.
 */
const STORAGE_KEY = "tanu-ka-tadka-radio-cycle-v1";

type StoredCycle = {
  order: number[];
  cursor: number;
  history: number[];
  unavailable: number[];
};

function shuffledRange(total: number, excluded: Set<number>) {
  const result = Array.from({ length: total }, (_, index) => index).filter((index) => !excluded.has(index));
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export class PersistentRadioQueue {
  private readonly total: number;
  private state: StoredCycle;

  constructor(total: number) {
    this.total = total;
    this.state = this.restore();
  }

  private restore(): StoredCycle {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as StoredCycle | null;
      const validOrder = parsed?.order?.length === this.total && parsed.order.every((index) => Number.isInteger(index) && index >= 0 && index < this.total);
      if (validOrder && parsed) return parsed;
    } catch {
      // A fresh cycle is safer than failing playback because of stale local browser data.
    }
    return { order: shuffledRange(this.total, new Set()), cursor: 0, history: [], unavailable: [] };
  }

  private persist() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Playback still works when a private browser or storage policy blocks persistence.
    }
  }

  private cycleAgain() {
    const unavailable = new Set(this.state.unavailable);
    this.state.order = shuffledRange(this.total, unavailable);
    this.state.cursor = 0;
    this.state.history = [];
  }

  next() {
    if (this.state.cursor >= this.state.order.length) this.cycleAgain();
    const nextIndex = this.state.order[this.state.cursor];
    this.state.cursor += 1;
    this.state.history.push(nextIndex);
    this.persist();
    return nextIndex;
  }

  previous() {
    if (this.state.history.length < 2) return this.state.history[0] ?? this.next();
    this.state.history.pop();
    const previousIndex = this.state.history[this.state.history.length - 1];
    this.persist();
    return previousIndex;
  }

  markUnavailable(index: number) {
    if (!this.state.unavailable.includes(index)) this.state.unavailable.push(index);
    this.state.order = this.state.order.filter((entry) => entry !== index);
    this.persist();
  }

  nextMatching(predicate: (index: number) => boolean) {
    if (this.state.cursor >= this.state.order.length) this.cycleAgain();
    for (let position = this.state.cursor; position < this.state.order.length; position += 1) {
      const candidate = this.state.order[position];
      if (!predicate(candidate)) continue;
      [this.state.order[this.state.cursor], this.state.order[position]] = [
        this.state.order[position],
        this.state.order[this.state.cursor],
      ];
      return this.next();
    }
    this.persist();
    return null;
  }

  get progress() {
    return { played: this.state.cursor, remaining: Math.max(this.state.order.length - this.state.cursor, 0) };
  }
}
