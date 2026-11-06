import axe from "axe-core";
import { expect } from "vitest";

export const expectNoAxeViolations = async (container: Element): Promise<void> => {
  const { violations } = await axe.run(container);

  expect(violations).toEqual([]);
};
