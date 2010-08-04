/**
 * table edit plugin for kissy editor
 * @author:yiminghe@gmail.com
 */
KISSYEDITOR.add("editor-plugin-table", function(KE) {
    var S = KISSY,
        Node = S.Node,
        DOM = S.DOM,
        UA = S.UA,
        TripleButton = KE.TripleButton,
        Overlay = KE.SimpleOverlay;


    var IN_SIZE = 8,TABLE_HTML = "<table class='ke-table-config'>" +
        "<tr>" +
        "<td>" +
        "<label>行数： <input value='2' class='ke-table-rows' size='" + IN_SIZE + "'/></label>" +
        "</td>" +
        "<td>" +
        "<label>宽度： <input value='200' class='ke-table-width' size='" + IN_SIZE + "'/></label> " +
        "<select class='ke-table-width-unit'>" +
        "<option value='px'>像素</option>" +
        "<option value='%'>百分比</option>" +
        "</select>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td>" +
        "<label>列数： <input class='ke-table-cols' value='3' size='" + IN_SIZE + "'/></label>" +
        "</td>" +
        "<td>" +
        "<label>高度： <input value='200' class='ke-table-height' size='" + IN_SIZE + "'/></label> &nbsp;像素</select>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td>" +
        "<label>标题格： <select class='ke-table-head'>" +
        "<option value=''>无</option>" +
        "<option value='1'>有</option>" +
        "</select>" +
        "</td>" +
        "<td>" +
        "<label>间距： <input value='1' class='ke-table-cellspacing' size='" + IN_SIZE + "'/></label> &nbsp;像素</select>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td>" +
        "<label>对齐： <select class='ke-table-align'>" +
        "<option value=''>无</option>" +
        "<option value='left'>左对齐</option>" +
        "<option value='right'>右对齐</option>" +
        "<option value='center'>中间对齐</option>" +
        "</select>" +
        "</label>" + "</td>" +
        "<td>" +
        "<label>边距： <input value='1' class='ke-table-cellpadding' size='" + IN_SIZE + "'/></label> &nbsp;像素</select>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td>" +

        "</td>" +
        "<td>" +
        "<label>边框： <input value='1' class='ke-table-border' size='" + IN_SIZE + "'/></label> &nbsp;像素</select>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td colspan='2'>" +
        "<label>" +
        "标题：<input class='ke-table-caption' size='50'>" +
        "</label>" +
        "</td>" +
        "</tr>" +
        "<tr>" +
        "<td>" +
        "<button class='ke-table-ok'>确定</button>"
    "</td>" +
        "<td>" +
    "<button class='ke-table-close'>关闭</button>"
    "</td>" +
        "</tr>" +
    "</table>";

    function TableUI(editor) {
        this.editor = editor;
        this.selectedTable = null;
        this._init();
    }

    var ContextMenu = KE.ContextMenu,tableTags = ["tr","th","td","tbody","table"];
    S.augment(TableUI, {
        _init:function() {
            var self = this,editor = self.editor,toolBarDiv = editor.toolBarDiv;
            self.el = new TripleButton({
                text:"table",
                container:toolBarDiv
            });
            var el = self.el;
            el.on("offClick", self._tableShow, self);
            var myContexts = {};
            for (var f in contextMenu) {
                (function(f) {
                    myContexts[f] = function() {
                        contextMenu[f](editor);
                    }
                })(f);
            }
            ContextMenu.register(editor.document, {
                tags:tableTags,
                width:"120px",
                funcs:myContexts
            });
        },
        _tableInit:function() {
            var self = this;
            var d = new Overlay({
                width:"350px",
                mask:true,
                title:"编辑表格"
            });
            d.body.html(TABLE_HTML);

            d.twidth = d.body.one(".ke-table-width");
            d.theight = d.body.one(".ke-table-height");
            d.tcellspacing = d.body.one(".ke-table-cellspacing");
            d.tcellpadding = d.body.one(".ke-table-cellpadding");
            d.tborder = d.body.one(".ke-table-border");
            d.tcaption = d.body.one(".ke-table-caption");
            d.talign = d.body.one(".ke-table-align");
            d.trows = d.body.one(".ke-table-rows");
            d.tcols = d.body.one(".ke-table-cols");
            d.thead = d.body.one(".ke-table-head");
            d.tok = d.body.one(".ke-table-ok");
            d.tclose = d.body.one(".ke-table-close");
            d.twidthunit = d.body.one(".ke-table-width-unit");
            self.tableDialog = d;
            if (!this.selectedTable)
                d.tok.on("click", this._genTable, this);
        },
        _genTable:function() {
            var self = this, d = self.tableDialog;
            var html = "<table ";
            if (S.trim(d.talign.val()).length != 0)
                html += "align='" + S.trim(d.talign.val()) + "' ";
            if (S.trim(d.tcellspacing.val()).length != 0)
                html += "cellspacing='" + S.trim(d.tcellspacing.val()) + "' ";
            if (S.trim(d.tcellpadding.val()).length != 0)
                html += "cellpadding='" + S.trim(d.tcellpadding.val()) + "' ";
            if (S.trim(d.tborder.val()).length != 0)
                html += "border='" + S.trim(d.tborder.val()) + "' ";
            if (S.trim(d.twidth.val()).length != 0 || (S.trim(d.theight.val()).length != 0)) {
                html += "style='";
                if (S.trim(d.twidth.val()).length != 0) {
                    html += "width:" + S.trim(d.twidth.val()) + d.twidthunit.val() + ";"
                }
                if (S.trim(d.theight.val()).length != 0) {
                    html += "height:" + S.trim(d.theight.val()) + ";"
                }
                html += "' "
            }
            html += ">";
            if (S.trim(d.tcaption.val())) {
                html += "<caption><span>" + S.trim(d.tcaption.val()) + "</span></caption>";
            }
            var cols = parseInt(d.tcols.val()),rows = parseInt(d.trows.val()),cellpad = UA.ie ? "" : "<br/>";
            if (d.thead.val()) {
                html += "<thead>";
                html += "<tr>";
                for (var i = 0; i < cols; i++)
                    html += "<th>" + cellpad + "</th>";
                html += "</tr>";
                html += "</thead>";
            }

            html += "<tbody>";
            for (var r = 0; r < rows; r++) {
                html += "<tr>";
                for (var i = 0; i < cols; i++) {
                    html += "<td>" + cellpad + "</td>";
                }
                html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";
            var editor = this.editor;
            var table = new Node(html, null, editor.documen);
            editor.fire("save");
            editor.insertElement(table);
            editor.fire("save");
            d.hide();

        },
        _tableShow:    function() {
            var self = this;
            if (!self.tableDialog) {
                self._tableInit();
            }
            self.tableDialog.show();
        }
    });


    var cellNodeRegex = /^(?:td|th)$/;

    function getSelectedCells(selection) {
        // Walker will try to split text nodes, which will make the current selection
        // invalid. So save bookmarks before doing anything.
        var bookmarks = selection.createBookmarks();

        var ranges = selection.getRanges();
        var retval = [];
        var database = {};

        function moveOutOfCellGuard(node) {
            // Apply to the first cell only.
            if (retval.length > 0)
                return;

            // If we are exiting from the first </td>, then the td should definitely be
            // included.
            if (node.type == CKEDITOR.NODE_ELEMENT && cellNodeRegex.test(node.getName())
                && !node.getCustomData('selected_cell')) {
                CKEDITOR.dom.element.setMarker(database, node, 'selected_cell', true);
                retval.push(node);
            }
        }

        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[ i ];

            if (range.collapsed) {
                // Walker does not handle collapsed ranges yet - fall back to old API.
                var startNode = range.getCommonAncestor();
                var nearestCell = startNode.getAscendant('td', true) || startNode.getAscendant('th', true);
                if (nearestCell)
                    retval.push(nearestCell);
            }
            else {
                var walker = new CKEDITOR.dom.walker(range);
                var node;
                walker.guard = moveOutOfCellGuard;

                while (( node = walker.next() )) {
                    // If may be possible for us to have a range like this:
                    // <td>^1</td><td>^2</td>
                    // The 2nd td shouldn't be included.
                    //
                    // So we have to take care to include a td we've entered only when we've
                    // walked into its children.

                    var parent = node.getParent();
                    if (parent && cellNodeRegex.test(parent.getName()) && !parent.getCustomData('selected_cell')) {
                        CKEDITOR.dom.element.setMarker(database, parent, 'selected_cell', true);
                        retval.push(parent);
                    }
                }
            }
        }

        CKEDITOR.dom.element.clearAllMarkers(database);

        // Restore selection position.
        selection.selectBookmarks(bookmarks);

        return retval;
    }

    function getFocusElementAfterDelCells(cellsToDelete) {
        var i = 0,
            last = cellsToDelete.length - 1,
            database = {},
            cell,focusedCell,
            tr;

        while (( cell = cellsToDelete[ i++ ] ))
            CKEDITOR.dom.element.setMarker(database, cell, 'delete_cell', true);

        // 1.first we check left or right side focusable cell row by row;
        i = 0;
        while (( cell = cellsToDelete[ i++ ] )) {
            if (( focusedCell = cell.getPrevious() ) && !focusedCell.getCustomData('delete_cell')
                || ( focusedCell = cell.getNext()     ) && !focusedCell.getCustomData('delete_cell')) {
                CKEDITOR.dom.element.clearAllMarkers(database);
                return focusedCell;
            }
        }

        CKEDITOR.dom.element.clearAllMarkers(database);

        // 2. then we check the toppest row (outside the selection area square) focusable cell
        tr = cellsToDelete[ 0 ].getParent();
        if (( tr = tr.getPrevious() ))
            return tr.getLast();

        // 3. last we check the lowerest  row focusable cell
        tr = cellsToDelete[ last ].getParent();
        if (( tr = tr.getNext() ))
            return tr.getChild(0);

        return null;
    }

    function clearRow($tr) {
        // Get the array of row's cells.
        var $cells = $tr.cells;

        // Empty all cells.
        for (var i = 0; i < $cells.length; i++) {
            $cells[ i ].innerHTML = '';

            if (!CKEDITOR.env.ie)
                ( new CKEDITOR.dom.element($cells[ i ]) ).appendBogus();
        }
    }

    function insertRow(selection, insertBefore) {
        // Get the row where the selection is placed in.
        var row = selection.getStartElement().getAscendant('tr');
        if (!row)
            return;

        // Create a clone of the row.
        var newRow = row.clone(true);

        // Insert the new row before of it.
        newRow.insertBefore(row);

        // Clean one of the rows to produce the illusion of inserting an empty row
        // before or after.
        clearRow(insertBefore ? newRow.$ : row.$);
    }

    function deleteRows(selectionOrRow) {
        if (selectionOrRow instanceof CKEDITOR.dom.selection) {
            var cells = getSelectedCells(selectionOrRow),
                cellsCount = cells.length,
                rowsToDelete = [],
                cursorPosition,
                previousRowIndex,
                nextRowIndex;

            // Queue up the rows - it's possible and likely that we have duplicates.
            for (var i = 0; i < cellsCount; i++) {
                var row = cells[ i ].getParent(),
                    rowIndex = row.$.rowIndex;

                !i && ( previousRowIndex = rowIndex - 1 );
                rowsToDelete[ rowIndex ] = row;
                i == cellsCount - 1 && ( nextRowIndex = rowIndex + 1 );
            }

            var table = row.getAscendant('table'),
                rows = table.$.rows,
                rowCount = rows.length;

            // Where to put the cursor after rows been deleted?
            // 1. Into next sibling row if any;
            // 2. Into previous sibling row if any;
            // 3. Into table's parent element if it's the very last row.
            cursorPosition = new CKEDITOR.dom.element(
                nextRowIndex < rowCount && table.$.rows[ nextRowIndex ] ||
                    previousRowIndex > 0 && table.$.rows[ previousRowIndex ] ||
                    table.$.parentNode);

            for (i = rowsToDelete.length; i >= 0; i--) {
                if (rowsToDelete[ i ])
                    deleteRows(rowsToDelete[ i ]);
            }

            return cursorPosition;
        }
        else if (selectionOrRow instanceof CKEDITOR.dom.element) {
            table = selectionOrRow.getAscendant('table');

            if (table.$.rows.length == 1)
                table.remove();
            else
                selectionOrRow.remove();
        }

        return 0;
    }

    function insertColumn(selection, insertBefore) {
        // Get the cell where the selection is placed in.
        var startElement = selection.getStartElement();
        var cell = startElement.getAscendant('td', true) || startElement.getAscendant('th', true);

        if (!cell)
            return;

        // Get the cell's table.
        var table = cell.getAscendant('table');
        var cellIndex = cell.$.cellIndex;

        // Loop through all rows available in the table.
        for (var i = 0; i < table.$.rows.length; i++) {
            var $row = table.$.rows[ i ];

            // If the row doesn't have enough cells, ignore it.
            if ($row.cells.length < ( cellIndex + 1 ))
                continue;

            cell = new CKEDITOR.dom.element($row.cells[ cellIndex ].cloneNode(false));

            if (!CKEDITOR.env.ie)
                cell.appendBogus();

            // Get back the currently selected cell.
            var baseCell = new CKEDITOR.dom.element($row.cells[ cellIndex ]);
            if (insertBefore)
                cell.insertBefore(baseCell);
            else
                cell.insertAfter(baseCell);
        }
    }

    function getFocusElementAfterDelCols(cells) {
        var cellIndexList = [],
            table = cells[ 0 ] && cells[ 0 ].getAscendant('table'),
            i, length,
            targetIndex, targetCell;

        // get the cellIndex list of delete cells
        for (i = 0,length = cells.length; i < length; i++)
            cellIndexList.push(cells[i].$.cellIndex);

        // get the focusable column index
        cellIndexList.sort();
        for (i = 1,length = cellIndexList.length; i < length; i++) {
            if (cellIndexList[ i ] - cellIndexList[ i - 1 ] > 1) {
                targetIndex = cellIndexList[ i - 1 ] + 1;
                break;
            }
        }

        if (!targetIndex)
            targetIndex = cellIndexList[ 0 ] > 0 ? ( cellIndexList[ 0 ] - 1 )
                : ( cellIndexList[ cellIndexList.length - 1 ] + 1 );

        // scan row by row to get the target cell
        var rows = table.$.rows;
        for (i = 0,length = rows.length; i < length; i++) {
            targetCell = rows[ i ].cells[ targetIndex ];
            if (targetCell)
                break;
        }

        return targetCell ? new CKEDITOR.dom.element(targetCell) : table.getPrevious();
    }

    function deleteColumns(selectionOrCell) {
        if (selectionOrCell instanceof CKEDITOR.dom.selection) {
            var colsToDelete = getSelectedCells(selectionOrCell),
                elementToFocus = getFocusElementAfterDelCols(colsToDelete);

            for (var i = colsToDelete.length - 1; i >= 0; i--) {
                if (colsToDelete[ i ])
                    deleteColumns(colsToDelete[ i ]);
            }

            return elementToFocus;
        }
        else if (selectionOrCell instanceof CKEDITOR.dom.element) {
            // Get the cell's table.
            var table = selectionOrCell.getAscendant('table');
            if (!table)
                return null;

            // Get the cell index.
            var cellIndex = selectionOrCell.$.cellIndex;

            /*
             * Loop through all rows from down to up, coz it's possible that some rows
             * will be deleted.
             */
            for (i = table.$.rows.length - 1; i >= 0; i--) {
                // Get the row.
                var row = new CKEDITOR.dom.element(table.$.rows[ i ]);

                // If the cell to be removed is the first one and the row has just one cell.
                if (!cellIndex && row.$.cells.length == 1) {
                    deleteRows(row);
                    continue;
                }

                // Else, just delete the cell.
                if (row.$.cells[ cellIndex ])
                    row.$.removeChild(row.$.cells[ cellIndex ]);
            }
        }

        return null;
    }


    var contextMenu =
    {
        "删除表格" : function(editor) {
            var selection = editor.getSelection();
            var startElement = selection && selection.getStartElement();
            var table = startElement && startElement._4e_ascendant('table', true);

            if (!table)
                return;

            // Maintain the selection point at where the table was deleted.
            selection.selectElement(table);
            var range = selection.getRanges()[0];
            range.collapse();
            selection.selectRanges([ range ]);

            // If the table's parent has only one child, remove it,except body,as well.( #5416 )
            var parent = table.parent();
            if (parent[0].childNodes.length == 1 && parent._4e_name() != 'body')
                parent._4e_remove();
            else
                table._4e_remove();
        },

        'rowDelete': function(editor) {
            var selection = editor.getSelection();
            placeCursorInCell(deleteRows(selection));
        },


        'rowInsertBefore': function(editor) {
            var selection = editor.getSelection();
            insertRow(selection, true);
        },


        'rowInsertAfter' : function(editor) {
            var selection = editor.getSelection();
            insertRow(selection);
        },


        'columnDelete' : function(editor) {
            var selection = editor.getSelection();
            var element = deleteColumns(selection);
            element && placeCursorInCell(element, true);
        },


        'columnInsertBefore' : function(editor) {
            var selection = editor.getSelection();
            insertColumn(selection, true);
        },


        'columnInsertAfter' : function(editor) {
            var selection = editor.getSelection();
            insertColumn(selection);
        }};


    KE.on("instanceCreated", function(ev) {
        var editor = ev.editor;

        new TableUI(editor);
    });
});