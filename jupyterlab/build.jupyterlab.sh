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
export VP_ORG_VER=2.2.12
export VP_NEW_VER=2.2.13

# on conda environment
pip install build

# update LICENSE, README.md files
cp ../LICENSE LICENSE
cp ../README.md README.md

# update version info
grep -REil ${VP_ORG_VER//\./\\.} setup.py visualpython/* | xargs sed -i --follow-symlinks "s/${VP_ORG_VER//\./\\.}/${VP_NEW_VER}/g"

mkdir -p ../dist/jupyterlab

# run build as static files
# npm install   # install npm package dependencies
# npm run build  # optional build step if using TypeScript, babel, etc.
# jupyter labextension install  # install the current directory as an extension
jlpm run build

# build file to output dir
python -m build --outdir ../dist/jupyterlab

exit 0
# End of file
