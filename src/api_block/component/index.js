define([
    './option/class_option.js'
  , './option/def_option.js'
  , './option/if_option.js'    
  , './option/elif_option.js'   

  , './option/for_option.js' 
  
  , './option/import_option.js'   
  , './option/lambda_option.js'
  , './option/while_option.js'
 
  , './option/except_option.js'
  , './option/none_option.js'

  , './option/code_option.js'
  , './option/break_option.js'
  , './option/continue_option.js'
  , './option/pass_option.js'
  , './option/property_option.js'
  , './option/comment_option.js'
  , './option/return_option.js'
  , './option/node_option.js'
  , './option/text_option.js'

  , './boardMenuBar.js'
  , './option/api_option.js'
], function ( InitClassBlockOption
            , InitDefBlockOption 
            , InitIfBlockOption
            , InitElifBlockOption
 

            , InitForBlockOption
       
            , InitImportBlockOption
            , InitLambdaBlockOption
            , InitWhileBlockOption
      
            , InitExceptBlockOption
            , InitNoneOption
            , InitCodeBlockOption
            , InitReturnBlockOption

            , InitNodeBlockOption
            , InitTextBlockOption

            , InitBoardMenuBar
            , ApiBlockOption  ) {
  
  const { InitApiBlockOption, LoadApiBlockOption } = ApiBlockOption;

  return {
      InitClassBlockOption
      , InitDefBlockOption 
      , InitIfBlockOption
      , InitElifBlockOption

      
      , InitForBlockOption
      , InitListForBlockOption

      , InitImportBlockOption
      , InitLambdaBlockOption
      , InitWhileBlockOption

      , InitExceptBlockOption
      , InitNoneOption

      , InitCodeBlockOption
      , InitReturnBlockOption
      
      , InitNodeBlockOption
      , InitTextBlockOption
      
      , InitBoardMenuBar
      , InitApiBlockOption
      , LoadApiBlockOption
  }
});
