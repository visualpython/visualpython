#
#    Project Name    : Visual Python
#    Description     : GUI-based Python code generator
#    File Name       : build.jupyterlab.sh
#    Author          : Black Logic - Minju
#    Note            : Build Visual Python for Jupyter Lab
#    License         : GPLv3 (GNU General Public License v3.0)
#    Date            : 2023. 02. 08
#    Change Date     :
#
#=============================================================================
# Replace Version and Basic Files
#=============================================================================
VP_ORG_VER=2.3.4
VP_NEW_VER=2.3.5

# update version info
grep -REil "\"version\": \"${VP_ORG_VER}\"" package.json | xargs sed -i "s/\"version\": \"${VP_ORG_VER//\./\\.}\"/\"version\": \"${VP_NEW_VER}\"/g"
grep -REil "version = \"${VP_ORG_VER}\"" pyproject.toml | xargs sed -i "s/version = \"${VP_ORG_VER//\./\\.}\"/version = \"${VP_NEW_VER}\"/g"
grep -REil "current = \"${VP_ORG_VER}\"" pyproject.toml | xargs sed -i "s/current = \"${VP_ORG_VER//\./\\.}\"/current = \"${VP_NEW_VER}\"/g"
grep -REil ${VP_ORG_VER//\./\\.} ../visualpython/* | xargs sed -i "s/${VP_ORG_VER//\./\\.}/${VP_NEW_VER}/g"

# update LICENSE, README.md files
cp ../LICENSE LICENSE
cp ../README.md README.md

#=============================================================================
# Build output for Jupyter Lab
#=============================================================================
# Run dev-build script to build static files to ./visualpython/labextension
# chmod 755 dev-build.jupyterlab.sh
./dev-build.jupyterlab.sh

# make dist directory if not exist
mkdir -p ../dist/jupyterlab

# on conda environment, install build package
pip install build

# build file for pypi jupyterlab-visualpython
python -m build --outdir ../dist/jupyterlab

exit 0
# End of file
