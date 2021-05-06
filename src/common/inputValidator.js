require.config({
    paths: {
        // validate: 'https://cdn.jsdelivr.net/jquery.validation/1.16.0/jquery.validate.min'
        // static 폴더 상위경로 접근
        validate: '../nbextensions/visualpython/src/common/jquery.validate.min'
    },
    shim:{
        validate: ['jquery']
    }  
});

define([
    'jquery'
    , 'validate'
    // ,'additional'
], function ($) {
    "use strict";

    /**
     * @class InputValidator
     * @constructor
     * @param {*} page page object
     * @param {string} formId formTag Id
     * Usage : 
     *  var validator = new InputValidator(this, 'myFormId');
     *  validator.bindRules();
     *  ...
     *  // on validate
     *  validator.validate();
     */
    var InputValidator = function(page, formId) {
        this.page = page;
        this.formId = formId;
        this.formValidator = null;

        this.initValidateOptions();

        // FIXME: just for the demos, avoids form submit
        // $.validator.setDefaults({
        //     debug: true,
        //     success: "valid"
        // });

    }

    /**
     * initialize validation options
     */
    InputValidator.prototype.initValidateOptions = function() {
        this.validateOptions = {
            rules: {},
            messages: {},
            success: function(label) {
                label.addClass("valid").text("Ok!")
            },
            submitHandler: function(form) {
                form.submit();
            },
            // This global normalizer will trim the value of all elements
            // before validatng them.
            normalizer: function( value ) {
                return $.trim( value );
            },
            ignore: ".ignore"
        };
    }

    /**
     * bind validation rules depends on class & tag name
     */
    InputValidator.prototype.bindRules = function() {
        var page = this.page;
        var that = this;

        var rules = this.validateOptions.rules;
        var messages = this.validateOptions.messages;

        // required settings
        $(page.wrapSelector('.required')).each(function() {
            var nameOfTag = $(this).attr('name');

            // if some option already exist for this tag
            // rules
            if (nameOfTag in rules) {
                rules[nameOfTag]['required'] = true;
            } else {
                rules[nameOfTag] = {
                    required: true
                };
            }

            // custom messages
            if (nameOfTag in messages) {
                messages[nameOfTag]['required'] = 'Input required!';
            } else {
                messages[nameOfTag] = {
                    required: 'Input required!'
                }
            }
        });

        // number settings
        $(page.wrapSelector('.num')).each(function() {
            var nameOfTag = $(this).attr('name');

            // if some option already exist for this tag
            // rules
            if (nameOfTag in rules) {
                rules[nameOfTag]['number'] = true;
            } else {
                rules[nameOfTag] = {
                    number: true
                };
            }

            // custom messages
            if (nameOfTag in messages) {
                messages[nameOfTag]['number'] = 'number only';
            } else {
                messages[nameOfTag] = {
                    number: 'number only'
                }
            }
        });

        // TODO: string only


        // TODO: format rules



        // save validation options
        this.validateOptions.rules = rules;
        this.validateOptions.messages = messages;
    }

    // add custom rules
    /**
     * 
     * @param {tag object} component 
     * @param {object} rule 
     * @param {object} etcOption 
     */
    InputValidator.prototype.rules = function(component, rule, etcOption = {}) {
        var nameOfTag = component.attr('name');

        Object.assign(this.validateOptions.rules, { [nameOfTag]: rule });

        Object.assign(this.validateOptions, etcOption);
    }

    /**
     * validate and return result
     * @returns validation result : true/false
     */
    InputValidator.prototype.validate = function() {
        var page = this.page;
        var formId = this.formId;

        this.formValidator = $(page.wrapSelector('#' + formId)).validate(this.validateOptions);
        var result = this.formValidator.form();
        // TEST:
        // alert(result);
        return result;
    }

    // TEST: for validation test
    InputValidator.prototype.testOptions = function() {
        this.validateOptions = {
            rules: {
                numreq: {
                    required: true,
                    number: true
                },
                nums: {
                    number: true
                },
                dependsOnNum: {
                    depends: function(element) {
                        // return $("#num").val().length > 0;
                        return $("#num").is(":checked");
                    }
                },
                str: {
                    required: true
                }
            },
            messages: {
                numreq: {
                    required: '필수 입력 항목'
                }
            },
            success: function(label) {
                label.addClass("valid").text("Ok!")
            },
            submitHandler: function(form) {
                form.submit();
            },
            invalidHandler: function(event, validator) {
                // 'this' refers to the form
                var errors = validator.numberOfInvalids();
                if (errors) {
                    var message = errors == 1
                        ? 'You missed 1 field. It has been highlighted'
                        : 'You missed ' + errors + ' fields. They have been highlighted';
                    $("div.error span").html(message);
                    $("div.error").show();
                } else {
                    $("div.error").hide();
                }
            },
            ignore: ".ignore"
        };
    }

    

    return {
        InputValidator: InputValidator
    };
});