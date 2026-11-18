import { describe, it, expect } from 'vitest';
import { formatMilestoneDate, extractYear } from '../data/timelineLoader';
import { formatRelationshipSentence } from '../data/graphConfig';

describe('Timeline Loader utilities', () => {
  it('formats dates according to date_precision', () => {
    expect(formatMilestoneDate('1950-10', 'month')).toBe('October 1950');
    expect(formatMilestoneDate('1986-10-09', 'day')).toBe('October 9, 1986');
    expect(formatMilestoneDate('1956', 'year')).toBe('1956');
    expect(formatMilestoneDate('1970', 'decade')).toBe('1970s');
    expect(formatMilestoneDate('1943', 'unknown')).toBe('1943 (circa)');
    expect(formatMilestoneDate('', 'year')).toBe('Date Unknown');
  });

  it('extracts integer calendar years correctly', () => {
    expect(extractYear('1950-10')).toBe(1950);
    expect(extractYear('2017-06-12')).toBe(2017);
    expect(extractYear('2020')).toBe(2020);
    expect(extractYear('')).toBe(1950);
  });
});

describe('Graph relationship sentence helper', () => {
  it('constructs correct directed relationship sentences', () => {
    expect(formatRelationshipSentence('BERT', 'extends', 'Transformer')).toBe(
      'BERT extends Transformer'
    );
    expect(formatRelationshipSentence('CNN', 'uses', 'Backpropagation')).toBe(
      'CNN uses Backpropagation'
    );
    expect(formatRelationshipSentence('AI Agenda', 'introduced', 'Perceptron')).toBe(
      'AI Agenda introduced Perceptron'
    );
    expect(formatRelationshipSentence('Perceptron', 'influenced', 'Backpropagation')).toBe(
      'Perceptron influenced Backpropagation'
    );
  });
});
