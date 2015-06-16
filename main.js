/*
 * The MIT License (MIT)
 * Copyright (c) 2014 Hamdan Javeed. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/* Warning: developed by Hamdan Javeed :P */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

/** Join Lines Extension
    Joins the next line or all the lines selected, with or without whitespace.
*/

define(function (require, exports, module) {
    'use strict';

    var CommandManager = brackets.getModule("command/CommandManager");
    var Menus = brackets.getModule("command/Menus");
    var EditorManager = brackets.getModule("editor/EditorManager");
    var DocumentManager = brackets.getModule("document/DocumentManager");

    function joinWithWhitespace() {
        join(true);
    }

    function joinWithoutWhitespace() {
        join(false);
    }

    function join(withWhitespace) {
        var editor = EditorManager.getFocusedEditor();
        var doc = DocumentManager.getCurrentDocument();
        var cursorPos = editor.getCursorPos();

        var text = doc.getText();
        var splitText = text.split("\n");
        var selectedText = editor.getSelectedText();

        var lines;
        var start;
        var end;

        if (selectedText) {
            var startingLine = editor._codeMirror.getCursor("start").line;
            var endLine = editor._codeMirror.getCursor("end").line;

            lines = [splitText[startingLine]];
            lines = lines.concat(selectedText.split("\n").slice(1));

            start = {
                line: startingLine,
                ch: 0
            };

            end = {
                line: endLine,
                ch: lines[lines.length - 1].length
            };
        } else {
            if (cursorPos.line < splitText.length - 1) {
                var lines = [splitText[cursorPos.line]];
                lines.push(splitText[cursorPos.line + 1]);

                start = {
                    line: cursorPos.line,
                    ch: 0
                };

                end = {
                    line: cursorPos.line + lines.length - 1,
                    ch: lines[lines.length - 1].length
                };
            }
        }

        doc.replaceRange(returnJoinedLines(lines, withWhitespace), start, end);
    }

    // takes the first line and an array of lines, joins them with or without whitespace
    function returnJoinedLines(lines, withWhitespace) {
        // trim excess white space from the end of the first line
        var joinedLines = lines.shift().replace(/\s*$/, "");

        // go through the rest of the lines
        lines.forEach(function (line) {
            if (!/^\s+$/.test(line) && line !== "") {
                joinedLines += ((withWhitespace) ? " " : "") + line.trim();
            }
        });

        return joinedLines;
    }

    // register the two commands
    var COMMAND_ID_WHITESPACE = "JoinLines.joinWithWhitespace";
    var MENU_NAME_WHITESPACE = "Join Lines";
    CommandManager.register(MENU_NAME_WHITESPACE, COMMAND_ID_WHITESPACE, joinWithWhitespace);

    var COMMAND_ID_NO_WHITESPACE = "JoinLines.joinWithoutWhitespace";
    var MENU_NAME_NO_WHITESPACE = "Join Lines (no whitespace)";
    CommandManager.register(MENU_NAME_NO_WHITESPACE, COMMAND_ID_NO_WHITESPACE, joinWithoutWhitespace);

    // add the two commands to the Edit menu
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(COMMAND_ID_WHITESPACE, 
            [{key: "Ctrl-Shift-J"}, {key: "Command-Shift-J", platform: "mac"}]);
    menu.addMenuItem(COMMAND_ID_NO_WHITESPACE, 
            [{key: "Ctrl-Alt-J"}, {key: "Command-Alt-J", platform: "mac"}]);
});
