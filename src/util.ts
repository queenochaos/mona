export const ColorFromHex = (color: string | number[]): number => {
    if (!color) return Math.floor(Math.random() * (0xffffff + 1));
    let newColor = 0;
    if (typeof color === "string") {
      newColor = parseInt(color.replace("#", ""), 16);
    } else if (Array.isArray(color)) {
      newColor = (color[0] << 16) + (color[1] << 8) + color[2];
    }
  
    if (newColor < 0 || newColor > 0xffffff) throw new RangeError("COLOR_RANGE");
    else if (Number.isNaN(newColor)) throw new TypeError("COLOR_CONVERT");
  
    return newColor;
  };


/**
 * @class BetterMap
 */
export class BetterMap<K, V> extends Map<K, V> {
    name: string;
    /**
     * Create a new BetterMap
     * @param {string} name - A friendly name for the BetterMap
     */
    constructor(name: string) {
      super();
      this.name = name;
    }
    /**
     * Convert the map into an array of values
     * @returns Array of items in the map
     */
    array() {
      return this.map((x) => x);
    }
    /**
     * Array#every but for a Map
     * @param fn - Function to run on every element.
     * @returns {boolean} True or false
     */
    every(fn: (v: V, k: K) => boolean): boolean {
      for (const [k, v] of this.entries()) {
        if (!fn(v, k)) {
          return false;
        }
      }
      return true;
    }
    filter(fn: (v: V, k: K) => boolean): BetterMap<K, V> {
      const newColl = new BetterMap<K, V>(this.name);
      for (const [key, val] of this.entries()) {
        if (fn(val, key)) {
          newColl.set(key, val);
        }
      }
      return newColl;
    }
    find(fn: (v: V, k: K) => boolean): V | undefined {
      for (const [k, v] of this.entries()) {
        if (fn(v, k)) {
          return v;
        }
      }
      return undefined;
    }
    first(): V | undefined {
      return this.values().next().value;
    }
    map<T>(fn: (v: V, k: K) => T): T[] | [] {
      const arr = [];
      for (const [k, v] of this.entries()) {
        arr.push(fn(v, k));
      }
      return arr;
    }
    random(): V | undefined {
      const max = Math.floor(Math.random() * this.size);
      const iter = this.values();
      for (let i = 0; i < max; ++i) {
        iter.next();
      }
      return iter.next().value;
    }
    reduce<T>(fn: (acc: T, val: V) => T, first: T): T {
      const iter = this.values();
      let val;
      let result = first === undefined ? iter.next().value : first;
      while ((val = iter.next().value) !== undefined) {
        result = fn(result, val);
      }
      return result;
    }
    some(fn: (val: V, key: K) => boolean): boolean {
      for (const [k, v] of this.entries()) {
        if (fn(v, k)) {
          return true;
        }
      }
      return false;
    }
    sort(fn: (v1: V, v2: V, k1: K, k2: K) => number = () => 0): BetterMap<K, V> {
      const items = [...this.entries()];
      items.sort((a, b) => fn(a[1], b[1], a[0], b[0]));
      const newColl = new BetterMap<K, V>(this.name);
      for (const [k, v] of items) {
        newColl.set(k, v);
      }
      return newColl;
    }
    toString(): string {
      return `[BetterMap of <${this.name}>]`;
    }
    json(): Record<string, unknown> {
      const json = {};
      for (const item of this.entries()) {
        Object.defineProperty(json, `${item[0]}`, { value: item[1], writable: true });
      }
      return json;
    }
    toJSON(): Record<string, unknown> {
      return this.json()
    }
  }
  
  