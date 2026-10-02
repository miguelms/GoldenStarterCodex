#!/usr/bin/env python3
"""Validate the standalone GoldenStarterCodex governance repository."""

from __future__ import annotations

import re
import tomllib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)
    print(f"ERROR: {message}")


def validate_agents() -> int:
    directory = ROOT / ".codex" / "agents"
    registry_path = ROOT / "docs" / "agent-registry.md"
    registry = registry_path.read_text(encoding="utf-8")
    files = sorted(directory.glob("*.toml"))
    if not files:
        fail("No Codex agent profiles found.")
        return 0
    names: set[str] = set()
    required = {"name", "description", "sandbox_mode", "developer_instructions"}
    for path in files:
        try:
            profile = tomllib.loads(path.read_text(encoding="utf-8"))
        except (tomllib.TOMLDecodeError, OSError) as error:
            fail(f"{path.relative_to(ROOT)} is not valid TOML: {error}")
            continue
        missing = required - profile.keys()
        if missing:
            fail(f"{path.relative_to(ROOT)} is missing: {', '.join(sorted(missing))}")
            continue
        name = profile["name"]
        if not isinstance(name, str) or not re.fullmatch(r"[a-z][a-z0-9_]*", name):
            fail(f"{path.relative_to(ROOT)} has an invalid profile name")
            continue
        if path.name != name.replace("_", "-") + ".toml":
            fail(f"{path.relative_to(ROOT)} does not match profile name {name}")
        if name == "orchestrator":
            fail("The main Codex conversation owns orchestration")
        if name in names:
            fail(f"Duplicate agent profile: {name}")
        names.add(name)
        if f"`{name}`" not in registry:
            fail(f"Profile {name} is absent from docs/agent-registry.md")
    return len(names)


def validate_skills() -> int:
    directory = ROOT / ".agents" / "skills"
    registry = (ROOT / "docs" / "agent-registry.md").read_text(encoding="utf-8")
    skills = sorted(path for path in directory.iterdir() if path.is_dir())
    if not skills:
        fail("No Agent Skills found")
        return 0
    for path in skills:
        skill = path / "SKILL.md"
        if not skill.is_file():
            fail(f"{skill.relative_to(ROOT)} is missing")
            continue
        content = skill.read_text(encoding="utf-8")
        match = re.search(r"^name:\s*([a-z0-9-]+)\s*$", content, re.MULTILINE)
        if not match or match.group(1) != path.name:
            fail(f"{skill.relative_to(ROOT)} has invalid frontmatter name")
        elif f"`{path.name}`" not in registry:
            fail(f"Skill {path.name} is absent from docs/agent-registry.md")
    return len(skills)


def validate_boundaries() -> None:
    forbidden = ["package.json", "src", "apps", "backend-ai", "drizzle", "node_modules"]
    for entry in forbidden:
        if (ROOT / entry).exists():
            fail(f"Technical stack path must stay in GoldenStarterWebIA: {entry}")
    for required in ["AGENTS.md", "SDD", ".codex/agents", ".agents/skills", "specs"]:
        if not (ROOT / required).exists():
            fail(f"Governance path is missing: {required}")


def main() -> int:
    agents = validate_agents()
    skills = validate_skills()
    validate_boundaries()
    if errors:
        return 1
    print(f"Validated {agents} Codex profiles and {skills} governance skills.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
