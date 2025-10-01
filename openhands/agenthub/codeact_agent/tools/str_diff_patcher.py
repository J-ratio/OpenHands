import logging
import re

from litellm import ChatCompletionToolParam, ChatCompletionToolParamFunctionChunk

from openhands.llm.tool_names import STR_DIFF_PATCHER_TOOL_NAME


def _convert_search_replace_to_unified_diff(search_replace_text: str) -> str:
    """Convert SEARCH/REPLACE format to unified diff format."""
    lines = search_replace_text.split('\n')
    unified_diff_lines = []
    i = 0
    while i < len(lines):
        if lines[i].strip() == '<<<<<<< SEARCH':
            unified_diff_lines.append('--- a/test_code.c')
            unified_diff_lines.append('+++ b/test_code.c')

            # Find search section
            search_lines = []
            i += 1
            while i < len(lines) and lines[i].strip() != '=======':
                search_lines.append(lines[i])
                i += 1

            if i < len(lines) and lines[i].strip() == '=======':
                # Find replace section
                replace_lines = []
                i += 1
                while i < len(lines) and lines[i].strip() != '>>>>>>> REPLACE':
                    replace_lines.append(lines[i])
                    i += 1

                if i < len(lines) and lines[i].strip() == '>>>>>>> REPLACE':
                    # Create proper hunk header with correct line counts
                    search_count = len(search_lines)
                    replace_count = len(replace_lines)
                    unified_diff_lines.append(
                        f'@@ -1,{search_count} +1,{replace_count} @@'
                    )

                    # Add search lines with - prefix
                    for line in search_lines:
                        unified_diff_lines.append(f'-{line}')

                    # Add replace lines with + prefix
                    for line in replace_lines:
                        unified_diff_lines.append(f'+{line}')
                else:
                    print('Invalid SEARCH/REPLACE format: missing >>>>>>> REPLACE')
            else:
                raise Exception('Invalid SEARCH/REPLACE format: missing =======')
        else:
            i += 1
    return '\n'.join(unified_diff_lines)


def _apply_hunk_to_text(text: str, hunk) -> str:
    text.split('\n')
    new_lines = []
    for line in hunk:
        if line.line_type == ' ':
            new_lines.append(line.value)
        elif line.line_type == '-':
            pass
        elif line.line_type == '+':
            new_lines.append(line.value[1:])
    return '\n'.join(new_lines)


def _apply_search_replace_manually(current_code: str, search_replace_text: str) -> str:
    """Apply SEARCH/REPLACE blocks manually."""
    current_code_copy = current_code
    lines = search_replace_text.split('\n')
    i = 0

    while i < len(lines):
        if re.search(r'<<<+ SEARCH', lines[i]):
            # Find the search section
            search_lines = []
            i += 1
            while i < len(lines) and not re.search(r'===+', lines[i]):
                search_lines.append(lines[i])
                i += 1

            if i < len(lines) and re.search(r'===+', lines[i]):
                # Find the replace section
                replace_lines = []
                i += 1
                while i < len(lines) and not re.search(r'>>>+ REPLACE', lines[i]):
                    replace_lines.append(lines[i])
                    i += 1

                if i < len(lines) and re.search(r'>>>+ REPLACE', lines[i]):
                    # Check for empty blocks
                    if not search_lines or all(
                        line.strip() == '' for line in search_lines
                    ):
                        raise Exception(
                            'SEARCH section is empty or contains only whitespace'
                        )
                    if not replace_lines:
                        raise Exception('REPLACE section is empty')
                    # Perform the replacement
                    search_text = '\n'.join(search_lines)
                    replace_text = '\n'.join(replace_lines)

                    if search_text in current_code_copy:
                        current_code_copy = current_code_copy.replace(
                            search_text, replace_text, 1
                        )
                        logging.info('Applied SEARCH/REPLACE block')
                    else:
                        print(
                            'Search text not found in current code, skipping replacement'
                        )
                        print(f'Search text was: {current_code}')
                else:
                    print('Invalid SEARCH/REPLACE format: missing >>>>>>> REPLACE')
            else:
                print('Invalid SEARCH/REPLACE format: missing =======')
        else:
            i += 1

    return current_code_copy


def apply_search_replace_blocks(
    current_test_code: str, search_replace_text: str
) -> str:
    """Apply SEARCH/REPLACE blocks to the current test code."""

    # Normalize SEARCH/REPLACE block markers if needed
    def _normalize_search_replace_markers(text: str) -> str:
        # Normalize <<<<<<< SEARCH
        text = re.sub(
            r'^\s*<+\s*SEARCH\s*$', '<<<<<<< SEARCH', text, flags=re.MULTILINE
        )
        # Normalize =======
        text = re.sub(r'^\s*=+\s*$', '=======', text, flags=re.MULTILINE)
        # Normalize >>>>>>> REPLACE
        text = re.sub(
            r'^\s*>+\s*REPLACE\s*$', '>>>>>>> REPLACE', text, flags=re.MULTILINE
        )
        return text

    search_replace_text = _normalize_search_replace_markers(search_replace_text)

    # For now, just use manual parsing as it's more reliable for this format
    current_test_code_copy = _apply_search_replace_manually(
        current_test_code, search_replace_text
    )

    # Check for any remaining SEARCH/REPLACE markers
    if re.search(r'<<<+ SEARCH', current_test_code_copy):
        raise Exception('Invalid SEARCH/REPLACE blocks found in the test code')
    return current_test_code_copy


_DETAILED_STR_DIFF_PATCHER_DESCRIPTION = """Custom editing tool for viewing, creating and editing files in plain-text format
* State is persistent across command calls and discussions with the user
* If `path` is a text file, `view` displays the result of applying `cat -n`. If `path` is a directory, `view` lists non-hidden files and directories up to 2 levels deep
* The following binary file extensions can be viewed in Markdown format: [".xlsx", ".pptx", ".wav", ".mp3", ".m4a", ".flac", ".pdf", ".docx"]. IT DOES NOT HANDLE IMAGES.
* The `create` command cannot be used if the specified `path` already exists as a file
* If a `command` generates a long output, it will be truncated and marked with `<response clipped>`
* The `undo_edit` command will revert the last edit made to the file at `path`
* The `apply_diff` command applies search and replace content to the file for editing strings, allowing both simple and multiple edits in one operation
* This tool can be used for creating and editing files in plain-text format.


Before using this tool:
1. Use the view tool to understand the file's contents and context
2. Verify the directory path is correct (only applicable when creating new files):
   - Use the view tool to verify the parent directory exists and is the correct location

When making edits:
   - Ensure the edit results in idiomatic, correct code
   - Do not leave the code in a broken state
   - Always use absolute file paths (starting with /)

CRITICAL REQUIREMENTS FOR USING THIS TOOL:

    For `apply_diff` command, provide the `search_block` and `replace_block` parameters containing the search and replace content. The system will construct the SEARCH/REPLACE blocks automatically. Follow these guidelines:

    a. Generate a SEARCH block:
    - Ensure it accurately matches a portion of the source code.
    - Include enough context to make the match unique within the file.

    b. Create a SEARCH/REPLACE block:
    - Use the search block you've generated.
    - Incorporate the code snippet into the REPLACE content.

    c. Format your output according to these rules:
    - Start with the opening fence and code language, e.g., ```python
    - Use <<<<<<< SEARCH to start the search block
    - Include the exact lines to search for in the existing source code
    - Use ======= as a dividing line
    - Provide the lines to replace into the source code, incorporating the code snippet
    - Use >>>>>>> REPLACE to end the replace block
    - Close with the closing fence: ```

    Important guidelines:
    - The SEARCH section must exactly match the existing file content, including all comments, docstrings, and whitespace.
    - For code wrapped in containers (json, xml, quotes), propose edits to the literal contents, including the container markup.
    - SEARCH/REPLACE blocks will only replace the first match occurrence.
    - Include enough lines in the SEARCH section to uniquely match the lines that need to change.
    - SEARCH and REPLACE sections must contain at least one non-whitespace line. Empty blocks are not allowed.

    Example output structure (note: this is a generic example, your actual output should be based on the provided source file and code snippet):
    ```[language]
    <<<<<<< SEARCH
    [Exact lines from the source file to be replaced]
    =======
    [New lines incorporating the code snippet]
    >>>>>>> REPLACE
    ```

    Provide your SEARCH/REPLACE block output without any additional explanation or commentary.

    Remember: when making multiple file edits in a row to the same file, you should prefer to send all edits in a single message with multiple calls to this tool, rather than multiple messages with a single call each.
"""

_SHORT_STR_DIFF_PATCHER_DESCRIPTION = """Custom editing tool for viewing, creating and editing files in plain-text format
* State is persistent across command calls and discussions with the user
* If `path` is a file, `view` displays the result of applying `cat -n`. If `path` is a directory, `view` lists non-hidden files and directories up to 2 levels deep
* The `create` command cannot be used if the specified `path` already exists as a file
* If a `command` generates a long output, it will be truncated and marked with `<response clipped>`
* The `undo_edit` command will revert the last edit made to the file at `path`
Notes for using the `apply_diff` command:
* Provide `search_block` and `replace_block` parameters containing the search and replace content for editing files
* SEARCH and REPLACE blocks must contain at least one non-whitespace line. Empty blocks are not allowed.
* Uses advanced diff patching logic for reliable replacements
"""


def create_str_diff_patcher_tool(
    use_short_description: bool = False,
) -> ChatCompletionToolParam:
    description = (
        _SHORT_STR_DIFF_PATCHER_DESCRIPTION
        if use_short_description
        else _DETAILED_STR_DIFF_PATCHER_DESCRIPTION
    )
    return ChatCompletionToolParam(
        type='function',
        function=ChatCompletionToolParamFunctionChunk(
            name=STR_DIFF_PATCHER_TOOL_NAME,
            description=description,
            parameters={
                'type': 'object',
                'properties': {
                    'command': {
                        'description': 'The commands to run. Allowed options are: `view`, `create`, `insert`, `undo_edit`, `apply_diff`.',
                        'enum': [
                            'view',
                            'create',
                            'insert',
                            'undo_edit',
                            'apply_diff',
                        ],
                        'type': 'string',
                    },
                    'path': {
                        'description': 'Absolute path to file or directory, e.g. `/workspace/file.py` or `/workspace`.',
                        'type': 'string',
                    },
                    'file_text': {
                        'description': 'Required parameter of `create` command, with the content of the file to be created.',
                        'type': 'string',
                    },
                    'insert_line': {
                        'description': 'Required parameter of `insert` command. The `new_str` will be inserted AFTER the line `insert_line` of `path`.',
                        'type': 'integer',
                    },
                    'view_range': {
                        'description': 'Optional parameter of `view` command when `path` points to a file. If none is given, the full file is shown. If provided, the file will be shown in the indicated line number range, e.g. [11, 12] will show lines 11 and 12. Indexing at 1 to start. Setting `[start_line, -1]` shows all lines from `start_line` to the end of the file.',
                        'items': {'type': 'integer'},
                        'type': 'array',
                    },
                    'search_block': {
                        'description': 'Required parameter of `apply_diff` command containing the search content.',
                        'type': 'string',
                    },
                    'replace_block': {
                        'description': 'Required parameter of `apply_diff` command containing the replace content.',
                        'type': 'string',
                    },
                },
                'if': {'properties': {'command': {'const': 'apply_diff'}}},
                'then': {
                    'required': ['command', 'path', 'search_block', 'replace_block']
                },
                'else': {'required': ['command', 'path']},
            },
        ),
    )
