/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Comment.js
 *    Author          : Black Logic
 *    Note            : Logic > comment
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Comment
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, PopupComponent) {

    const COMMENT_DEFAULT_CODE = '# Write down comments'
    // Templates from NumPy Style Python Docstrings.
    const COMMENT_CLASS_TEMPLATE = 
`"""Summarize the class in one line.
Several sentences ...
providing an extended description.
Note
----------
Note about this class.
Parameters
----------
param1 : param_type
    Parameter description.
param2 : param_type
    Parameter description.
Attributes
----------
attr1 : attr_type
    Attibute description.
attr2 : attr_type
    Attibute description.
Examples
----------
    
References
----------
"""`
    const COMMENT_METHOD_TEMPLATE = 
`"""Summarize the function in one line.
Several sentences ...
providing an extended description.
Parameters
----------
param1 : param_type
    Parameter description.
param2 : param_type
    Parameter description.
Returns
-------
return_type
    Return description.
Note
----------
Examples
----------
"""`

    /**
     * Comment
     */
    class Comment extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;
            this.config.saveOnly = true;
            this.selectBoxClassName = 'vp-ct-option';  // Select Box ClassName
            this.selectOptionPrefix = 'vp_template_';  // Select Options Class Prefix Name

            this.state = {
                v1: {"name": "Default", "code": COMMENT_DEFAULT_CODE},
                v2 : {"name": "Class", "code": COMMENT_CLASS_TEMPLATE},
                v3 : {"name": "Method", "code": COMMENT_METHOD_TEMPLATE},
                ...this.state
            }
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            
            var commentTemplates = this.state;
            let cmCodeListTemp = this.cmCodeList;
            
            $('.' + this.selectBoxClassName).on('change', function(){
                // get code mirror object
                let targetCmObj = cmCodeListTemp.filter(obj => obj.key == 'code');
                let cm = targetCmObj[0].cm;
                var templateOption = $(this).val();
                
                // Change Code Mirror Text
                if(templateOption == commentTemplates.v1['name']){
                    cm.setValue(commentTemplates.v1['code']);
                }else if(templateOption == commentTemplates.v2['name']){
                    cm.setValue(commentTemplates.v2['code']);
                }else if(templateOption == commentTemplates.v3['name']){
                    cm.setValue(commentTemplates.v3['code']);
                }
                cm.save();
            });
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendFormatLine('<textarea name="code" class="code vp-state" id="code">{0}</textarea>'
                                , this.state.v1['code']);

            // add select box
            page.appendFormatLine('<select class="vp-select w100 {0}" >', this.selectBoxClassName);
            for (var key in this.state) {
                var optionName = this.state[key]['name'];
                page.appendFormatLine('<option value="{0}" id="{1}">{2}</option>',
                                        optionName,
                                        this.selectOptionPrefix + optionName,
                                        optionName);
            }
            page.appendFormatLine('</select>');
            
            return page.toString();
        }

        open() {
            super.open();

            if (this.state.code === COMMENT_DEFAULT_CODE) {
                // set default selection
                let cmObj = this.getCodemirror('code');
                if (cmObj && cmObj.cm) {
                    cmObj.cm.setSelection({ line: 0, ch: 2 }, { line: 0 });
                    cmObj.cm.focus();
                }
            }
        }

        generateCode() {
            return this.state.code;
        }

    }

    return Comment;
});