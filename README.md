<!--
#========================================================================
# Filename : README.md
# function : control visualpython for Mac/Linux
# Creator  : BlackLogic  - LJ
# version  : 2.0
# License  : GPLv3
# Date     : 2020 07.27
# Mdate    : 2020 12.24
#========================================================================
-->

# 1. Install Package ( windows / Linux / Mac )
### 1.1. requirements
> - Python 3.x
> - jupyter notebook or anaconda env <br>
>   _pip install jupyter_ <br>
>   or <br>
>   _python -m pip install --user jupyter_ <br>
>
>   _pip3 install jupyter_  <br>
>   or <br>
>   _python3 -m pip install --user jupyter_ <br>

### 1.2. Install VisualPython package
> **[pip / conda]** <br>
> _pip install visualpython_

### 1.3. Optional package
* jupyter_contrib_nbextensions<br>
* Install to manage nbtextensions visually.
>> **[pip]**<br>
>>  _pip install jupyter_contrib_nbextensions <br>_
   _jupyter contrib nbextension install --user_ <br>
>> **[conda - anaconda env]** <br>
> _conda install -c conda-forge jupyter_contrib_nbextensions_ <br>
   _jupyter contrib nbextension install --user_

# 2. Package controller for Linux/Mac/Windows
### 2.1. VisualPython contoller info

> **usage: _visualpy [option]_** <br>

```
  optional arguments:
   -h,   help       - show this help message and exit
   -e,   enable     - enable VisualPython
   -d,   disable    - disable VisualPython
   -i,   install    - install VisualPython extensions
   -un,  uninstall  - uninstall VisualPython packages
   -up,  upgrade    - upgrade VisualPython Package
   -v,   version    - show VisualPython current version
```

### 2.2. Activate VisualPython
> _visualpy install_ <br>
> or <br>
> _visualpy -i_

### 2.3. Disable VisualPython
> _visualpy disable_ <br>
> or <br>
> _visualpy -d_

### 2.4. Enable VisualPython extension
> _visualpy enable_ <br>
> or <br>
> _visualpy -e_

### 2.5. Upgrade VisualPython package version
> _visualpy upgrade_ <br>
> or <br>
> _visualpy -up_

### 2.6. Uninstall VisualPython package
> _visualpy uninstall_ <br>
> or <br>
> _visualpy -un_
