/// <reference lib="webworker" />
/**
 * Sim worker entry (ADR-2): wires `SimServer` to postMessage, a timer and, at 'max', a message to
 * itself. Messages are handled one at a time in arrival order; the scheduler runs while unpaused.
 */
import type { FromWorker, ToWorker } from '../shared/protocol';
import { SimServer } from './server';

declare const self: DedicatedWorkerGlobalScope;

/** Timer period while running at a fixed speed (ms). */
const PUMP_MS = 4;

const now = (): number => performance.now();
const server = new SimServer((msg: FromWorker, transfer: Transferable[]) => self.postMessage(msg, transfer));

let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * At 'max' the next slice of ticks comes by a message the worker posts itself (ROADMAP R226, ADR-1157),
 * not by a timer of 0 ms: a browser holds a timer set from a timer 4 ms or more once five are nested,
 * a third of a 12 ms slice (the page ran 290 to 363 ticks a second where the sim alone does 400 to 540).
 * The message is a task as the page's own messages are: what the page sent during a slice (a pause, a
 * command, an ack, a subscription) was queued before it and is handled first, as with the timer.
 */
const next = new MessageChannel();
let posted = false;
next.port1.onmessage = () => {
  posted = false;
  turn();
};

/** One turn of the scheduler, and the next one asked for. */
function turn(): void {
  server.pump(now(), now);
  schedule();
}

function schedule(): void {
  if (timer !== null || posted || !server.running) return;
  if (server.speed === 'max' && server.ticking) {
    posted = true;
    next.port2.postMessage(0);
    return;
  }
  // At a fixed speed, and while only derived messages are owed (paused): paced.
  timer = setTimeout(() => {
    timer = null;
    turn();
  }, PUMP_MS);
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
  server.handle(e.data, now());
  schedule();
};
