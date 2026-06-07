#!/usr/bin/env python3
"""
Notebook Library Management for NotebookLM Skill
Manages a local collection of NotebookLM notebooks with metadata
"""

import json
import time
import argparse
import sys
from pathlib import Path
from typing import Optional, List, Dict, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import LIBRARY_FILE, DATA_DIR


class NotebookLibrary:
    """Manages a local library of NotebookLM notebooks"""

    def __init__(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        self.library_file = LIBRARY_FILE
        self._data = self._load_library()

    def _load_library(self) -> Dict[str, Any]:
        """Load library from disk"""
        if self.library_file.exists():
            try:
                with open(self.library_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ Could not load library: {e}")

        return {
            'notebooks': {},
            'active_notebook_id': None,
            'created_at': time.time(),
            'version': '1.0'
        }

    def _save_library(self):
        """Save library to disk"""
        try:
            with open(self.library_file, 'w') as f:
                json.dump(self._data, f, indent=2)
        except Exception as e:
            print(f"❌ Failed to save library: {e}")

    @property
    def active_notebook_id(self) -> Optional[str]:
        return self._data.get('active_notebook_id')

    def add_notebook(
        self,
        url: str,
        name: str,
        description: str,
        topics: str,
        tags: str = "",
        content_types: str = "",
        use_cases: str = ""
    ) -> Dict[str, Any]:
        """Add a notebook to the library"""
        notebook_id = name.lower().replace(' ', '-').replace('/', '-')[:32]

        # Ensure unique ID
        base_id = notebook_id
        counter = 1
        while notebook_id in self._data['notebooks']:
            notebook_id = f"{base_id}-{counter}"
            counter += 1

        notebook = {
            'id': notebook_id,
            'url': url,
            'name': name,
            'description': description,
            'topics': [t.strip() for t in topics.split(',') if t.strip()],
            'tags': [t.strip() for t in tags.split(',') if t.strip()],
            'content_types': [c.strip() for c in content_types.split(',') if c.strip()],
            'use_cases': [u.strip() for u in use_cases.split(',') if u.strip()],
            'created_at': time.time(),
            'created_at_iso': time.strftime('%Y-%m-%d %H:%M:%S'),
            'modified_at': time.time(),
            'use_count': 0
        }

        self._data['notebooks'][notebook_id] = notebook
        self._save_library()

        print(f"✅ Added notebook: {name} (ID: {notebook_id})")
        return notebook

    def remove_notebook(self, notebook_id: str) -> bool:
        """Remove a notebook from the library"""
        if notebook_id not in self._data['notebooks']:
            print(f"❌ Notebook not found: {notebook_id}")
            return False

        name = self._data['notebooks'][notebook_id]['name']
        del self._data['notebooks'][notebook_id]

        if self._data.get('active_notebook_id') == notebook_id:
            self._data['active_notebook_id'] = None
            remaining = list(self._data['notebooks'].keys())
            if remaining:
                self._data['active_notebook_id'] = remaining[0]
                print(f"  ℹ️ Active notebook changed to: {remaining[0]}")

        self._save_library()
        print(f"✅ Removed notebook: {name}")
        return True

    def update_notebook(self, notebook_id: str, **kwargs) -> bool:
        """Update notebook metadata"""
        if notebook_id not in self._data['notebooks']:
            print(f"❌ Notebook not found: {notebook_id}")
            return False

        notebook = self._data['notebooks'][notebook_id]
        for key, value in kwargs.items():
            if key in notebook:
                notebook[key] = value

        notebook['modified_at'] = time.time()
        self._save_library()
        print(f"✅ Updated notebook: {notebook_id}")
        return True

    def get_notebook(self, notebook_id: str) -> Optional[Dict[str, Any]]:
        """Get a notebook by ID"""
        return self._data['notebooks'].get(notebook_id)

    def list_notebooks(self) -> List[Dict[str, Any]]:
        """List all notebooks"""
        return list(self._data['notebooks'].values())

    def search_notebooks(self, query: str) -> List[Dict[str, Any]]:
        """Search notebooks by query across name, description, topics, tags"""
        query_lower = query.lower()
        results = []

        for notebook in self._data['notebooks'].values():
            searchable = ' '.join([
                notebook.get('name', ''),
                notebook.get('description', ''),
                ' '.join(notebook.get('topics', [])),
                ' '.join(notebook.get('tags', []))
            ]).lower()

            if query_lower in searchable:
                results.append(notebook)

        return results

    def select_notebook(self, notebook_id: str) -> bool:
        """Set the active notebook"""
        if notebook_id not in self._data['notebooks']:
            print(f"❌ Notebook not found: {notebook_id}")
            return False

        self._data['active_notebook_id'] = notebook_id
        self._save_library()
        name = self._data['notebooks'][notebook_id]['name']
        print(f"✅ Active notebook: {name} (ID: {notebook_id})")
        return True

    def get_active_notebook(self) -> Optional[Dict[str, Any]]:
        """Get the currently active notebook"""
        active_id = self._data.get('active_notebook_id')
        if active_id and active_id in self._data['notebooks']:
            return self._data['notebooks'][active_id]
        return None

    def increment_use_count(self, notebook_id: str):
        """Track usage statistics"""
        if notebook_id in self._data['notebooks']:
            self._data['notebooks'][notebook_id]['use_count'] = \
                self._data['notebooks'][notebook_id].get('use_count', 0) + 1
            self._save_library()

    def get_stats(self) -> Dict[str, Any]:
        """Get library statistics"""
        notebooks = list(self._data['notebooks'].values())
        total_uses = sum(nb.get('use_count', 0) for nb in notebooks)

        most_used = None
        if notebooks:
            most_used = max(notebooks, key=lambda nb: nb.get('use_count', 0))

        return {
            'total_notebooks': len(notebooks),
            'total_uses': total_uses,
            'active_notebook': self._data.get('active_notebook_id'),
            'most_used': most_used['name'] if most_used else None,
            'most_used_count': most_used.get('use_count', 0) if most_used else 0
        }


def _print_notebook(notebook: Dict[str, Any], active_id: Optional[str] = None):
    """Pretty-print a notebook entry"""
    is_active = notebook['id'] == active_id
    mark = " ✅ [ACTIVE]" if is_active else ""
    print(f"\n📓 {notebook['name']}{mark}")
    print(f"   ID: {notebook['id']}")
    print(f"   URL: {notebook['url']}")
    print(f"   Description: {notebook.get('description', 'N/A')}")
    if notebook.get('topics'):
        print(f"   Topics: {', '.join(notebook['topics'])}")
    if notebook.get('tags'):
        print(f"   Tags: {', '.join(notebook['tags'])}")
    print(f"   Uses: {notebook.get('use_count', 0)}")
    print(f"   Added: {notebook.get('created_at_iso', 'N/A')}")


def main():
    parser = argparse.ArgumentParser(description='Manage NotebookLM notebook library')

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # add
    add_parser = subparsers.add_parser('add', help='Add a notebook to the library')
    add_parser.add_argument('--url', required=True, help='NotebookLM notebook URL')
    add_parser.add_argument('--name', required=True, help='Notebook name')
    add_parser.add_argument('--description', required=True, help='What this notebook contains')
    add_parser.add_argument('--topics', required=True, help='Comma-separated topics')
    add_parser.add_argument('--tags', default='', help='Comma-separated tags')
    add_parser.add_argument('--content-types', default='', help='Content types in this notebook')
    add_parser.add_argument('--use-cases', default='', help='Use cases for this notebook')

    # list
    subparsers.add_parser('list', help='List all notebooks')

    # search
    search_parser = subparsers.add_parser('search', help='Search notebooks')
    search_parser.add_argument('--query', required=True, help='Search query')

    # activate
    activate_parser = subparsers.add_parser('activate', help='Set active notebook')
    activate_parser.add_argument('--id', required=True, help='Notebook ID')

    # remove
    remove_parser = subparsers.add_parser('remove', help='Remove a notebook')
    remove_parser.add_argument('--id', required=True, help='Notebook ID')

    # stats
    subparsers.add_parser('stats', help='Show library statistics')

    args = parser.parse_args()

    library = NotebookLibrary()

    if args.command == 'add':
        library.add_notebook(
            url=args.url,
            name=args.name,
            description=args.description,
            topics=args.topics,
            tags=getattr(args, 'tags', ''),
            content_types=getattr(args, 'content_types', ''),
            use_cases=getattr(args, 'use_cases', '')
        )

    elif args.command == 'list':
        notebooks = library.list_notebooks()
        if not notebooks:
            print("📚 No notebooks in library.")
            print("Add one: python scripts/run.py notebook_manager.py add --url URL --name NAME --description DESC --topics TOPICS")
        else:
            print(f"\n📚 Notebook Library ({len(notebooks)} notebooks):")
            active_id = library.active_notebook_id
            for nb in notebooks:
                _print_notebook(nb, active_id)

    elif args.command == 'search':
        results = library.search_notebooks(args.query)
        if not results:
            print(f"🔍 No notebooks found for: {args.query}")
        else:
            print(f"\n🔍 Found {len(results)} notebook(s) for '{args.query}':")
            active_id = library.active_notebook_id
            for nb in results:
                _print_notebook(nb, active_id)

    elif args.command == 'activate':
        library.select_notebook(args.id)

    elif args.command == 'remove':
        library.remove_notebook(args.id)

    elif args.command == 'stats':
        stats = library.get_stats()
        print("\n📊 Library Statistics:")
        print(f"  Total notebooks: {stats['total_notebooks']}")
        print(f"  Total queries: {stats['total_uses']}")
        print(f"  Active notebook: {stats['active_notebook'] or 'None'}")
        if stats['most_used']:
            print(f"  Most used: {stats['most_used']} ({stats['most_used_count']} queries)")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
