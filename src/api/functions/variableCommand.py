"""
Search Variables
"""

_VP_NOT_USING_VAR = ['_html', '_nms', 'NamespaceMagics', '_Jupyter', 'In', 'Out', 'exit', 'quit', 'get_ipython']
_VP_NOT_USING_TYPES = ['module', 'function', 'builtin_function_or_method', 'instance', '_Feature', 'type', 'ufunc']

def _vp_load_instance(var=''):
    """
    load Variables with dir(globals)
    """
    # _VP_NOT_USING_VAR = ['_html', '_nms', 'NamespaceMagics', '_Jupyter', 'In', 'Out', 'exit', 'quit', 'get_ipython']
    varList = []
    query = ''
    result = {}
    if var == '':
        varList = sorted(globals())
        # result = { 'type': 'NoneType', 'list': [{'name': v, 'type': type(eval(v)).__name__} for v in _vp_vars if (not v.startswith('_')) and (v not in _VP_NOT_USING_VAR)] }
        result = {'type': 'NoneType', 'list': []}
    else:
        varList = dir(eval(var))
        query = var + '.'
        # result = { 'type': type(eval(var)).__name__, 'list': [{'name': v, 'type': type(eval(var + '.' + v)).__name__} for v in _vp_vars if (not v.startswith('_')) and (v not in _VP_NOT_USING_VAR)] }
        result = {'type': type(eval(var)).__name__, 'list': []}

    tmpList = []
    for v in varList:
        try:
            if (not v.startswith('_')) and (v not in _VP_NOT_USING_VAR):
                tmpList.append({'name': v, 'type': type(eval(query + v)).__name__ })
        except Exception as e:
            continue
    result['list'] = tmpList

    return result

def _vp_get_type(var=None):
    """
    get type name
    """
    return str(type(var).__name__)


def _vp_get_variables_list(types):
    """
    Get Variable list in types
    """
    # notUsingVariables = ['_html', '_nms', 'NamespaceMagics', '_Jupyter', 'In', 'Out', 'exit', 'quit', 'get_ipython']
    # notUsingTypes = ['module', 'function', 'builtin_function_or_method', 'instance', '_Feature', 'type', 'ufunc']

    varList = []
    searchList = globals()
    if (type(types) == list) and (len(types) > 0):
        varList = [{'varName': v, 'varType': type(eval(v)).__name__} for v in searchList if (not v.startswith('_')) & (v not in _VP_NOT_USING_VAR) & (type(eval(v)).__name__ in types)]
    else:
        varList = [{'varName': v, 'varType': type(eval(v)).__name__} for v in searchList if (not v.startswith('_')) & (v not in _VP_NOT_USING_VAR) & (type(eval(v)).__name__ not in _VP_NOT_USING_TYPES)]

    return varList

def _vp_get_profiling_list():
    """
    Get profiling variable list
    """
    varList = _vp_get_variables_list(['ProfileReport'])
    result = []
    for v in varList:
        title = eval(v['varName']).get_description()['analysis']['title']
        result.append({ 'varName': v['varName'], 'title': title })

    return result
    