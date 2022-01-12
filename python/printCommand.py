# Libraries
import json as _vp_json
import warnings as _vp_warnings

def _vp_print(command):
    """
    Print with json.dumps
    - prevent converting hangeul to unicode
    """
    with _vp_warnings.catch_warnings():
        _vp_warnings.simplefilter(action='ignore', category=FutureWarning)
        print(_vp_json.dumps(command, ensure_ascii=False))