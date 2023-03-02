define([
], function () {
    /**
     * name
     * library
     * description
     * code
     * options: [
     *      {
     *          name
     *          label
     *          [optional]
     *          output: true (default: false/undefined)
     *              - output variable name list to print line to display `ex usage) df = ... /n df`
     *          component : []
     *              - input / input_number / data_select / bool_select
     *              - 1darr / 2darr / ndarr / scalar / param / dtype / tabblock
     *          default
     *          required
     *          usePair
     *          code
     *          varType
     *          
     *      }
     * ]
     */
    var PANDAS_FUNCTION = {
      "pdPdo_series": {
        "name": "Series",
        "library": "pandas",
        "description": "1 dimension array with same data types",
        "code": "${o0} = pd.Series(${i0}${index}${name})",
        "options": [
          {
            "name": "i0",
            "label": "Data",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "index",
            "label": "Index",
            "usePair": true
          },
          {
            "name": "name",
            "label": "Series Name",
            "type": "text",
            "usePair": true
          }
        ]
      },
      "pdPdo_dataframe": {
        "name": "DataFrame",
        "library": "pandas",
        "description": "2 dimension data table type pandas variable",
        "code": "${o0} = pd.DataFrame(${i0}${index}${columns})",
        "options": [
          {
            "name": "i0",
            "label": "Data",
            "required": true,
            "component": [
              "table"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "index",
            "label": "Index List",
            "usePair": true
          },
          {
            "name": "columns",
            "label": "Column List",
            "usePair": true
          }
        ]
      },
      "pdPdo_index": {
        "name": "Index",
        "library": "pandas",
        "description": "Create index object",
        "code": "${o0} = pd.Index(${data}${dtype}${copy}${name}${tupleize_cols})",
        "options": [
          {
            "name": "data",
            "label": "Data",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "dtype",
            "label": "Numpy Dtype",
            "component": [
              "option_select"
            ],
            "options": [
              "'object'",
              "None",
              "'int32'",
              "'int64'",
              "'float32'",
              "'float64'",
              "'string'",
              "'complex64'",
              "'bool'"
            ],
            "default": "'object'",
            "usePair": true
          },
          {
            "name": "copy",
            "label": "Copy",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "name",
            "label": "Index Name",
            "usePair": true
          },
          {
            "name": "tupleize_cols",
            "label": "Create Multiindex",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pd004": {
        "name": "Read CSV",
        "library": "pandas",
        "description": "",
        "code": "${o0} = pd.read_csv(${i0}${encoding}${header}${sep}${names}${usecols}${index_col}${na_values}${skiprows}${chunksize}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "File Path",
            "required": true,
            "type": "text",
            "component": [
              "file"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "encoding",
            "label": "Encoding",
            "type": "text",
            "usePair": true
          },
          {
            "name": "header",
            "label": "Header",
            "component": [
              "option_suggest"
            ],
            "options": [
              "None",
              "0"
            ],
            "usePair": true
          },
          {
            "name": "sep",
            "label": "Seperator",
            "type": "text",
            "usePair": true
          },
          {
            "name": "names",
            "label": "Columns",
            "usePair": true
          },
          {
            "name": "usecols",
            "label": "Column List To Use",
            "usePair": true
          },
          {
            "name": "index_col",
            "label": "Column To Use As Index",
            "usePair": true
          },
          {
            "name": "na_values",
            "label": "Na Values",
            "usePair": true
          },
          {
            "name": "skiprows",
            "label": "Rows To Skip",
            "usePair": true
          },
          {
            "name": "chunksize",
            "label": "Chunksize",
            "usePair": true
          }
        ]
      },
      "pd005": {
        "name": "To CSV",
        "library": "pandas",
        "description": "dataframe to csv",
        "code": "${i0}.to_csv(${i1}${encoding}${header}${index}${sep}${na_rep}${columns}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "DataFrame",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "File Path",
            "required": true,
            "type": "text",
            "component": [
              "file"
            ]
          },
          {
            "name": "encoding",
            "label": "Encoding",
            "type": "text",
            "usePair": true
          },
          {
            "name": "header",
            "label": "Header",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "index",
            "label": "Index",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "sep",
            "label": "Seperator",
            "type": "text",
            "usePair": true
          },
          {
            "name": "na_rep",
            "label": "Na Replacing Value",
            "type": "text",
            "usePair": true
          },
          {
            "name": "columns",
            "label": "Columns",
            "usePair": true
          }
        ]
      },
      "pdFunc_merge": {
        "name": "Merge",
        "library": "pandas",
        "description": "Merge 2 objects",
        "code": "${o0} = pd.merge(${i0}, ${i1}${left_on}${right_on}${how}${sort})",
        "options": [
          {
            "name": "i0",
            "label": "Left Dataframe",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "i1",
            "label": "Right Dataframe",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "left_on",
            "label": "Left Key",
            "type": "text",
            "usePair": true
          },
          {
            "name": "right_on",
            "label": "Right Key",
            "type": "text",
            "usePair": true
          },
          {
            "name": "how",
            "label": "Merge Type",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "left",
              "right",
              "inner",
              "outer"
            ],
            "usePair": true
          },
          {
            "name": "sort",
            "label": "Sort",
            "usePair": true
          }
        ]
      },
      "pd009": {
        "name": "Join",
        "library": "pandas",
        "description": "Merge multiple objects",
        "code": "${o0} = ${i0}.join(${i1}${on}${how}${sort}${lsuffix}${rsuffix})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "i1",
            "label": "Dataframe To Join",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "on",
            "label": "Key",
            "type": "text",
            "usePair": true
          },
          {
            "name": "how",
            "label": "Type",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "left",
              "right",
              "inner",
              "outer"
            ],
            "usePair": true
          },
          {
            "name": "sort",
            "label": "Sort",
            "component": [
              "bool_select"
            ],
            "usePair": true
          },
          {
            "name": "lsuffix",
            "label": "Left Suffix",
            "type": "text",
            "usePair": true
          },
          {
            "name": "rsuffix",
            "label": "Right Suffix",
            "type": "text",
            "usePair": true
          }
        ]
      },
      "pdFunc_concat": {
        "name": "Concat",
        "library": "pandas",
        "description": "Merge multiple objects",
        "code": "${o0} = pd.concat([${i0}]${index}${axis}${sort}${join})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "var_multi"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "index",
            "label": "Index List",
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "help": "0:row / 1:column",
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "sort",
            "label": "Sort",
            "component": [
              "bool_select"
            ],
            "usePair": true
          },
          {
            "name": "join",
            "label": "Join",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "inner",
              "outer"
            ],
            "usePair": true
          }
        ]
      },
      "pdSdt_sortByIndex": {
        "name": "Sort By Index",
        "library": "pandas",
        "description": "Sort by index",
        "code": "${o0} = ${i0}.sort_index(${axis}${ascending}${inplace}${kind})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Sort By",
            "component": [
              "option_select"
            ],
            "help": "0:row / 1:column",
            "default": 0,
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "ascending",
            "label": "Ascending Sort",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "inplace",
            "label": "Inplace",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "kind",
            "label": "Sort Kind",
            "type": "text",
            "component": [
              "option_select"
            ],
            "default": "quicksort",
            "options": [
              "quicksort",
              "mergesort",
              "heapsort"
            ],
            "options_label": [
              "quicksort",
              "mergesort",
              "heapsort"
            ],
            "usePair": true
          }
        ]
      },
      "pdGrp_groupby": {
        "name": "Group By",
        "library": "pandas",
        "description": "Group DataFrame/Series",
        "code": "${o0} = ${i0}.groupby(${level}${axis}${sort}${as_index})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "level",
            "label": "Grouping Column",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "help": "0:row / 1:column",
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "sort",
            "label": "Sort",
            "component": [
              "bool_select"
            ],
            "usePair": true
          },
          {
            "name": "as_index",
            "label": "Remove Index",
            "component": [
              "bool_select"
            ],
            "help": "same as reset_index()",
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pdParr_period": {
        "name": "Period",
        "library": "pandas",
        "description": "Create Period object",
        "code": "${o0} = pd.Period(${i0}${freq}${year}${month}${day})",
        "options": [
          {
            "name": "i0",
            "label": "Date",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "freq",
            "label": "Frequency",
            "component": [
              "option_select"
            ],
            "options": [
              "s",
              "T",
              "H",
              "D",
              "B",
              "W",
              "W-MON",
              "M"
            ],
            "options_label": [
              "second",
              "minute",
              "hour",
              "day",
              "weekdays",
              "week(Sunday)",
              "week(Monday)",
              "last day of month"
            ],
            "usePair": true
          },
          {
            "name": "year",
            "label": "Year",
            "index": 1,
            "usePair": true
          },
          {
            "name": "month",
            "label": "Month",
            "index": 2,
            "usePair": true
          },
          {
            "name": "day",
            "label": "Day",
            "index": 3,
            "usePair": true
          }
        ]
      },
      "pdFunc_dropNA": {
        "name": "Drop NA",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.dropna(${axis}${how}${thresh})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "help": "0:row / 1:column",
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "how",
            "label": "How",
            "type": "text",
            "component": [
              "option_select"
            ],
            "help": "any: drop if na exist more than one\nall: drop if na exist every row/column",
            "options": [
              "any",
              "all"
            ],
            "usePair": true
          },
          {
            "name": "thresh",
            "label": "Na Minimum Standard",
            "usePair": true
          }
        ]
      },
      "pdFunc_fillNA": {
        "name": "Fill NA",
        "library": "pandas",
        "description": "replace null using value",
        "code": "${o0} = ${i0}.fillna(${value}${axis}${method}${inplace}${limit})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "value",
            "label": "Value To Fill",
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "help": "0:row / 1:column",
            "default": 0,
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "method",
            "label": "How",
            "component": [
              "option_select"
            ],
            "help": "ffill:fill with before value\nbfill:fill with after value",
            "default": "None",
            "options": [
              "None",
              "'ffill'",
              "'bfill'"
            ],
            "usePair": true
          },
          {
            "name": "inplace",
            "label": "Inplace",
            "component": [
              "bool_select"
            ],
            "usePair": true
          },
          {
            "name": "limit",
            "label": "Gap Limit",
            "usePair": true
          }
        ]
      },
      "pdFunc_isDuplicated": {
        "name": "Get Duplicates",
        "library": "pandas",
        "description": "Get duplicates",
        "code": "${o0} = ${i0}.duplicated(${keep})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "keep",
            "label": "Mark Duplicated When",
            "component": [
              "option_select"
            ],
            "default": "'first'",
            "options": [
              "'first'",
              "'last'",
              "False"
            ],
            "usePair": true
          }
        ]
      },
      "pdFunc_dropDuplicates": {
        "name": "Drop Duplicates",
        "library": "pandas",
        "description": "Drop duplicates",
        "code": "${o0} = ${i0}.drop_duplicates(${keep})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "keep",
            "label": "Mark Duplicated When",
            "component": [
              "option_select"
            ],
            "default": "'first'",
            "options": [
              "'first'",
              "'last'",
              "False"
            ],
            "usePair": true
          }
        ]
      },
      "pdFunc_replace": {
        "name": "Scala Replace",
        "library": "pandas",
        "description": "Replace scala value",
        "code": "${o0} = ${i0}.replace(${to_replace}${value}${method})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "to_replace",
            "label": "To Replace",
            "usePair": true
          },
          {
            "name": "value",
            "label": "Replace Value",
            "usePair": true
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "options": [
              "'ffill'",
              "'bfill'",
              "None"
            ],
            "default": "'ffill'",
            "usePair": true
          }
        ]
      },
      "pd019": {
        "name": "List-like Replace",
        "library": "pandas",
        "description": "Replace values using list",
        "code": "${o0} = ${i0}.replace(${to_replace}${value}${method})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "to_replace",
            "label": "To Replace",
            "usePair": true
          },
          {
            "name": "value",
            "label": "Value",
            "usePair": true
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "options": [
              "'ffill'",
              "'bfill'",
              "None"
            ],
            "default": "'ffill'",
            "usePair": true
          }
        ]
      },
      "pd020": {
        "name": "Dict-like Replace",
        "library": "pandas",
        "description": "Replace values using dictionary",
        "code": "${o0} = ${i0}.replace(${to_replace}${value}${method})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "to_replace",
            "label": "To Replace",
            "usePair": true
          },
          {
            "name": "value",
            "label": "Value",
            "usePair": true
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "options": [
              "'ffill'",
              "'bfill'",
              "None"
            ],
            "default": "'ffill'",
            "usePair": true
          }
        ]
      },
      "pd021": {
        "name": "Regular Expression Replace",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.replace(${to_replace}${value}${method}${regex})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "to_replace",
            "label": "To Replace",
            "usePair": true
          },
          {
            "name": "value",
            "label": "Value",
            "usePair": true
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "options": [
              "'ffill'",
              "'bfill'",
              "None"
            ],
            "default": "'ffill'",
            "usePair": true
          },
          {
            "name": "regex",
            "label": "Regex",
            "options": [
              true,
              false
            ],
            "usePair": true
          }
        ]
      },
      "pdGrp_sum": {
        "name": "Sum",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.sum(${axis}${skipna}${level})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          }
        ]
      },
      "pdGrp_mean": {
        "name": "Mean",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.mean(${axis}${skipna}${level})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          }
        ]
      },
      "pdGrp_count": {
        "name": "Count",
        "library": "pandas",
        "description": "Count except NA values",
        "code": "${o0} = ${i0}.count(${axis}${skipna}${level})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          }
        ]
      },
      "pdGrp_max": {
        "name": "Max",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.max(${axis}${skipna}${level})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          }
        ]
      },
      "pdGrp_min": {
        "name": "Min",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.min(${axis}${skipna}${level})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          }
        ]
      },
      "pdGrp_median": {
        "name": "Median",
        "library": "pandas",
        "description": "Median(50%)",
        "code": "${o0} = ${i0}.median(${axis}${skipna}${level}${numeric_only})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "numeric_only",
            "label": "Numeric Only",
            "component": [
              "option_select"
            ],
            "var_type": [
              "DataFrame"
            ],
            "default": "None",
            "options": [
              "None",
              "'false'",
              "'true'"
            ],
            "usePair": true
          }
        ]
      },
      "pdGrp_std": {
        "name": "Std",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.std(${axis}${skipna}${level}${numeric_only})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na Value",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "numeric_only",
            "label": "Numeric Only",
            "component": [
              "option_select"
            ],
            "var_type": [
              "DataFrame"
            ],
            "default": "None",
            "options": [
              "None",
              "'false'",
              "'true'"
            ],
            "usePair": true
          }
        ]
      },
      "pdGrp_quantile": {
        "name": "Quantile",
        "library": "pandas",
        "description": "Calculate quantile between 0 and 1",
        "code": "${o0} = ${i0}.quantile(${q}${axis}${numeric_only}${interpolation})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "q",
            "label": "Percentile",
            "placeholder": "(0 ~ 1)",
            "description": "",
            "default": 0.5,
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "numeric_only",
            "label": "Numeric Only",
            "component": [
              "option_select"
            ],
            "var_type": [
              "DataFrame"
            ],
            "options": [
              "False",
              "True"
            ],
            "usePair": true
          },
          {
            "name": "interpolation",
            "label": "Interpolation",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "linear",
              "lower",
              "higher",
              "nearest",
              "midpoint"
            ],
            "default": "linear",
            "usePair": true
          }
        ]
      },
      "pdEdtRC_dropRowCol": {
        "name": "Drop Row/Column",
        "library": "pandas",
        "description": "Drop row and column",
        "code": "${o0} = ${i0}.drop(${i1}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Index",
            "required": true,
            "var_type": [
              "column",
              "index"
            ],
            "var_para": [
              "i0"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          }
        ]
      },
      "pd031": {
        "name": "date_range",
        "library": "pandas",
        "description": "Create DatetimeIndex type timestamp",
        "code": "${o0} = pd.date_range(${start}${end}${periods}${freq})",
        "options": [
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "start",
            "label": "Start Date",
            "type": "text",
            "placeholder": "yyyy-MM-dd",
            "usePair": true
          },
          {
            "name": "end",
            "label": "End Date",
            "type": "text",
            "placeholder": "yyyy-MM-dd",
            "usePair": true
          },
          {
            "name": "periods",
            "label": "Periods",
            "help": "input number of date index to create",
            "usePair": true
          },
          {
            "name": "freq",
            "label": "Frequency",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "s",
              "T",
              "H",
              "D",
              "B",
              "W",
              "W-MON",
              "MS",
              "M",
              "BMS",
              "BM"
            ],
            "options_label": [
              "second",
              "minute",
              "hour",
              "day",
              "weekdays",
              "week(Sunday)",
              "week(Monday)",
              "first day of month",
              "last day of month",
              "first weekday of month",
              "last weekday of month"
            ],
            "usePair": true
          }
        ]
      },
      "pdSdt_sortByValues": {
        "name": "Sort By Values",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.sort_values(${by}${axis}${ascending}${inplace}${kind})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "by",
            "label": "Sort By",
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "help": "0:Row / 1:Column",
            "default": 0,
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "ascending",
            "label": "Ascending",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "inplace",
            "label": "Inplace",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "kind",
            "label": "Sort Type",
            "type": "text",
            "component": [
              "option_select"
            ],
            "default": "quicksort",
            "options": [
              "quicksort",
              "mergesort",
              "heapsort"
            ],
            "usePair": true
          }
        ]
      },
      "pdFunc_isNull": {
        "name": "Is Null",
        "library": "pandas",
        "description": "Find null",
        "code": "${o0} = pd.isnull(${i0})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdFunc_notNull": {
        "name": "Not Null",
        "library": "pandas",
        "description": "Find not null",
        "code": "${o0} = pd.notnull(${i0})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_transpose": {
        "name": "Transpose",
        "library": "pandas",
        "description": "Transpose row and column",
        "code": "${o0} = ${i0}.T",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_columns": {
        "name": "Get columns",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.columns",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_index": {
        "name": "Get index",
        "library": "pandas",
        "description": "Get index",
        "code": "${o0} = ${i0}.index",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_values": {
        "name": "Values",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.values",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd039": {
        "name": "name",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.name",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd040": {
        "name": "Loc",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.loc[${i1}]",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Row/Column Name To Find",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd041": {
        "name": "iLoc",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.iloc[${i1}]",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "row/column to count",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd042": {
        "name": "array",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.array",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd043": {
        "name": "axes",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.axes",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd044": {
        "name": "hasnans",
        "library": "pandas",
        "description": "Check if it has NaN values",
        "code": "${o0} = ${i0}.hasnans",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd045": {
        "name": "shape",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.shape",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd046": {
        "name": "dtype",
        "library": "pandas",
        "description": "Check data type of Index",
        "code": "${o0} = ${i0}.dtype",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_len": {
        "name": "Length",
        "library": "pandas",
        "description": "",
        "code": "${o0} = len(${i0})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_unique": {
        "name": "Unique",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.unique()",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_valueCounts": {
        "name": "get data counts",
        "library": "pandas",
        "description": "get data value counts",
        "code": "${o0} = ${i0}.value_counts()",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_info": {
        "name": "Info",
        "library": "pandas",
        "description": "DataFrame info(info per columns, data type, memory usage, ...)",
        "code": "${o0} = ${i0}.info()",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_describe": {
        "name": "Describe",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.describe()",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd052": {
        "name": "Add",
        "library": "pandas",
        "description": "DataFrame/Series addition",
        "code": "${o0} = ${i0}.add(${i1}${axis}${level}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Adding Object",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "Row(index)",
              "Col(columns)"
            ],
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pd053": {
        "name": "Subtract",
        "library": "pandas",
        "description": "DataFrame/Series subtraction",
        "code": "${o0} = ${i0}.sub(${i1}${axis}${level}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Subtracting Object",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "Index",
              "Columns"
            ],
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pd054": {
        "name": "Divide",
        "library": "pandas",
        "description": "DataFrame/Series division",
        "code": "${o0} = ${i0}.div(${i1}${axis}${level}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Dividing Object",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "Index",
              "Columns"
            ],
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pd055": {
        "name": "Multiply",
        "library": "pandas",
        "description": "DataFrame/Series multipy",
        "code": "${o0} = ${i0}.mul(${i1}${axis}${level}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "DataFrame/Series",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "Index",
              "Columns"
            ],
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pdEdtRC_insertColumn": {
        "name": "Insert Column",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.insert(${loc}${column}${value}${allow_duplicates})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "loc",
            "label": "Location",
            "usePair": true
          },
          {
            "name": "column",
            "label": "Column Name",
            "usePair": true
          },
          {
            "name": "value",
            "label": "Value",
            "usePair": true
          },
          {
            "name": "allow_duplicates",
            "label": "Allow Duplicates",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          }
        ]
      },
      "pd057": {
        "name": "Insert Column Value",
        "library": "pandas",
        "description": "",
        "code": "${i0}[${i1}] = ${i2}",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "i1",
            "label": "Column Name",
            "required": true,
            "type": "text",
            "var_type": [
              "columns"
            ]
          },
          {
            "name": "i2",
            "label": "Value",
            "required": true
          }
        ]
      },
      "pdEdtRC_insertRow": {
        "name": "Insert Row Value",
        "library": "pandas",
        "description": "",
        "code": "${i0}.loc[${i1}] = ${i2}",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "i1",
            "label": "Row Name/Index",
            "required": true,
            "var_type": [
              "index"
            ]
          },
          {
            "name": "i2",
            "label": "Value",
            "required": true
          }
        ]
      },
      "pdGrp_groups": {
        "name": "Groups",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.groups",
        "options": [
          {
            "name": "i0",
            "label": "GroupBy Object",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdFunc_reindex": {
        "name": "Reindex",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.reindex(${labels}${index}${columns}${axis}${method})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "labels",
            "label": "New Labels",
            "usePair": true
          },
          {
            "name": "index",
            "label": "New Indexes",
            "usePair": true
          },
          {
            "name": "columns",
            "label": "New Columns",
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "method",
            "label": "Method",
            "type": "text",
            "component": [
              "option_select"
            ],
            "help": "ffill:fill with front value\nbfill:fill with back value",
            "options": [
              "ffill",
              "bfill",
              "nearest"
            ],
            "usePair": true
          }
        ]
      },
      "pdFunc_setIndex": {
        "name": "Set Index Values",
        "library": "pandas",
        "description": "create index using column",
        "code": "${o0} = ${i0}.set_index(${keys}${drop}${append}${inplace})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "keys",
            "label": "Keys",
            "usePair": true
          },
          {
            "name": "drop",
            "label": "Drop",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "append",
            "label": "Append",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "inplace",
            "label": "Inplace",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          }
        ]
      },
      "pdFunc_resetIndex": {
        "name": "Reset Index Values",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.reset_index(${level}${drop}${inplace})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "level",
            "label": "Level",
            "default": "None",
            "usePair": true
          },
          {
            "name": "drop",
            "label": "Drop",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "inplace",
            "label": "Inplace",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          }
        ]
      },
      "pd063": {
        "name": "Edit Row Data",
        "library": "pandas",
        "description": "",
        "code": "${i0}[${i1}] = ${i2}",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Column Name",
            "required": true
          },
          {
            "name": "i2",
            "label": "Value",
            "required": true
          }
        ]
      },
      "pdIdt_head": {
        "name": "Head",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.head(${n})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "n",
            "label": "Count",
            "default": 5,
            "usePair": true
          }
        ]
      },
      "pdIdt_tail": {
        "name": "Tail",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.tail(${n})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "n",
            "label": "Count",
            "default": 5,
            "usePair": true
          }
        ]
      },
      "pdIdt_take": {
        "name": "Take",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.take(${i1}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "i1",
            "label": "Search Index",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1,
              "None"
            ],
            "options_label": [
              "Row",
              "Column",
              "None"
            ],
            "default": 0,
            "usePair": true
          }
        ]
      },
      "pd067": {
        "name": "+",
        "library": "pandas",
        "description": "Addition",
        "code": "${o0} = ${i0} + ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd068": {
        "name": "-",
        "library": "pandas",
        "description": "Subtract",
        "code": "${o0} = ${i0} - ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd069": {
        "name": "*",
        "library": "pandas",
        "description": "Multiply",
        "code": "${o0} = ${i0} * ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd070": {
        "name": "power",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0} ** ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd071": {
        "name": "/",
        "library": "pandas",
        "description": "Divide",
        "code": "${o0} = ${i0} / ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd072": {
        "name": "//",
        "library": "pandas",
        "description": "Quotient",
        "code": "${o0} = ${i0} // ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd073": {
        "name": "%",
        "library": "pandas",
        "description": "Remainder",
        "code": "${o0} = ${i0} % ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd074": {
        "name": "bool",
        "library": "pandas",
        "description": "bool",
        "code": "${o0} = ${i0} ${i2} ${i1}",
        "options": [
          {
            "name": "i0",
            "label": "Variable 1",
            "required": true
          },
          {
            "name": "i1",
            "label": "Variable 2",
            "required": true
          },
          {
            "name": "i2",
            "label": "Operator",
            "required": true,
            "component": [
              "option_select"
            ],
            "options": [
              "==",
              "!=",
              "<",
              "<=",
              ">",
              ">="
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdPdo_copy": {
        "name": "copy",
        "library": "pandas",
        "description": "Copy data",
        "code": "${o0} = ${i0}.copy(${deep})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "deep",
            "label": "Deep",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pd076": {
        "name": "Read Json",
        "library": "pandas",
        "description": "json to pandas object",
        "code": "${o0} = pd.read_json(${i0}${typ}${orient}${convert_dates}${index_col}${encoding}${chunksize}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "File Path",
            "required": true,
            "type": "text",
            "component": [
              "file"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "typ",
            "label": "Type",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "frame",
              "series"
            ],
            "default": "frame",
            "usePair": true
          },
          {
            "name": "orient",
            "label": "JSON Orient",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "split",
              "records",
              "index",
              "columns",
              "values",
              "table"
            ],
            "default": "columns",
            "usePair": true
          },
          {
            "name": "convert_dates",
            "label": "Convert Dates",
            "usePair": true
          },
          {
            "name": "index_col",
            "label": "Indexing Column",
            "type": "text",
            "usePair": true
          },
          {
            "name": "encoding",
            "label": "Encoding",
            "type": "text",
            "default": "utf-8",
            "usePair": true
          },
          {
            "name": "chunksize",
            "label": "Chunk Size",
            "usePair": true
          }
        ]
      },
      "pd077": {
        "name": "To Json",
        "library": "pandas",
        "description": "DataFrame/Series to Json file",
        "code": "${o0} = ${i0}.to_json(${path_or_buf}${orient}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "DataFrame",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "path_or_buf",
            "label": "file path/variable",
            "type": "text",
            "usePair": true
          },
          {
            "name": "orient",
            "label": "Orient",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "split",
              "records",
              "index",
              "table",
              "columns",
              "values"
            ],
            "usePair": true
          }
        ]
      },
      "pd078": {
        "name": "To Pickle",
        "library": "pandas",
        "description": "DataFrame/Series to Pickle file",
        "code": "${i0}.to_pickle(${path}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "DataFrame",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "path",
            "label": "file path/variable",
            "required": true,
            "type": "text"
          }
        ]
      },
      "pd079": {
        "name": "Read Pickle",
        "library": "pandas",
        "description": "Pickle to pandas object",
        "code": "${o0} = pd.read_pickle(${i0}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "file path/object",
            "required": true,
            "type": "text",
            "component": [
              "file"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdFunc_combineFirst": {
        "name": "Combine First",
        "library": "pandas",
        "description": "Use same position of target data as substitue value for missing value",
        "code": "${o0} = ${i0}.combine_first(${i1})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Combine Object",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdFunc_stack": {
        "name": "Stack",
        "library": "pandas",
        "description": "Add column to index level",
        "code": "${o0} = ${i0}.stack(${level}${dropna})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "level",
            "label": "Level",
            "default": -1,
            "usePair": true
          },
          {
            "name": "dropna",
            "label": "Drop Na",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pdFunc_unstack": {
        "name": "Unstack",
        "library": "pandas",
        "description": "Convert specific index level to column",
        "code": "${o0} = ${i0}.unstack(${level}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "level",
            "label": "Level",
            "default": -1,
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pdFunc_pivot": {
        "name": "Pivot",
        "library": "pandas",
        "description": "Pivot data",
        "code": "${o0} = ${i0}.pivot(${index}${columns}${values})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "index",
            "label": "Index",
            "usePair": true
          },
          {
            "name": "columns",
            "label": "Columns",
            "usePair": true
          },
          {
            "name": "values",
            "label": "Values",
            "usePair": true
          }
        ]
      },
      "pdFunc_melt": {
        "name": "Melt",
        "library": "pandas",
        "description": "Melt data",
        "code": "${o0} = ${i0}.melt(${id_vars}${value_vars}${var_name}${value_name}${col_level})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "id_vars",
            "label": "Id Variables",
            "usePair": true
          },
          {
            "name": "value_vars",
            "label": "Value Variables",
            "usePair": true
          },
          {
            "name": "var_name",
            "label": "Variable Name",
            "usePair": true
          },
          {
            "name": "value_name",
            "label": "Value Name",
            "usePair": true
          },
          {
            "name": "col_level",
            "label": "Column Level",
            "usePair": true
          }
        ]
      },
      "pd085": {
        "name": "Map",
        "library": "pandas",
        "description": "Map data using function or argument",
        "code": "${o0} = ${i0}.map(${arg}${na_action})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "arg",
            "label": "Mapping Arguments",
            "usePair": true
          },
          {
            "name": "na_action",
            "label": "Na Action",
            "component": [
              "option_select"
            ],
            "options": [
              "None",
              "'ignore'"
            ],
            "options_label": [
              "None",
              "Ignore NA"
            ],
            "default": "None",
            "usePair": true
          }
        ]
      },
      "pd086": {
        "name": "Apply",
        "library": "pandas",
        "description": "Change data using function",
        "code": "${o0} = ${i0}.apply(${func}${axis}${raw})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy",
              "Rolling"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "func",
            "label": "Function",
            "component": [
              "data_select"
            ],
            "var_type": [
              "function"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          },
          {
            "name": "raw",
            "label": "Raw",
            "component": [
              "option_select"
            ],
            "default": "False",
            "options": [
              "False",
              "True"
            ],
            "options_label": [
              "Series",
              "ndarray"
            ],
            "usePair": true
          }
        ]
      },
      "pd087": {
        "name": "ApplyMap",
        "library": "pandas",
        "description": "Map data using function",
        "code": "${o0} = ${i0}.applymap(${i1})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "i1",
            "label": "Function",
            "required": true,
            "var_type": [
              "function"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd088": {
        "name": "Cut",
        "library": "pandas",
        "description": "Cut data for ranging",
        "code": "${o0} = pd.cut(${i0}, ${i1}${right}${labels}${precision})",
        "options": [
          {
            "name": "i0",
            "label": "1-dimension Array",
            "required": true
          },
          {
            "name": "i1",
            "label": "Divide By",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "right",
            "label": "Include Right",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "labels",
            "label": "Labels",
            "usePair": true
          },
          {
            "name": "precision",
            "label": "Precision",
            "default": 3,
            "usePair": true
          }
        ]
      },
      "pd089": {
        "name": "Qcut",
        "library": "pandas",
        "description": "Q-cut",
        "code": "${o0} = pd.qcut(${i0}, ${i1}${labels}${precision})",
        "options": [
          {
            "name": "i0",
            "label": "List/Series",
            "required": true,
            "var_type": [
              "list",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Divide By",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "labels",
            "label": "Labels",
            "usePair": true
          },
          {
            "name": "precision",
            "label": "Precision",
            "default": 3,
            "usePair": true
          }
        ]
      },
      "pd090": {
        "name": "Sample",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.sample(${n}${frac}${replace}${weights}${random_state}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "n",
            "label": "Number of Rows",
            "usePair": true
          },
          {
            "name": "frac",
            "label": "Percentage of Rows",
            "usePair": true
          },
          {
            "name": "replace",
            "label": "Replace Duplicates",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "weights",
            "label": "Weights",
            "usePair": true
          },
          {
            "name": "random_state",
            "label": "Random State",
            "var_type": [
              "RandomState"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          }
        ]
      },
      "pd091": {
        "name": "Get Dummies",
        "library": "pandas",
        "description": "One-Hot Encoding",
        "code": "${o0} = pd.get_dummies(${i0}${prefix}${prefix_sep}${dummy_na}${columns}${drop_first})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "prefix",
            "label": "Header Prefix",
            "usePair": true
          },
          {
            "name": "prefix_sep",
            "label": "Header Seperator",
            "default": "_",
            "usePair": true
          },
          {
            "name": "dummy_na",
            "label": "Dummy NA",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "columns",
            "label": "Columns",
            "usePair": true
          },
          {
            "name": "drop_first",
            "label": "Drop First Column",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          }
        ]
      },
      "pd092": {
        "name": ".Str",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.str",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd093": {
        "name": "Var",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.var(${axis}${skipna}${level}${ddof}${numeric_only})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy",
              "EWM",
              "Rolling"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "ddof",
            "label": "Delta",
            "index": 3,
            "usePair": true
          },
          {
            "name": "numeric_only",
            "label": "Include Numeric Only",
            "component": [
              "option_select"
            ],
            "options": [
              "None",
              "'True'",
              "'False'"
            ],
            "options_label": [
              "None",
              "Yes",
              "No"
            ],
            "default": "None",
            "usePair": true
          }
        ]
      },
      "pd094": {
        "name": "Prod",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.prod(${axis}${skipna}${level}${numeric_only}${min_count})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "skipna",
            "label": "Skip Na",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "numeric_only",
            "label": "Include Numeric Only",
            "component": [
              "option_select"
            ],
            "options": [
              "None",
              "'True'",
              "'False'"
            ],
            "options_label": [
              "None",
              "Yes",
              "No"
            ],
            "default": "None",
            "usePair": true
          },
          {
            "name": "min_count",
            "label": "Minimum Count",
            "default": 0,
            "usePair": true
          }
        ]
      },
      "pd095": {
        "name": "First",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.first(${i1})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "i1",
            "label": "Date Offset",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd096": {
        "name": "Last",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.last(${i1})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "i1",
            "label": "Date Offset",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdGrp_agg": {
        "name": "Aggregation",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.agg(${i1}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "i1",
            "label": "Aggregation Type",
            "required": true,
            "options": [
              "sum",
              "mean",
              "min",
              "max",
              "count",
              "std",
              "quantile"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          }
        ]
      },
      "pd098": {
        "name": "Transform",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.transform(${i1}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "i1",
            "label": "Aggregate Functions",
            "required": true,
            "options": [
              "sum",
              "mean",
              "min",
              "max",
              "count"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          }
        ]
      },
      "pdFunc_pivotTable": {
        "name": "Pivot Table",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.pivot_table(${values}${index}${columns}${aggfunc}${fill_value}${margins}${dropna}${margins_name})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "values",
            "label": "Values",
            "usePair": true
          },
          {
            "name": "index",
            "label": "Indexes",
            "usePair": true
          },
          {
            "name": "columns",
            "label": "Columns",
            "usePair": true
          },
          {
            "name": "aggfunc",
            "label": "Aggregate Functions",
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          },
          {
            "name": "margins",
            "label": "Margins",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "dropna",
            "label": "Drop Na",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "margins_name",
            "label": "Margins Name",
            "type": "text",
            "default": "All",
            "usePair": true
          }
        ]
      },
      "pd100": {
        "name": "CrossTable",
        "library": "pandas",
        "description": "",
        "code": "${o0} = pd.crosstab(${i0}, ${i1}${values}${rownames}${colnames}${aggfunc}${margins}${margins_name}${dropna}${normalize})",
        "options": [
          {
            "name": "i0",
            "label": "Index Series/list",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "list"
            ]
          },
          {
            "name": "i1",
            "label": "Column Series/list",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "list"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "values",
            "label": "Values",
            "usePair": true
          },
          {
            "name": "rownames",
            "label": "Row Names",
            "usePair": true
          },
          {
            "name": "colnames",
            "label": "Column Names",
            "usePair": true
          },
          {
            "name": "aggfunc",
            "label": "Aggregate Functions",
            "options": [
              "sum",
              "mean",
              "min",
              "max",
              "count"
            ],
            "usePair": true
          },
          {
            "name": "margins",
            "label": "Margins",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "margins_name",
            "label": "Margins Name",
            "type": "text",
            "default": "All",
            "usePair": true
          },
          {
            "name": "dropna",
            "label": "Drop Na",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "normalize",
            "label": "Normalize Rate",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pd101": {
        "name": "To Datetime",
        "library": "pandas",
        "description": "",
        "code": "${o0} = pd.to_datetime(${i0}${errors}${dayfirst}${yearfirst}${format})",
        "options": [
          {
            "name": "i0",
            "label": "Date List",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "list",
              "DataFrame",
              "Series",
              "int",
              "float",
              "text",
              "datetime"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "errors",
            "label": "Errors",
            "type": "text",
            "component": [
              "option_select"
            ],
            "default": "raise",
            "options": [
              "raise",
              "ignore",
              "coerce"
            ],
            "usePair": true
          },
          {
            "name": "dayfirst",
            "label": "Day First",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "yearfirst",
            "label": "Year First",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "format",
            "label": "Format",
            "type": "text",
            "help": "%d/%m/%Y",
            "usePair": true
          }
        ]
      },
      "pd102": {
        "name": "Is Unique",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.is_unique",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd103": {
        "name": "Resample",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.resample(${i1}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Offset",
            "required": true,
            "options": [
              "5T",
              "10T",
              "20T",
              "1H",
              "1D",
              "1W",
              "1M",
              "Q",
              "1Y"
            ],
            "options_label": [
              "5 min",
              "10 min",
              "20 min",
              "1 hour",
              "1 day",
              "1 week",
              "1 month",
              "1 quarter",
              "1 year"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          }
        ]
      },
      "pd104": {
        "name": "Shift",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.shift(${i1}${freq}${axis}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "i1",
            "label": "Shift Periods",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series"
            ]
          },
          {
            "name": "freq",
            "label": "Frequency Offset",
            "options": [
              "M",
              "D",
              "90T"
            ],
            "options_label": [
              "Month",
              "Day",
              "90 hour"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pd105": {
        "name": "TShift",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.tshift(${i1}${freq}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index",
              "GroupBy"
            ]
          },
          {
            "name": "i1",
            "label": "Shift Periods",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "DataFrame"
            ]
          },
          {
            "name": "freq",
            "label": "Frequency Offset",
            "options": [
              "M",
              "D",
              "90T"
            ],
            "options_label": [
              "Month",
              "Day",
              "90 hour"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          }
        ]
      },
      "pd106": {
        "name": "Date Shift Operation",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0} ${i1} ${i2}",
        "options": [
          {
            "name": "i0",
            "label": "First Date",
            "required": true,
            "options": [
              "datetime",
              "Day()",
              "MonthEnd()"
            ]
          },
          {
            "name": "i1",
            "label": "Shift Periods",
            "required": true,
            "component": [
              "option_select"
            ],
            "options": [
              "+",
              "-",
              "*",
              "/"
            ]
          },
          {
            "name": "i2",
            "label": "Second Date",
            "required": true,
            "options": [
              "datetime",
              "Day()",
              "MonthEnd()"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd107": {
        "name": "Timezone Localize",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.tz_localize(${i1}${axis}${level}${copy})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Timestamp",
              "DatetimeIndex"
            ]
          },
          {
            "name": "i1",
            "label": "Time Zone",
            "required": true,
            "options": [
              "UTC"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "DataFrame"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "copy",
            "label": "Copy",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pd108": {
        "name": "Timezone Convert",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.tz_convert(${i1}${axis}${level}${copy})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Timestamp",
              "DatetimeIndex"
            ]
          },
          {
            "name": "i1",
            "label": "Time Zone",
            "required": true,
            "options": [
              "UTC",
              "Asia/Seoul",
              "America/New_York",
              "Europe/Berlin"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "DataFrame"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          },
          {
            "name": "level",
            "label": "Level",
            "usePair": true
          },
          {
            "name": "copy",
            "label": "Copy",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pdParr_timestamp": {
        "name": "Timestamp",
        "library": "pandas",
        "description": "Create Timestamp object",
        "code": "${o0} = pd.Timestamp(${ts_input}${freq}${year}${month}${day}${hour}${minute}${second}${tz})",
        "options": [
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "ts_input",
            "label": "Timestamp Source",
            "usePair": true
          },
          {
            "name": "freq",
            "label": "Frequency Offset",
            "usePair": true
          },
          {
            "name": "year",
            "label": "Year",
            "usePair": true
          },
          {
            "name": "month",
            "label": "Month",
            "usePair": true
          },
          {
            "name": "day",
            "label": "Day",
            "usePair": true
          },
          {
            "name": "hour",
            "label": "Hour",
            "default": 0,
            "usePair": true
          },
          {
            "name": "minute",
            "label": "Minute",
            "default": 0,
            "usePair": true
          },
          {
            "name": "second",
            "label": "Second",
            "default": 0,
            "usePair": true
          },
          {
            "name": "tz",
            "label": "Time Zone",
            "usePair": true
          }
        ]
      },
      "pd110": {
        "name": "Period Range",
        "library": "pandas",
        "description": "",
        "code": "${o0} = pd.period_range(${start}${end}${periods}${freq}${name})",
        "options": [
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "start",
            "label": "Start",
            "type": "text",
            "usePair": true
          },
          {
            "name": "end",
            "label": "End",
            "type": "text",
            "usePair": true
          },
          {
            "name": "periods",
            "label": "Periods",
            "usePair": true
          },
          {
            "name": "freq",
            "label": "Frequency",
            "usePair": true
          },
          {
            "name": "name",
            "label": "PeriodIndex Name",
            "type": "text",
            "usePair": true
          }
        ]
      },
      "pd111": {
        "name": "as Frequency",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.asfreq(${i1}${method}${normalize}${fill_value})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Period",
              "PeriodIndex",
              "Resampler"
            ]
          },
          {
            "name": "i1",
            "label": "Frequency Offset",
            "required": true,
            "options": [
              "UTC",
              "Asia/Seoul",
              "America/New_York",
              "Europe/Berlin"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "Series",
              "DataFrame"
            ]
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "default": "None",
            "options": [
              "None",
              "'ffill'",
              "'bfill'"
            ],
            "usePair": true
          },
          {
            "name": "normalize",
            "label": "Normalize",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "fill_value",
            "label": "Fill Value",
            "usePair": true
          }
        ]
      },
      "pd112": {
        "name": "To Period",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.to_period(${freq}${axis}${copy})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Timestamp",
              "DatetimeIndex"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "freq",
            "label": "Frequency",
            "type": "text",
            "options": [
              "s",
              "T",
              "H",
              "D",
              "B",
              "W",
              "W-MON",
              "MS",
              "M",
              "BMS",
              "BM"
            ],
            "options_label": [
              "second",
              "minute",
              "hour",
              "day",
              "weekdays",
              "week(Sunday)",
              "week(Monday)",
              "first day of month",
              "last day of month",
              "first weekday of month",
              "last weekday of month"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          },
          {
            "name": "copy",
            "label": "Copy",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pd113": {
        "name": "To Timestamp",
        "library": "pandas",
        "description": "Convert from PeriodIndex to DatetimeIndex",
        "code": "${o0} = ${i0}.to_timestamp(${freq}${how}${axis}${copy})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Timestamp",
              "DatetimeIndex"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "freq",
            "label": "Frequency",
            "type": "text",
            "options": [
              "s",
              "T",
              "H",
              "D",
              "B",
              "W",
              "W-MON",
              "MS",
              "M",
              "BMS",
              "BM"
            ],
            "options_label": [
              "second",
              "minute",
              "hour",
              "day",
              "weekdays",
              "week(Sunday)",
              "week(Monday)",
              "first day of month",
              "last day of month",
              "first weekday of month",
              "last weekday of month"
            ],
            "usePair": true
          },
          {
            "name": "how",
            "label": "How",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "start",
              "end"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          },
          {
            "name": "copy",
            "label": "Copy",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          }
        ]
      },
      "pdParr_periodIndex": {
        "name": "PeriodIndex",
        "library": "pandas",
        "description": "Create PeriodIndex",
        "code": "${o0} = pd.PeriodIndex(${data}${copy}${freq}${year}${month}${quarter}${day}${hour}${minute}${second}${tz})",
        "options": [
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "data",
            "label": "Data",
            "usePair": true
          },
          {
            "name": "copy",
            "label": "Deep Copy",
            "component": [
              "bool_select"
            ],
            "index": 1,
            "default": "False",
            "usePair": true
          },
          {
            "name": "freq",
            "label": "Frequency",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "s",
              "T",
              "H",
              "D",
              "B",
              "W",
              "W-MON",
              "MS",
              "M",
              "BMS",
              "BM"
            ],
            "options_label": [
              "second",
              "minute",
              "hour",
              "day",
              "weekdays",
              "week(Sunday)",
              "week(Monday)",
              "first day of month",
              "last day of month",
              "first weekday of month",
              "last weekday of month"
            ],
            "usePair": true
          },
          {
            "name": "year",
            "label": "Year",
            "usePair": true
          },
          {
            "name": "month",
            "label": "Month",
            "usePair": true
          },
          {
            "name": "quarter",
            "label": "Quarter",
            "usePair": true
          },
          {
            "name": "day",
            "label": "Day",
            "usePair": true
          },
          {
            "name": "hour",
            "label": "Hour",
            "default": 0,
            "usePair": true
          },
          {
            "name": "minute",
            "label": "Minute",
            "default": 0,
            "usePair": true
          },
          {
            "name": "second",
            "label": "Second",
            "default": 0,
            "usePair": true
          },
          {
            "name": "tz",
            "label": "Timezone",
            "usePair": true
          }
        ]
      },
      "pd115": {
        "name": "Rolling",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.rolling(${i1}${min_periods}${center}${win_type}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "Data Count",
            "required": true
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "min_periods",
            "label": "Minimum Periods",
            "usePair": true
          },
          {
            "name": "center",
            "label": "Center",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "win_type",
            "label": "Rolling View Type",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "boxcar",
              "triang",
              "blackman",
              "hamming",
              "bartlett",
              "parzen",
              "bohman",
              "blackmanharris",
              "nuttall",
              "barthann"
            ],
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "default": 0,
            "usePair": true
          }
        ]
      },
      "pd116": {
        "name": "EWM",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.ewm(${com}${span}${halflife}${alpha}${min_periods}${adjust}${ignore_na}${axis})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "com",
            "label": "Com",
            "help": "com≥0, α=1/(1+com)",
            "usePair": true
          },
          {
            "name": "span",
            "label": "Span",
            "help": "span≥1, α=2/(span+1)",
            "usePair": true
          },
          {
            "name": "halflife",
            "label": "Half Life",
            "help": "halflife>0, α=1−exp(log(0.5)/halflife)",
            "usePair": true
          },
          {
            "name": "alpha",
            "label": "Alpha",
            "help": "0<α≤1",
            "usePair": true
          },
          {
            "name": "min_periods",
            "label": "Minimum Periods",
            "help": "",
            "default": 0,
            "usePair": true
          },
          {
            "name": "adjust",
            "label": "Adjust",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "ignore_na",
            "label": "Ignore NA",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "default": 0,
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          }
        ]
      },
      "pd117": {
        "name": "PCT Change",
        "library": "pandas",
        "description": "",
        "code": "${o0} = ${i0}.pct_change(${periods}${fill_method}${limit}${freq})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "periods",
            "label": "Periods",
            "default": 1,
            "usePair": true
          },
          {
            "name": "fill_method",
            "label": "Fill Method",
            "type": "text",
            "default": "ffill",
            "options": [
              "'ffill'",
              "'bfill'"
            ],
            "options_label": [
              "fill with front value",
              "fill with back value"
            ],
            "usePair": true
          },
          {
            "name": "limit",
            "label": "Limit",
            "usePair": true
          },
          {
            "name": "freq",
            "label": "Frequency",
            "options": [
              "s",
              "T",
              "H",
              "D",
              "B",
              "W",
              "W-MON",
              "MS",
              "M",
              "BMS",
              "BM"
            ],
            "options_label": [
              "second",
              "minute",
              "hour",
              "day",
              "weekdays",
              "week(Sunday)",
              "week(Monday)",
              "first day of month",
              "last day of month",
              "first weekday of month",
              "last weekday of month"
            ],
            "usePair": true
          }
        ]
      },
      "pd118": {
        "name": "Correlation",
        "library": "pandas",
        "description": "correlation between columns",
        "code": "${o0} = ${i0}.corr(${method}${min_periods})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "GroupBy",
              "EWM"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "default": "pearson",
            "options": [
              "pearson",
              "kendall",
              "spearman"
            ],
            "usePair": true
          },
          {
            "name": "min_periods",
            "label": "Minimum Periods",
            "usePair": true
          }
        ]
      },
      "pd119": {
        "name": "Correlation With",
        "library": "pandas",
        "description": "correlation",
        "code": "${o0} = ${i0}.corrwith(${i1}${axis}${drop}${method})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "DataFrameGroupBy"
            ]
          },
          {
            "name": "i1",
            "label": "Object To Compare",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "DataFrameGroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "axis",
            "label": "Axis",
            "component": [
              "option_select"
            ],
            "default": 0,
            "options": [
              0,
              1
            ],
            "options_label": [
              "row",
              "column"
            ],
            "usePair": true
          },
          {
            "name": "drop",
            "label": "Drop Empty",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "method",
            "label": "Method",
            "component": [
              "option_select"
            ],
            "default": "pearson",
            "options": [
              "pearson",
              "kendall",
              "spearman"
            ],
            "usePair": true
          }
        ]
      },
      "pd120": {
        "name": "Covariance",
        "library": "pandas",
        "description": "covariance between all features",
        "code": "${o0} = ${i0}.cov(${min_periods})",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "DataFrameGroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "min_periods",
            "label": "Minimum Periods",
            "usePair": true
          }
        ]
      },
      "pd_plot": {
        "name": "Plot",
        "library": "pandas",
        "description": "create chart",
        "code": "${i0}.plot(${kind}${title}${figsize}${fontsize}${colormap}${grid}${legend}${rot}${xlabel}${ylabel}${xlim}${ylim}${xticks}${yticks}${style}${x}${y}${subplots}${layout}${use_index}${stacked}${etc})\nplt.show()",
        "options": [
          {
            "name": "i0",
            "label": "DataFrame",
            "required": true,
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "kind",
            "label": "Chart Type",
            "type": "text",
            "component": [
              "option_select"
            ],
            "default": "line",
            "options": [
              "line",
              "bar",
              "barh",
              "hist",
              "box",
              "kde",
              "area",
              "pie",
              "scatter",
              "hexbin"
            ],
            "options_label": [
              "Line",
              "Bar",
              "Barh",
              "Hist",
              "Box",
              "Kernel Density Estimation",
              "Area",
              "Pie",
              "Scatter",
              "Hexbin"
            ],
            "usePair": true
          },
          {
            "name": "title",
            "label": "Chart Title",
            "type": "text",
            "usePair": true
          },
          {
            "name": "figsize",
            "label": "Figure Size",
            "placeholder": "(width, height)",
            "usePair": true
          },
          {
            "name": "fontsize",
            "label": "Font Size",
            "component": [
              "input_number"
            ],
            "usePair": true
          },
          {
            "name": "colormap",
            "label": "Color Map",
            "type": "text",
            "component": [
              "option_select"
            ],
            "options": [
              "",
              "viridis",
              "plasma",
              "inferno",
              "magma",
              "cividis",
              "Pastel1",
              "Pastel2",
              "Paired",
              "Accent",
              "Dark2",
              "Set1",
              "Set2",
              "Set3",
              "tab10",
              "tab20",
              "tab20b",
              "tab20c"
            ],
            "options_label": [
              "Select option...",
              "viridis",
              "plasma",
              "inferno",
              "magma",
              "cividis",
              "Pastel1",
              "Pastel2",
              "Paired",
              "Accent",
              "Dark2",
              "Set1",
              "Set2",
              "Set3",
              "tab10",
              "tab20",
              "tab20b",
              "tab20c"
            ],
            "usePair": true
          },
          {
            "name": "grid",
            "label": "Show Grid",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "legend",
            "label": "Show Legend",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "rot",
            "label": "X Label Rotation",
            "component": [
              "input_number"
            ],
            "usePair": true
          },
          {
            "name": "xlabel",
            "label": "X Label",
            "type": "text",
            "usePair": true
          },
          {
            "name": "ylabel",
            "label": "Y Label",
            "type": "text",
            "usePair": true
          },
          {
            "name": "xlim",
            "label": "X Limit",
            "placeholder": "(start, end)",
            "usePair": true
          },
          {
            "name": "ylim",
            "label": "Y Limit",
            "placeholder": "(start, end)",
            "usePair": true
          },
          {
            "name": "xticks",
            "label": "X Ticks",
            "placeholder": "['tick', ...]",
            "usePair": true
          },
          {
            "name": "yticks",
            "label": "Y Ticks",
            "placeholder": "['tick', ...]",
            "usePair": true
          },
          {
            "name": "style",
            "label": "Style",
            "placeholder": "[\"-\", \"--\", \"-.\", \":\"]",
            "help": "Length of columns and style list must be same",
            "usePair": true
          },
          {
            "name": "x",
            "label": "X Column",
            "usePair": true
          },
          {
            "name": "y",
            "label": "Y Column",
            "usePair": true
          },
          {
            "name": "subplots",
            "label": "Subplots Per Column",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          },
          {
            "name": "layout",
            "label": "Subplot Layout",
            "placeholder": "(row, column)",
            "usePair": true
          },
          {
            "name": "use_index",
            "label": "Use Index On X Ticks",
            "component": [
              "bool_select"
            ],
            "default": "True",
            "usePair": true
          },
          {
            "name": "stacked",
            "label": "Stacked",
            "component": [
              "bool_select"
            ],
            "default": "False",
            "usePair": true
          }
        ]
      },
      "pd123": {
        "name": "Read Excel",
        "library": "pandas",
        "description": "excel to pandas object",
        "code": "${o0} = pd.read_excel(${i0}${sheet_name}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "File Path",
            "required": true,
            "type": "text",
            "component": [
              "file"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          },
          {
            "name": "sheet_name",
            "label": "Sheet Name",
            "type": "text",
            "usePair": true
          }
        ]
      },
      "pd124": {
        "name": "To Excel",
        "library": [
          "pandas",
          "xlwt",
          "openpyxl"
        ],
        "description": "DataFrame to excel file",
        "code": "${i0}.to_excel(${i1}${sheet_name}${etc})",
        "options": [
          {
            "name": "i0",
            "label": "DataFrame",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series"
            ]
          },
          {
            "name": "i1",
            "label": "File Path",
            "required": true,
            "type": "text",
            "component": [
              "file"
            ]
          },
          {
            "name": "sheet_name",
            "label": "Sheet Name",
            "type": "text",
            "usePair": true
          }
        ]
      },
      "pd125": {
        "name": "Subset",
        "library": "pandas",
        "description": "subset pandas object",
        "code": "${o0} = ${i0}",
        "options": [
          {
            "name": "i0",
            "label": "Subset Code",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pd126": {
        "name": "Frame Editor",
        "library": "pandas",
        "description": "pandas object editor",
        "code": "${o0} = ${i0}",
        "options": [
          {
            "name": "i0",
            "label": "Code",
            "required": true,
            "component": [
              "textarea"
            ],
            "var_type": [
              "DataFrame"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdIdt_size": {
        "name": "Size",
        "library": "pandas",
        "description": "pandas object size info",
        "code": "${o0} = ${i0}.size",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "DataFrame",
              "Series",
              "Index"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      },
      "pdGrp_size": {
        "name": "Size",
        "library": "pandas",
        "description": "groupby size info",
        "code": "${o0} = ${i0}.size()",
        "options": [
          {
            "name": "i0",
            "label": "Target Variable",
            "required": true,
            "component": [
              "data_select"
            ],
            "var_type": [
              "GroupBy"
            ]
          },
          {
            "name": "o0",
            "label": "Allocate to",
            "output": true,
            "component": [
              "data_select"
            ]
          }
        ]
      }
    }

    return {
        PANDAS_FUNCTION: PANDAS_FUNCTION
    };
});