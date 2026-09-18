import { ResearchStatus } from '../enums/research-status.enum';
import { STAGE_PROGRESS } from '../constants';

describe('Research Status Transitions', () => {
  it('should have all required statuses', () => {
    const required = [
      'queued',
      'planning',
      'searching',
      'collecting',
      'processing',
      'indexing',
      'analyzing',
      'comparing',
      'generating_report',
      'completed',
      'failed',
    ];
    for (const status of required) {
      expect(Object.values(ResearchStatus)).toContain(status);
    }
  });

  it('should have increasing progress values for stages', () => {
    expect(STAGE_PROGRESS.queued).toBe(0);
    expect(STAGE_PROGRESS.planning).toBeGreaterThan(STAGE_PROGRESS.queued);
    expect(STAGE_PROGRESS.searching).toBeGreaterThan(STAGE_PROGRESS.planning);
    expect(STAGE_PROGRESS.collecting).toBeGreaterThan(STAGE_PROGRESS.searching);
    expect(STAGE_PROGRESS.processing).toBeGreaterThan(STAGE_PROGRESS.collecting);
    expect(STAGE_PROGRESS.indexing).toBeGreaterThan(STAGE_PROGRESS.processing);
    expect(STAGE_PROGRESS.analyzing).toBeGreaterThan(STAGE_PROGRESS.indexing);
    expect(STAGE_PROGRESS.comparing).toBeGreaterThan(STAGE_PROGRESS.analyzing);
    expect(STAGE_PROGRESS.generating_report).toBeGreaterThan(STAGE_PROGRESS.comparing);
    expect(STAGE_PROGRESS.completed).toBe(100);
  });

  it('should have failed status outside the progress map', () => {
    expect(STAGE_PROGRESS.failed).toBeUndefined();
  });
});
