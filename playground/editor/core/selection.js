/**
 * modified from ckeditor core plugin : selection
 * @modifier:yiminghe@gmail.com(chengyu)
 */
KISSY.add("editor-selection", function(S) {
    var UA = S.UA,DOM = S.DOM,Node = S.Node;
    KISSYEDITOR.SELECTION = {};
    var KES = KISSYEDITOR.SELECTION,
        KEN = KISSYEDITOR.NODE,
        Walker = S.Walker,
        ElementPath = S.ElementPath,
        KERange = S.Range;
    /**
     * No selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_NONE )
     *     alert( 'Nothing is selected' );
     */
    KES.SELECTION_NONE = 1;

    /**
     * Text or collapsed selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_TEXT )
     *     alert( 'Text is selected' );
     */
    KES.SELECTION_TEXT = 2;

    /**
     * Element selection.
     * @constant
     * @example
     * if ( editor.getSelection().getType() == CKEDITOR.SELECTION_ELEMENT )
     *     alert( 'An element is selected' );
     */
    KES.SELECTION_ELEMENT = 3;

    var blockBoundaryDisplayMatch = {
        block : 1,
        'list-item' : 1,
        table : 1,
        'table-row-group' : 1,
        'table-header-group' : 1,
        'table-footer-group' : 1,
        'table-row' : 1,
        'table-column-group' : 1,
        'table-column' : 1,
        'table-cell' : 1,
        'table-caption' : 1
    },
        blockBoundaryNodeNameMatch = { hr : 1 };

    function isBlockBoundary(el) {
        return blockBoundaryDisplayMatch[ el.css('display') ] ||
            blockBoundaryNodeNameMatch[ this.getName() ];
    }

    function tryThese() {
        var returnValue;
        for (var i = 0, length = arguments.length; i < length; i++) {
            var lambda = arguments[i];
            try {
                returnValue = lambda();
                break;
            }
            catch (e) {
            }
        }
        return returnValue;
    }

    function KESelection(document) {

        this.document = document;
        this.isLocked = false;
        this._ = {
            cache : {}
        };

        /**
         * IE BUG: The selection's document may be a different document than the
         * editor document. Return null if that's the case.
         */
        if (UA.ie) {
            var range = this.getNative().createRange();
            if (!range
                || ( range.item && range.item(0).ownerDocument != this.document )
                || ( range.parentElement && range.parentElement().ownerDocument != this.document )) {
                this.isInvalid = true;
            }
        }

        return this;
    }

    var styleObjectElements = {
        img:1,hr:1,li:1,table:1,tr:1,td:1,th:1,embed:1,object:1,ol:1,ul:1,
        a:1, input:1, form:1, select:1, textarea:1, button:1, fieldset:1, th:1, thead:1, tfoot:1
    };

    KESelection.prototype = {
        /**
         * Gets the native selection object from the browser.
         * @function
         * @returns {Object} The native selection object.
         * @example
         * var selection = editor.getSelection().<b>getNative()</b>;
         */
        getNative :
            UA.ie ?
                function() {
                    return this._.cache.nativeSel || ( this._.cache.nativeSel = this.document.selection );
                }
                :
                function() {
                    return this._.cache.nativeSel || ( this._.cache.nativeSel = DOM._4e_getWin(this.document).getSelection() );
                },

        /**
         * Gets the type of the current selection. The following values are
         * available:
         * <ul>
         *        <li>{@link CKEDITOR.SELECTION_NONE} (1): No selection.</li>
         *        <li>{@link CKEDITOR.SELECTION_TEXT} (2): Text is selected or
         *            collapsed selection.</li>
         *        <li>{@link CKEDITOR.SELECTION_ELEMENT} (3): A element
         *            selection.</li>
         * </ul>
         * @function
         * @returns {Number} One of the following constant values:
         *        {@link CKEDITOR.SELECTION_NONE}, {@link CKEDITOR.SELECTION_TEXT} or
         *        {@link CKEDITOR.SELECTION_ELEMENT}.
         * @example
         * if ( editor.getSelection().<b>getType()</b> == CKEDITOR.SELECTION_TEXT )
         *     alert( 'Text is selected' );
         */
        getType :
            UA.ie ?
                function() {
                    var cache = this._.cache;
                    if (cache.type)
                        return cache.type;

                    var type = KES.SELECTION_NONE;

                    try {
                        var sel = this.getNative(),
                            ieType = sel.type;

                        if (ieType == 'Text')
                            type = KES.SELECTION_TEXT;

                        if (ieType == 'Control')
                            type = KES.SELECTION_ELEMENT;

                        // It is possible that we can still get a text range
                        // object even when type == 'None' is returned by IE.
                        // So we'd better check the object returned by
                        // createRange() rather than by looking at the type.
                        if (sel.createRange().parentElement)
                            type = KES.SELECTION_TEXT;
                    }
                    catch(e) {
                    }

                    return ( cache.type = type );
                }
                :
                function() {
                    var cache = this._.cache;
                    if (cache.type)
                        return cache.type;

                    var type = KES.SELECTION_TEXT;

                    var sel = this.getNative();

                    if (!sel)
                        type = KES.SELECTION_NONE;
                    else if (sel.rangeCount == 1) {
                        // Check if the actual selection is a control (IMG,
                        // TABLE, HR, etc...).

                        var range = sel.getRangeAt(0),
                            startContainer = range.startContainer;

                        if (startContainer == range.endContainer
                            && startContainer.nodeType == KEN.NODE_ELEMENT
                            && ( range.endOffset - range.startOffset ) == 1
                            && styleObjectElements[ startContainer.childNodes[ range.startOffset ].nodeName.toLowerCase() ]) {
                            type = KES.SELECTION_ELEMENT;
                        }
                    }

                    return ( cache.type = type );
                },

        getRanges :
            UA.ie ?
                ( function() {
                    // Finds the container and offset for a specific boundary
                    // of an IE range.
                    var getBoundaryInformation = function(range, start) {
                        // Creates a collapsed range at the requested boundary.
                        range = range.duplicate();
                        range.collapse(start);

                        // Gets the element that encloses the range entirely.
                        var parent = range.parentElement();
                        console.log("ie get range :");
                        console.log("parent:" + parent.innerHTML);
                        var siblings = parent.childNodes;

                        var testRange;

                        for (var i = 0; i < siblings.length; i++) {
                            var child = siblings[ i ];
                            console.log("child:" + child.nodeType == KEN.NODE_ELEMENT ?
                                ("el: " + child.innerHTML) : ("text:" + child.nodeValue));
                            if (child.nodeType == KEN.NODE_ELEMENT) {
                                testRange = range.duplicate();

                                testRange.moveToElementText(child);

                                var comparisonStart = testRange.compareEndPoints('StartToStart', range),
                                    comparisonEnd = testRange.compareEndPoints('EndToStart', range);

                                testRange.collapse();
                                //�м���������ǩ
                                if (comparisonStart > 0)
                                    break;
                                // When selection stay at the side of certain self-closing elements, e.g. BR,
                                // our comparison will never shows an equality. (#4824)
                                else if (!comparisonStart
                                    || comparisonEnd == 1 && comparisonStart == -1)
                                    return { container : parent, offset : i };
                                else if (!comparisonEnd)
                                    return { container : parent, offset : i + 1 };

                                testRange = null;
                            }
                        }

                        if (!testRange) {
                            testRange = range.duplicate();
                            testRange.moveToElementText(parent);
                            testRange.collapse(false);
                        }

                        testRange.setEndPoint('StartToStart', range);
                        // IE report line break as CRLF with range.text but
                        // only LF with textnode.nodeValue, normalize them to avoid
                        // breaking character counting logic below. (#3949)
                        var distance = testRange.text.replace(/(\r\n|\r)/g, '\n').length;

                        try {
                            while (distance > 0)
                                //bug? ���ܲ����ı��ڵ� nodeValue undefined
                                //��Զ������� textnode<img/>textnode
                                //ֹͣʱ��ǰ��һ��Ϊtextnode
                                distance -= siblings[ --i ].nodeValue.length;
                        }
                            // Measurement in IE could be somtimes wrong because of <select> element. (#4611)
                        catch(e) {
                            distance = 0;
                        }


                        if (distance === 0) {
                            return {
                                container : parent,
                                offset : i
                            };
                        }
                        else {
                            return {
                                container : siblings[ i ],
                                offset : -distance
                            };
                        }
                    };

                    return function() {
                        var cache = this._.cache;
                        if (cache.ranges)
                            return cache.ranges;

                        // IE doesn't have range support (in the W3C way), so we
                        // need to do some magic to transform selections into
                        // CKEDITOR.dom.range instances.

                        var sel = this.getNative(),
                            nativeRange = sel && sel.createRange(),
                            type = this.getType(),
                            range;

                        if (!sel)
                            return [];

                        if (type == KES.SELECTION_TEXT) {
                            range = new KERange(this.document);
                            var boundaryInfo = getBoundaryInformation(nativeRange, true);
                            range.setStart(new Node(boundaryInfo.container), boundaryInfo.offset);
                            boundaryInfo = getBoundaryInformation(nativeRange);
                            range.setEnd(new Node(boundaryInfo.container), boundaryInfo.offset);
                            return ( cache.ranges = [ range ] );
                        }
                        else if (type == KES.SELECTION_ELEMENT) {
                            var retval = this._.cache.ranges = [];

                            for (var i = 0; i < nativeRange.length; i++) {
                                var element = nativeRange.item(i),
                                    parentElement = element.parentNode,
                                    j = 0;

                                range = new KERange(this.document);

                                for (; j < parentElement.childNodes.length && parentElement.childNodes[j] != element; j++) { /*jsl:pass*/
                                }

                                range.setStart(new Node(parentElement), j);
                                range.setEnd(new Node(parentElement), j + 1);
                                retval.push(range);
                            }

                            return retval;
                        }

                        return ( cache.ranges = [] );
                    };
                })()
                :
                function() {
                    var cache = this._.cache;
                    if (cache.ranges)
                        return cache.ranges;

                    // On browsers implementing the W3C range, we simply
                    // tranform the native ranges in CKEDITOR.dom.range
                    // instances.

                    var ranges = [];
                    var sel = this.getNative();

                    if (!sel)
                        return [];

                    for (var i = 0; i < sel.rangeCount; i++) {
                        var nativeRange = sel.getRangeAt(i);
                        var range = new KERange(this.document);

                        range.setStart(new Node(nativeRange.startContainer), nativeRange.startOffset);
                        range.setEnd(new Node(nativeRange.endContainer), nativeRange.endOffset);
                        ranges.push(range);
                    }

                    return ( cache.ranges = ranges );
                },

        /**
         * Gets the DOM element in which the selection starts.
         * @returns {CKEDITOR.dom.element} The element at the beginning of the
         *        selection.
         * @example
         * var element = editor.getSelection().<b>getStartElement()</b>;
         * alert( element.getName() );
         */
        getStartElement : function() {
            var cache = this._.cache;
            if (cache.startElement !== undefined)
                return cache.startElement;

            var node,
                sel = this.getNative();

            switch (this.getType()) {
                case KES.SELECTION_ELEMENT :
                    return this.getSelectedElement();

                case KES.SELECTION_TEXT :

                    var range = this.getRanges()[0];

                    if (range) {
                        if (!range.collapsed) {
                            range.optimize();

                            // Decrease the range content to exclude particial
                            // selected node on the start which doesn't have
                            // visual impact. ( #3231 )
                            while (true) {
                                var startContainer = range.startContainer,
                                    startOffset = range.startOffset;
                                // Limit the fix only to non-block elements.(#3950)
                                if (startOffset == ( startContainer[0].childNodes ?
                                    startContainer[0].childNodes.length : startContainer[0].nodeValue.length )
                                    && !isBlockBoundary(startContainer))
                                    range.setStartAfter(startContainer);
                                else break;
                            }

                            node = range.startContainer;

                            if (node[0].nodeType != KEN.NODE_ELEMENT)
                                return node.parent();

                            node = new Node(node[0].childNodes[range.startOffset]);

                            if (!node[0] || node[0].nodeType != KEN.NODE_ELEMENT)
                                return range.startContainer;

                            var child = node[0].firstChild;
                            while (child && child.nodeType == KEN.NODE_ELEMENT) {
                                node = new Node(child);
                                child = child.firstChild;
                            }
                            return node;
                        }
                    }

                    if (UA.ie) {
                        range = sel.createRange();
                        range.collapse(true);
                        node = range.parentElement();
                    }
                    else {
                        node = sel.anchorNode;
                        if (node && node.nodeType != KEN.NODE_ELEMENT)
                            node = node.parentNode;
                    }
            }

            return cache.startElement = ( node ? new CKEDITOR.dom.element(node) : null );
        },

        /**
         * Gets the current selected element.
         * @returns {CKEDITOR.dom.element} The selected element. Null if no
         *        selection is available or the selection type is not
         *        {@link CKEDITOR.SELECTION_ELEMENT}.
         * @example
         * var element = editor.getSelection().<b>getSelectedElement()</b>;
         * alert( element.getName() );
         */
        getSelectedElement : function() {
            var cache = this._.cache;
            if (cache.selectedElement !== undefined)
                return cache.selectedElement;

            var self = this;

            var node = tryThese(
                // Is it native IE control type selection?
                function() {
                    return self.getNative().createRange().item(0);
                },
                // Figure it out by checking if there's a single enclosed
                // node of the range.
                function() {
                    var range = self.getRanges()[ 0 ],
                        enclosed,
                        selected;

                    // Check first any enclosed element, e.g. <ul>[<li><a href="#">item</a></li>]</ul>
                    for (var i = 2; i && !( ( enclosed = range.getEnclosedNode() )
                        && ( enclosed[0].nodeType == KEN.NODE_ELEMENT )
                        && styleObjectElements[ enclosed.getName() ]
                        && ( selected = enclosed ) ); i--) {
                        // Then check any deep wrapped element, e.g. [<b><i><img /></i></b>]
                        range.shrink(CKEDITOR.SHRINK_ELEMENT);
                    }

                    return  selected[0];
                });

            return cache.selectedElement = ( node ? new Node(node) : null );
        },

        lock : function() {
            // Call all cacheable function.
            this.getRanges();
            this.getStartElement();
            this.getSelectedElement();

            // The native selection is not available when locked.
            this._.cache.nativeSel = {};

            this.isLocked = true;
        },

        unlock : function(restore)
        {
            var doc = this.document,
                //!TODO save ?
                lockedSelection = null;

            if (lockedSelection) {
                doc.setCustomData('cke_locked_selection', null);

                if (restore) {
                    var selectedElement = lockedSelection.getSelectedElement(),
                        ranges = !selectedElement && lockedSelection.getRanges();

                    this.isLocked = false;
                    this.reset();

                    doc.getBody().focus();

                    if (selectedElement)
                        this.selectElement(selectedElement);
                    else
                        this.selectRanges(ranges);
                }
            }

            if (!lockedSelection || !restore)
            {
                this.isLocked = false;
                this.reset();
            }
        },

        reset : function() {
            this._.cache = {};
        },

        selectElement : function(element) {
            if (this.isLocked) {
                var range = new KERange(this.document);
                range.setStartBefore(element);
                range.setEndAfter(element);

                this._.cache.selectedElement = element;
                this._.cache.startElement = element;
                this._.cache.ranges = [ range ];
                this._.cache.type = CKEDITOR.SELECTION_ELEMENT;

                return;
            }

            if (UA.ie) {
                this.getNative().empty();
                try {
                    // Try to select the node as a control.
                    range = this.document.body.createControlRange();
                    range.addElement(element[0]);
                    range.select();
                }
                catch(e) {
                    // If failed, select it as a text range.
                    range = this.document.body.createTextRange();
                    range.moveToElementText(element[0]);
                    range.select();
                }
                finally {
                    //this.document.fire('selectionchange');
                }
                this.reset();
            }
            else {
                // Create the range for the element.
                range = this.document.createRange();
                range.selectNode(element[0]);
                // Select the range.
                var sel = this.getNative();
                sel.removeAllRanges();
                sel.addRange(range);
                this.reset();
            }
        },

        selectRanges : function(ranges) {
            if (this.isLocked) {
                this._.cache.selectedElement = null;
                //!TODO
                this._.cache.startElement = ranges[ 0 ].getTouchedStartNode();
                this._.cache.ranges = ranges;
                this._.cache.type = KES.SELECTION_TEXT;

                return;
            }

            if (UA.ie) {
                // IE doesn't accept multiple ranges selection, so we just
                // select the first one.
                if (ranges[ 0 ])
                    ranges[ 0 ].select();

                this.reset();
            }
            else {
                var sel = this.getNative();
                sel.removeAllRanges();

                for (var i = 0; i < ranges.length; i++) {
                    var range = ranges[ i ];
                    var nativeRange = this.document.createRange();
                    var startContainer = range.startContainer;

                    // In FF2, if we have a collapsed range, inside an empty
                    // element, we must add something to it otherwise the caret
                    // will not be visible.
                    if (range.collapsed &&
                        ( UA.gecko && UA.gecko < 10900 ) &&
                        startContainer.type == KEN.NODE_ELEMENT &&
                        !startContainer[0].childNodes.length) {
                        startContainer[0].appendChild(document.createTextNode(""));
                    }

                    nativeRange.setStart(startContainer[0], range.startOffset);
                    nativeRange.setEnd(range.endContainer[0], range.endOffset);

                    // Select the range.
                    sel.addRange(nativeRange);
                }

                this.reset();
            }
        },

        createBookmarks : function(serializable) {
            var retval = [],
                ranges = this.getRanges(),
                length = ranges.length,
                bookmark;
            for (var i = 0; i < length; i++) {
                retval.push(bookmark = ranges[ i ].createBookmark(serializable, true));

                serializable = bookmark.serializable;

                var bookmarkStart = serializable ? S.one("#" + bookmark.startNode) : bookmark.startNode,
                    bookmarkEnd = serializable ? S.one("#" + bookmark.endNode) : bookmark.endNode;

                // Updating the offset values for rest of ranges which have been mangled(#3256).
                for (var j = i + 1; j < length; j++) {
                    var dirtyRange = ranges[ j ],
                        rangeStart = dirtyRange.startContainer,
                        rangeEnd = dirtyRange.endContainer;

                    rangeStart[0] === bookmarkStart.parent()[0] && dirtyRange.startOffset++;
                    rangeStart[0] === bookmarkEnd.getParent()[0] && dirtyRange.startOffset++;
                    rangeEnd[0] === bookmarkStart.getParent()[0] && dirtyRange.endOffset++;
                    rangeEnd[0] === bookmarkEnd.getParent()[0] && dirtyRange.endOffset++;
                }
            }

            return retval;
        },

        selectBookmarks : function(bookmarks) {
            var ranges = [];
            for (var i = 0; i < bookmarks.length; i++) {
                var range = new KERange(this.document);
                range.moveToBookmark(bookmarks[i]);
                ranges.push(range);
            }
            this.selectRanges(ranges);
            return this;
        },

        getCommonAncestor : function() {
            var ranges = this.getRanges(),
                startNode = ranges[ 0 ].startContainer,
                endNode = ranges[ ranges.length - 1 ].endContainer;
            return startNode._4e_commonAncestor(endNode);
        },

        // Moving scroll bar to the current selection's start position.
        scrollIntoView : function() {
            // If we have split the block, adds a temporary span at the
            // range position and scroll relatively to it.
            var start = this.getStartElement();
            start.scrollIntoView();
        }
    };


    S.Selection = KESelection;
    var nonCells = { table:1,tbody:1,tr:1 };
    var notWhitespaces = Walker.whitespaces(true);
    var fillerTextRegex = /\ufeff|\u00a0/;
    KERange.prototype.select = UA.ie ?
        // V2
        function(forceExpand) {
            var collapsed = this.collapsed;
            var isStartMarkerAlone;
            var dummySpan;

            // IE doesn't support selecting the entire table row/cell, move the selection into cells, e.g.
            // <table><tbody><tr>[<td>cell</b></td>... => <table><tbody><tr><td>[cell</td>...
            if (this.startContainer[0].nodeType == KEN.NODE_ELEMENT && this.startContainer._4e_name() in nonCells
                || this.endContainer[0].nodeType == KEN.NODE_ELEMENT && this.endContainer._4e_name() in nonCells) {
                this.shrink(KEN.NODE_ELEMENT, true);
            }

            var bookmark = this.createBookmark();

            // Create marker tags for the start and end boundaries.
            var startNode = bookmark.startNode;

            var endNode;
            if (!collapsed)
                endNode = bookmark.endNode;

            // Create the main range which will be used for the selection.
            var ieRange = this.document.body.createTextRange();

            // Position the range at the start boundary.
            ieRange.moveToElementText(startNode[0]);
            ieRange.moveStart('character', 1);

            if (endNode) {
                // Create a tool range for the end.
                var ieRangeEnd = this.document.body.createTextRange();

                // Position the tool range at the end.
                ieRangeEnd.moveToElementText(endNode[0]);

                // Move the end boundary of the main range to match the tool range.
                ieRange.setEndPoint('EndToEnd', ieRangeEnd);
                ieRange.moveEnd('character', -1);
            }
            else {
                // The isStartMarkerAlone logic comes from V2. It guarantees that the lines
                // will expand and that the cursor will be blinking on the right place.
                // Actually, we are using this flag just to avoid using this hack in all
                // situations, but just on those needed.
                var next = startNode[0].nextSibling;
                while (next && !notWhitespaces(next)) {
                    next = next.nextSibling;
                }
                isStartMarkerAlone =
                    ( !( next && next.nodeValue && next.nodeValue.match(fillerTextRegex) )     // already a filler there?
                        && ( forceExpand || !startNode[0].previousSibling ||
                        ( startNode[0].previousSibling && startNode[0].previousSibling.nodeName.toLowerCase() == 'br' ) ) );

                // Append a temporary <span>&#65279;</span> before the selection.
                // This is needed to avoid IE destroying selections inside empty
                // inline elements, like <b></b> (#253).
                // It is also needed when placing the selection right after an inline
                // element to avoid the selection moving inside of it.
                dummySpan = this.document.createElement('span');
                dummySpan.innerHTML = '&#65279;';	// Zero Width No-Break Space (U+FEFF). See #1359.
                dummySpan = new Node(dummySpan);
                dummySpan.insertBefore(startNode);

                if (isStartMarkerAlone) {
                    // To expand empty blocks or line spaces after <br>, we need
                    // instead to have any char, which will be later deleted using the
                    // selection.
                    // \ufeff = Zero Width No-Break Space (U+FEFF). (#1359)
                    new Node(this.document.createText('\ufeff')).insertBefore(startNode);
                }
            }

            // Remove the markers (reset the position, because of the changes in the DOM tree).
            this.setStartBefore(startNode);
            startNode.remove();

            if (collapsed) {
                if (isStartMarkerAlone) {
                    // Move the selection start to include the temporary \ufeff.
                    ieRange.moveStart('character', -1);
                    ieRange.select();
                    // Remove our temporary stuff.
                    this.document.selection.clear();
                } else
                    ieRange.select();
                this.moveToPosition(dummySpan, KER.POSITION_BEFORE_START);
                dummySpan.remove();
            }
            else {
                this.setEndBefore(endNode);
                endNode.remove();
                ieRange.select();
            }

            // this.document.fire('selectionchange');
        } : function() {
        var startContainer = this.startContainer;

        // If we have a collapsed range, inside an empty element, we must add
        // something to it, otherwise the caret will not be visible.
        if (this.collapsed && startContainer[0].nodeType == KEN.NODE_ELEMENT && !startContainer[0].childNodes.length)
            startContainer[0].appendChild(this.document.createTextNode(""));

        var nativeRange = this.document.createRange();
        nativeRange.setStart(startContainer[0], this.startOffset);

        try {
            nativeRange.setEnd(this.endContainer[0], this.endOffset);
        }
        catch (e) {
            // There is a bug in Firefox implementation (it would be too easy
            // otherwise). The new start can't be after the end (W3C says it can).
            // So, let's create a new range and collapse it to the desired point.
            if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
                this.collapse(true);
                nativeRange.setEnd(this.endContainer[0], this.endOffset);
            }
            else
                throw( e );
        }

        var selection = getSelection(this.document).getNative();
        selection.removeAllRanges();
        selection.addRange(nativeRange);
    };


    function getSelection(doc) {
        var sel = new KESelection(doc);
        return ( !sel || sel.isInvalid ) ? null : sel;
    }
});