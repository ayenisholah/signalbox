import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only cleans up by itself when test globals are on, and this repo keeps them off.
afterEach(cleanup);

// jsdom has no layout, so it leaves this out.
Element.prototype.scrollIntoView = () => undefined;
