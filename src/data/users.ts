// Sauce Demo publishes these accounts on its login page; they are test data, not secrets.
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: process.env.SAUCE_USERNAME ?? 'standard_user', password },
  lockedOut: { username: 'locked_out_user', password },
  problem: { username: 'problem_user', password },
  performanceGlitch: { username: 'performance_glitch_user', password },
} as const;

export type User = (typeof users)[keyof typeof users];
