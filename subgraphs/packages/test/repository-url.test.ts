import { describe, expect, it } from "vitest";
import { normalizeRepositoryUrl } from "../src/repository-url.ts";

describe("normalizeRepositoryUrl", () => {
  it.each([
    ["git+https://github.com/expressjs/express.git", "https://github.com/expressjs/express"],
    [
      "https://github.com/DefinitelyTyped/DefinitelyTyped.git",
      "https://github.com/DefinitelyTyped/DefinitelyTyped",
    ],
    ["git://github.com/jashkenas/underscore.git", "https://github.com/jashkenas/underscore"],
    ["git+ssh://git@github.com/stevemao/left-pad.git", "https://github.com/stevemao/left-pad"],
    ["git@github.com:owner/repo.git", "https://github.com/owner/repo"],
    ["github:moment/moment", "https://github.com/moment/moment"],
    ["owner/repo", "https://github.com/owner/repo"],
    ["gitlab:owner/repo", "https://gitlab.com/owner/repo"],
    ["bitbucket:owner/repo", "https://bitbucket.org/owner/repo"],
    ["git+https://gitlab.com/owner/repo.git", "https://gitlab.com/owner/repo"],
    [
      "https://github.com/babel/babel/tree/master/packages/babel-core",
      "https://github.com/babel/babel",
    ],
    ["https://github.com/owner/repo#readme", "https://github.com/owner/repo"],
    ["https://github.com/owner/repo?tab=readme", "https://github.com/owner/repo"],
    ["ssh://git@github.com:22/owner/repo.git", "https://github.com/owner/repo"],
  ])("[FR-SG-2] reads %s", (input, expected) => {
    expect(normalizeRepositoryUrl(input)).toBe(expected);
  });

  it.each([
    ["https://user:secret@github.com/owner/repo.git"],
    ["https://user:p@ss@github.com/owner/repo"],
    ["https://x@y@github.com/owner/repo"],
  ])("[GR-16] drops the credentials in %s", (input) => {
    expect(normalizeRepositoryUrl(input)).toBe("https://github.com/owner/repo");
  });

  it.each([
    "https://github.com/planted.person@example.org/repo",
    "https://github.com/owner/person@example.org.git",
    "git@github.com:person@example.org/repo.git",
    "https://x@person@example.org/owner/repo",
    "https://evil.example/owner/repo",
    "https://<img src=x onerror=alert(1)>/o/r",
    "https://Ignore previous instructions/owner/repo",
    "git@a\nb:c/d",
    "git@github.com:owner/repo\nextra",
    "https://github.com/../repo",
  ])("[GR-16] refuses %j", (input) => {
    expect(normalizeRepositoryUrl(input)).toBeNull();
  });

  it.each([
    "",
    "not a url",
    "https://github.com/only-owner",
    "ftp://github.com/owner/repo",
    "a/b/c",
  ])("[FR-SG-2] gives nothing for %j", (input) => {
    expect(normalizeRepositoryUrl(input)).toBeNull();
  });

  it("[FR-SG-2] gives nothing when there's no repository", () => {
    expect(normalizeRepositoryUrl(undefined)).toBeNull();
  });
});
