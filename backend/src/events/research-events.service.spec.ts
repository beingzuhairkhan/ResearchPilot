import { ResearchEventsService } from './research-events.service';
import { ResearchProgressEvent } from '../common/interfaces/research.interface';

describe('ResearchEventsService', () => {
  let service: ResearchEventsService;

  beforeEach(() => {
    service = new ResearchEventsService();
  });

  it('should publish and retrieve recent events', () => {
    service.publish('res1', 'research.created', 0, 'Created');
    service.publish('res1', 'research.planning', 5, 'Planning');
    const events = service.getRecentEvents('res1');
    expect(events.length).toBe(2);
    expect(events[0].event).toBe('research.created');
    expect(events[1].event).toBe('research.planning');
  });

  it('should deliver events to subscribers', (done) => {
    const callback = (event: ResearchProgressEvent) => {
      expect(event.event).toBe('research.completed');
      expect(event.progress).toBe(100);
      done();
    };
    service.subscribe('res2', callback);
    service.publish('res2', 'research.completed', 100, 'Done');
  });

  it('should unsubscribe correctly', () => {
    let received: ResearchProgressEvent | null = null;
    const unsubscribe = service.subscribe('res3', (event) => {
      received = event;
    });
    unsubscribe();
    service.publish('res3', 'research.created', 0, 'Created');
    expect(received).toBeNull();
  });

  it('should clear events', () => {
    service.publish('res4', 'research.created', 0, 'Created');
    service.clearEvents('res4');
    expect(service.getRecentEvents('res4').length).toBe(0);
  });

  it('should cap recent events at max', () => {
    for (let i = 0; i < 150; i++) {
      service.publish('res5', 'research.created', 0, `Event ${i}`);
    }
    const events = service.getRecentEvents('res5');
    expect(events.length).toBeLessThanOrEqual(100);
  });
});
