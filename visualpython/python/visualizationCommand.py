import numpy as _vp_np
def _vp_seaborn_show_values(axs, precision=1, space=0.01):
    """
    Show values on Seaborn plots
    - inner function for showing preview on Seaborn app
    """
    pstr = '{:.' + str(precision) + 'f}'
    
    def _single(ax):
        # check orient
        orient = 'v'
        if len(ax.patches) == 1:
            # check if 0
            if ax.patches[0].get_x() == 0:
                orient = 'h'
        else:
            # compare 0, 1 patches
            p0 = ax.patches[0]
            p1 = ax.patches[1]
            if p0.get_x() == p1.get_x():
                orient = 'h'
                
        if orient == 'v':
            for p in ax.patches:
                _x = p.get_x() + p.get_width() / 2
                _y = p.get_y() + p.get_height() + (p.get_height()*space)
                if not _vp_np.isnan(_x) and not _vp_np.isnan(_y):
                    value = pstr.format(p.get_height())
                    ax.text(_x, _y, value, ha='center') 
        elif orient == 'h':
            for p in ax.patches:
                _x = p.get_x() + p.get_width() + (space - 0.01)
                _y = p.get_y() + p.get_height() / 2
                if not _vp_np.isnan(_x) and not _vp_np.isnan(_y):
                    value = pstr.format(p.get_width())
                    ax.text(_x, _y, value, ha='left')

    if isinstance(axs, _vp_np.ndarray):
        for idx, ax in _vp_np.ndenumerate(axs):
            _single(ax)
    else:
        _single(axs)