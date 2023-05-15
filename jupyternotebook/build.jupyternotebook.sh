#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : build.jupyternotebook.sh
#    Author          : Black Logic - Minju
#    Note            : Build Visual Python for Jupyter Notebook
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
#=============================================================================
# Replace Version and Basic Files
#=============================================================================
VP_ORG_VER=2.3.6
VP_NEW_VER=2.3.7

# update version info
grep -REil ${VP_ORG_VER//\./\\.} setup.py visualpython/js/com/com_Config.js visualpython/js/com/com_Const.js | xargs sed -i --follow-symlinks "s/${VP_ORG_VER//\./\\.}/${VP_NEW_VER}/g"

# update LICENSE, README.md files
cp ../LICENSE LICENSE
cp ../README.md README.md

# add _init_.py
find visualpython -depth -type d | grep -v 'git' | awk '{printf "echo \"print('\''Visual Python'\'')\" > %s/__init__.py\n", $1}' | sh

# convert 
sed -i -e --follow-symlinks 's/\r$//' visualpython/bin/visualpy

#=============================================================================
# Build output for Jupyter Notebook
#=============================================================================
# build
python setup.py sdist bdist_wheel 

# make dir
mkdir -p ../dist/jupyternotebook

# rm previous dist
rm -rf ../dist/jupyternotebook/*

# mv to dist folder
mv ./dist ../dist/jupyternotebook/
mv ./build ../dist/jupyternotebook/
mv ./visualpython.egg-info ../dist/jupyternotebook/
#=============================================================================
# Upload pypi version
#=============================================================================
# upload pypi # uploading is only permissioned to maintainer
# python -m twine upload ../dist/jupyternotebook/dist/*

exit 0
# End of file
