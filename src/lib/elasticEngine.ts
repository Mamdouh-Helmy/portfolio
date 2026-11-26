/**
 * Rubber-band physics for draggable nodes joined by elastic cords.
 *
 * - Every node is tied to its resting spot by a weak spring, so it always returns home.
 * - A cord only pulls when stretched past its resting length; a slack cord just sags.
 * - Dragging one node therefore drags its partner along, and everything snaps back on release.
 *
 * The engine touches the DOM directly (transform + SVG attributes) so a drag never triggers a React render.
 */

export type Vec = { x: number; y: number };

export interface CordSpec {
  from: string;
  to: string;
  /** Signed resting curvature, as a fraction of the cord's length. */
  bow?: number;
}

export interface CordBinding {
  spec: CordSpec;
  /** `<g>` holding one `<path>` and two `<circle>` pins. */
  group: SVGGElement;
}

export interface PointerLike {
  clientX: number;
  clientY: number;
}

interface NodeOptions {
  /** Attachment point as a fraction of the node box, in logical (start→end) x. */
  anchor: Vec;
  draggable: boolean;
}

interface Body extends NodeOptions {
  el: HTMLElement;
  pos: Vec;
  vel: Vec;
  /** Offset that the DOM transform currently reflects. */
  applied: Vec;
  dragging: boolean;
  grab: { pointer: Vec; pos: Vec };
}

interface CordView {
  spec: CordSpec;
  path: SVGPathElement;
  pins: [SVGCircleElement, SVGCircleElement];
}

interface Probe {
  /** Anchor position (board coordinates) when the node sits at rest. */
  rest: Vec;
  /** The node's box in viewport coordinates, as measured this frame. */
  box: DOMRect;
  visible: boolean;
}

const HOME_STIFFNESS = 60;
const CORD_STIFFNESS = 140;
const DAMPING = 7;
const MAX_FRAME = 1 / 30;
const SETTLE_DISTANCE = 0.1;
const SETTLE_SPEED = 2;
const WIDTH = { max: 3, min: 1.2 };
const PIN_RADIUS = 4;
const SLACK_SAG = 0.6;

const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k });
const length = (a: Vec) => Math.hypot(a.x, a.y);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class ElasticEngine {
  rtl = false;

  private board: HTMLElement | null = null;
  private bodies = new Map<string, Body>();
  private cords: CordView[] = [];
  private frame = 0;
  private lastTime = 0;
  private reduceMotion = false;

  /** Starts observing the board. Returns a cleanup function. */
  attach(board: HTMLElement): () => void {
    this.board = board;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new ResizeObserver(() => this.wake());
    observer.observe(board);
    void document.fonts?.ready.then(() => this.wake());
    this.wake();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.board = null;
    };
  }

  register(id: string, el: HTMLElement, options: NodeOptions): () => void {
    this.bodies.set(id, {
      ...options,
      el,
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      applied: { x: 0, y: 0 },
      dragging: false,
      grab: { pointer: { x: 0, y: 0 }, pos: { x: 0, y: 0 } },
    });
    this.wake();

    return () => {
      el.style.transform = "";
      this.bodies.delete(id);
      this.wake();
    };
  }

  setCords(bindings: CordBinding[]) {
    this.cords = bindings.flatMap(({ spec, group }) => {
      const path = group.querySelector("path");
      const [pinA, pinB] = Array.from(group.querySelectorAll("circle"));
      return path && pinA && pinB ? [{ spec, path, pins: [pinA, pinB] as CordView["pins"] }] : [];
    });
    this.wake();
  }

  startDrag(id: string, e: PointerLike): boolean {
    const body = this.bodies.get(id);
    if (!body?.draggable || this.reduceMotion) return false;
    body.dragging = true;
    body.vel = { x: 0, y: 0 };
    body.grab = { pointer: { x: e.clientX, y: e.clientY }, pos: body.pos };
    this.wake();
    return true;
  }

  moveDrag(id: string, e: PointerLike) {
    const body = this.bodies.get(id);
    if (!body?.dragging) return;
    body.pos = add(body.grab.pos, sub({ x: e.clientX, y: e.clientY }, body.grab.pointer));
    this.wake();
  }

  endDrag(id: string) {
    const body = this.bodies.get(id);
    if (!body) return;
    body.dragging = false;
    this.wake();
  }

  wake() {
    if (this.frame || !this.board) return;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.frame = 0;
    if (!this.board) return;

    const dt = Math.min((now - this.lastTime) / 1000, MAX_FRAME);
    this.lastTime = now;

    const probes = this.measure(this.board);
    this.integrate(dt, probes);
    this.clampToViewport(probes);
    this.applyTransforms();
    this.cords.forEach((cord) => this.drawCord(cord, probes));

    if (this.isMoving()) this.wake();
  };

  private measure(board: HTMLElement): Map<string, Probe> {
    const origin = board.getBoundingClientRect();
    const probes = new Map<string, Probe>();

    this.bodies.forEach((body, id) => {
      const rect = body.el.getBoundingClientRect();
      const fx = this.rtl ? 1 - body.anchor.x : body.anchor.x;
      const current = {
        x: rect.left - origin.left + rect.width * fx,
        y: rect.top - origin.top + rect.height * body.anchor.y,
      };
      probes.set(id, {
        rest: sub(current, body.applied),
        box: rect,
        visible: body.el.getClientRects().length > 0,
      });
    });

    return probes;
  }

  private ends(cord: CordView, probes: Map<string, Probe>) {
    const a = this.bodies.get(cord.spec.from);
    const b = this.bodies.get(cord.spec.to);
    const pa = probes.get(cord.spec.from);
    const pb = probes.get(cord.spec.to);
    return a && b && pa?.visible && pb?.visible ? { a, b, pa, pb } : null;
  }

  private integrate(dt: number, probes: Map<string, Probe>) {
    const forces = new Map<Body, Vec>();
    this.bodies.forEach((body) => forces.set(body, scale(body.pos, -HOME_STIFFNESS)));

    for (const cord of this.cords) {
      const ends = this.ends(cord, probes);
      if (!ends) continue;
      const { a, b, pa, pb } = ends;

      const restLength = length(sub(pb.rest, pa.rest));
      const delta = sub(add(pb.rest, b.pos), add(pa.rest, a.pos));
      const stretch = length(delta) - restLength;
      if (stretch <= 0) continue;

      const pull = scale(delta, (CORD_STIFFNESS * stretch) / length(delta));
      forces.set(a, add(forces.get(a)!, pull));
      forces.set(b, sub(forces.get(b)!, pull));
    }

    const damping = Math.exp(-DAMPING * dt);
    forces.forEach((force, body) => {
      if (body.dragging) return;
      body.vel = scale(add(body.vel, scale(force, dt)), damping);
      body.pos = add(body.pos, scale(body.vel, dt));

      if (length(body.pos) < SETTLE_DISTANCE && length(body.vel) < SETTLE_SPEED) {
        body.pos = { x: 0, y: 0 };
        body.vel = { x: 0, y: 0 };
      }
    });
  }

  /** Keeps every node horizontally inside the viewport, so dragging near an edge never creates a horizontal scrollbar. */
  private clampToViewport(probes: Map<string, Probe>) {
    const limit = document.documentElement.clientWidth;

    this.bodies.forEach((body, id) => {
      const probe = probes.get(id);
      if (!probe?.visible) return;

      const shift = body.pos.x - body.applied.x;
      const left = probe.box.left + shift;
      const right = probe.box.right + shift;

      const correction = left < 0 ? -left : right > limit ? limit - right : 0;
      if (correction === 0) return;

      body.pos = { x: body.pos.x + correction, y: body.pos.y };
      body.vel = { x: 0, y: body.vel.y };
    });
  }

  private applyTransforms() {
    this.bodies.forEach((body) => {
      body.applied = body.pos;
      const { x, y } = body.pos;
      body.el.style.transform = x === 0 && y === 0 ? "" : `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  private drawCord(cord: CordView, probes: Map<string, Probe>) {
    const ends = this.ends(cord, probes);
    if (!ends) {
      cord.path.setAttribute("d", "");
      cord.pins.forEach((pin) => pin.setAttribute("r", "0"));
      return;
    }

    const { a, b, pa, pb } = ends;
    const start = add(pa.rest, a.pos);
    const end = add(pb.rest, b.pos);
    const restLength = length(sub(pb.rest, pa.rest)) || 1;

    const delta = sub(end, start);
    const span = length(delta) || 1;
    const stretch = Math.max(0, span - restLength);
    const slack = Math.max(0, restLength - span);

    // The curve flattens as the cord gets taut and sags when it goes slack.
    const bow = (cord.spec.bow ?? 0.25) * (this.rtl ? -1 : 1);
    const taut = clamp(1 - stretch / (restLength * 0.5), 0, 1);
    const bend = bow * restLength * taut + Math.sign(bow || 1) * slack * SLACK_SAG;

    const normal = { x: -delta.y / span, y: delta.x / span };
    const control = add(scale(add(start, end), 0.5), scale(normal, bend));

    cord.path.setAttribute("d", `M${start.x} ${start.y}Q${control.x} ${control.y} ${end.x} ${end.y}`);
    cord.path.setAttribute("stroke-width", String(clamp(WIDTH.max / (1 + (stretch / restLength) * 1.5), WIDTH.min, WIDTH.max)));

    [start, end].forEach((point, i) => {
      const pin = cord.pins[i];
      pin.setAttribute("cx", String(point.x));
      pin.setAttribute("cy", String(point.y));
      pin.setAttribute("r", String(PIN_RADIUS));
    });
  }

  private isMoving() {
    return Array.from(this.bodies.values()).some((b) => b.dragging || b.pos.x !== 0 || b.pos.y !== 0);
  }
}