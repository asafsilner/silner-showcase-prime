#!/usr/bin/env python3
"""
Cleanup Manager for NotebookLM Skill
Manages removal of browser state, sessions, and optional library data
Note: .venv is NEVER deleted - it's part of the skill infrastructure
"""

import argparse
import shutil
import sys
from pathlib import Path
from typing import List, Tuple

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import DATA_DIR, BROWSER_STATE_DIR, STATE_FILE, AUTH_INFO_FILE, LIBRARY_FILE


def _format_size(size_bytes: int) -> str:
    """Format bytes as human-readable size"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def _get_size(path: Path) -> int:
    """Get size of file or directory in bytes"""
    if not path.exists():
        return 0
    if path.is_file():
        return path.stat().st_size
    total = 0
    for f in path.rglob('*'):
        if f.is_file():
            try:
                total += f.stat().st_size
            except Exception:
                pass
    return total


class CleanupManager:
    """Manages cleanup of NotebookLM skill data"""

    def __init__(self, preserve_library: bool = False):
        self.preserve_library = preserve_library
        self._targets = self._build_targets()

    def _build_targets(self) -> List[Tuple[str, Path, str]]:
        """Build list of (category, path, description) cleanup targets"""
        targets = [
            ('Browser State', BROWSER_STATE_DIR, 'Browser cookies and session data'),
            ('Auth Info', AUTH_INFO_FILE, 'Authentication metadata'),
        ]

        if not self.preserve_library:
            targets.append(('Library Data', LIBRARY_FILE, 'Notebook library metadata'))

        return targets

    def preview(self):
        """Preview what will be deleted"""
        print("\n🔍 Cleanup Preview:")
        print("=" * 50)

        total_size = 0
        items_found = 0

        for category, path, description in self._targets:
            if path.exists():
                size = _get_size(path)
                total_size += size
                items_found += 1
                kind = "directory" if path.is_dir() else "file"
                print(f"\n  📁 {category} ({kind})")
                print(f"     Path: {path}")
                print(f"     Description: {description}")
                print(f"     Size: {_format_size(size)}")
            else:
                print(f"\n  ⬜ {category} — not found (already clean)")

        print("\n" + "=" * 50)
        if items_found > 0:
            print(f"  Total to delete: {items_found} item(s), {_format_size(total_size)}")
        else:
            print("  Nothing to clean up — already clean!")

        print("\n  ℹ️  .venv is NEVER deleted (skill infrastructure)")
        if self.preserve_library:
            print("  ℹ️  Notebook library will be preserved (--preserve-library)")

        return items_found > 0

    def execute(self, force: bool = False) -> bool:
        """Execute the cleanup"""
        has_items = self.preview()

        if not has_items:
            return True

        if not force:
            print("\n⚠️  This will permanently delete the items listed above.")
            answer = input("Are you sure? (yes/no): ").strip().lower()
            if answer not in ('yes', 'y'):
                print("❌ Cleanup cancelled")
                return False

        print("\n🗑️  Cleaning up...")

        deleted = 0
        failed = []

        for category, path, description in self._targets:
            if not path.exists():
                continue

            try:
                if path.is_dir():
                    shutil.rmtree(path)
                    path.mkdir(parents=True, exist_ok=True)  # Recreate empty dir
                else:
                    path.unlink()

                print(f"  ✅ Deleted: {category}")
                deleted += 1

            except Exception as e:
                print(f"  ❌ Failed to delete {category}: {e}")
                failed.append((category, str(e)))

        print(f"\n✅ Cleanup complete: {deleted} item(s) deleted")
        if failed:
            print(f"⚠️  {len(failed)} item(s) could not be deleted:")
            for name, err in failed:
                print(f"   - {name}: {err}")

        return len(failed) == 0


def main():
    parser = argparse.ArgumentParser(
        description='Clean up NotebookLM skill data',
        epilog='Note: .venv is never deleted.'
    )

    parser.add_argument(
        '--confirm',
        action='store_true',
        help='Execute cleanup (default is preview only)'
    )

    parser.add_argument(
        '--preserve-library',
        action='store_true',
        help='Keep notebook library data, only remove auth/browser state'
    )

    parser.add_argument(
        '--force',
        action='store_true',
        help='Skip confirmation prompt (use with --confirm)'
    )

    args = parser.parse_args()

    manager = CleanupManager(preserve_library=args.preserve_library)

    if args.confirm:
        success = manager.execute(force=args.force)
        sys.exit(0 if success else 1)
    else:
        has_items = manager.preview()
        if has_items:
            print("\nRun with --confirm to delete these items.")
            print("Add --preserve-library to keep your notebook list.")


if __name__ == "__main__":
    main()
