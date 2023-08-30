#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : build.sh
#    Author          : Black Logic - Minju
#    Note            : Build Visual Python for All
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
#=============================================================================
# Set version and replace it
#=============================================================================
VP_ORG_VER=2.4.7
VP_NEW_VER=2.4.8

# update version info
grep -REil "VP_ORG_VER=.+$" colab/build.colab.sh jupyterlab/build.jupyterlab.sh jupyternotebook/build.jupyternotebook.sh | xargs sed -i "s/VP_ORG_VER=.\+$/VP_ORG_VER=${VP_ORG_VER}/g"
grep -REil "VP_NEW_VER=.+$" colab/build.colab.sh jupyterlab/build.jupyterlab.sh jupyternotebook/build.jupyternotebook.sh | xargs sed -i "s/VP_NEW_VER=.\+$/VP_NEW_VER=${VP_NEW_VER}/g"

TEMP_PWD=$PWD

#=============================================================================
# Build Visual Python for Colab
#=============================================================================
cd $TEMP_PWD/colab
./build.colab.sh

#=============================================================================
# Build Visual Python for Jupyter Notebook
#=============================================================================
cd $TEMP_PWD/jupyternotebook
./build.jupyternotebook.sh

#=============================================================================
# Build Visual Python for Jupyter Lab
#=============================================================================
cd $TEMP_PWD/jupyterlab
./build.jupyterlab.sh

#=============================================================================
# Upload (for maintainer only)
#=============================================================================
## jupyternotebook
# python -m twine upload dist/jupyternotebook/dist/*

## jupyterlab
# python -m twine upload dist/jupyterlab/*

## colab
## upload on chrome web store with blacklogic.dev

#=============================================================================
# Commit Release (for maintainer only)
#=============================================================================
# git add .
# git commit -m "deploy visualpython ${VP_NEW_VER}"
# git push origin devops
# git checkout -b release
# git push origin release

exit 0

# End of file
