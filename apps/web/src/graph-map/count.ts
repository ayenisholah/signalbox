export const count = (amount: number, singular: string, plural: string): string =>
  `${amount} ${amount === 1 ? singular : plural}`;
