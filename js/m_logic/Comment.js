/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Comment.js
 *    Author          : Black Logic
 *    Note            : Logic > comment
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     : 2022. 08. 02
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
`
"""Summarize the class in one line.

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

"""
`
    const COMMENT_METHOD_TEMPLATE = 
`
"""Summarize the function in one line.

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

"""
`

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
            
            this.cmKey = 'code'; // Code Mirror Key
            this.selectBoxClassName = 'vp-ct-option'; // Select Box ClassName

            this.state = {
                code: COMMENT_DEFAULT_CODE,
                ...this.state
            };

            this.cmTemplates = { // a kind of templates
                Template : COMMENT_DEFAULT_CODE,
                Class : COMMENT_CLASS_TEMPLATE,
                Method : COMMENT_METHOD_TEMPLATE
            }
            
            this._addCodemirror(this.cmKey, this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            
            var commentTemplates = this.cmTemplates;
            var cm_key = this.cmKey;
            let cmCodeListTemp = this.cmCodeList;
            
            // Select box change Event
            $('.' + this.selectBoxClassName).on('change', function(){
                // get code mirror object
                let targetCmObj = cmCodeListTemp.filter(obj => obj.key == cm_key);
                var templateOption = $(this).val();
                let cm = targetCmObj[0].cm;

                // Change Code Mirror Text
                if(templateOption == 'vp_template_class'){
                    cm.setValue(commentTemplates.Class);
                }else if(templateOption == 'vp_template_method'){
                    cm.setValue(commentTemplates.Method);
                }else if(templateOption == 'vp_template_template'){
                    cm.setValue(commentTemplates.Template);
                }
                
                cm.save();
            });
            
        }


        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendFormatLine('<textarea name="code" class="code vp-state" id="code">{0}</textarea>'
                                , this.state.code);
            // add select box
            page.appendFormatLine('<select class="vp-select w100 {0}" >', this.selectBoxClassName);
            // add options
            Object.entries(this.cmTemplates).forEach(([opt, t_code]) => {
                page.appendFormatLine('<option value="{0}">{1}</option>',
                                        'vp_template_' + opt.toLowerCase(), opt);
            });
            page.appendFormatLine('</select>');
            
            return page.toString();
        }

        open() {
            super.open();

            if (this.state.code === COMMENT_DEFAULT_CODE) {
                
                let cmObj = this.getCodemirror(this.cmKey);
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