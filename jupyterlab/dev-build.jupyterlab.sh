#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : dev-build.jupyterlab.sh
#    Author          : Black Logic - Minju
#    Note            : Dev-Build Visual Python for Jupyter Lab
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
#=============================================================================
# Replace Source Code and Loader pattern
#=============================================================================
# cp current core source code
rm -rf lib/visualpython
cp -r ../visualpython lib/visualpython

# convert text-loader, raw-loader, css-loader
grep -rl "__VP_TEXT_LOADER__" lib/visualpython/js/* | xargs sed -i "s/__VP_TEXT_LOADER__('\(.\+\)')\(.\+$\)/'!!text-loader!\1'\2/g"
grep -rl "__VP_RAW_LOADER__" lib/visualpython/js/* | xargs sed -i "s/__VP_RAW_LOADER__('\(.\+\)')\(.\+$\)/'\1'\2/g"
grep -rl "__VP_CSS_LOADER__" lib/visualpython/js/* | xargs sed -i "s/__VP_CSS_LOADER__('\(.\+\)')\(.\+$\)/'\1.css'\2/g"

#=============================================================================
# Build as development version (output dir to ./visualpython/labextension)
# Requirements:
# - nodejs, npm, jupyterlab (conda or jupyter)
# ----------------------------------------------------------------------------
# * Install nodejs, npm for linux(ubuntu)
# sudo apt update
# sudo apt install nodejs
# sudo apt install npm          # need npm/nodejs to build extension
# ----------------------------------------------------------------------------
# * Install nodejs, npm for WSL2
# sudo apt-get install curl
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash   # install nvm
# nvm install 16.15.1      # install node 16.15.1
#=============================================================================
# python -m pip install jupyterlab
# npm install                   # install npm package dependencies
# npm run build                 # optional build step if using TypeScript, babel, etc.
# jupyter labextension install  # install the current directory as an extension

# Run Build for jupyterlab extension
jlpm run build