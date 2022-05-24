# Libraries
import numpy as _vp_np
import json as _vp_json
import warnings as _vp_warnings

class _VpNpEncoder(_vp_json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, _vp_np.integer):
            return int(obj)
        if isinstance(obj, _vp_np.floating):
            return float(obj)
        if isinstance(obj, _vp_np.ndarray):
            return obj.tolist()
        return super(_VpNpEncoder, self).default(obj)

def _vp_print(command):
    """
    Print with json.dumps
    - prevent converting hangeul to unicode
    """
    with _vp_warnings.catch_warnings():
        _vp_warnings.simplefilter(action='ignore', category=FutureWarning)
        print(_vp_json.dumps(command, ensure_ascii=False, cls=_VpNpEncoder))